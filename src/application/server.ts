import express from 'express';
import chalk from 'chalk';
import util from 'util';
import { IncomingMessage } from 'http';
import { Config } from '../domain/config';
import { logToFile } from '../domain/logs';

function logger(context: string, message: string, color: (s: string) => string = chalk.white) {
  const pid = process.pid;
  const timestamp = new Date().toISOString();
  const level = chalk.green('LOG');
  const ctx = color(`[${context}]`);
  console.log(`[Nest] ${pid}   - ${timestamp}   ${level} ${ctx} ${message}`);
}

export async function startServer(cfg: Config) {
  // Avoid Node deprecation warning by replacing the deprecated util._extend
  // used by the http-proxy dependency with Object.assign before requiring it.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((util as any)._extend) {
    (util as any)._extend = Object.assign;
  }

  // Load http-proxy-middleware after patching util._extend.
  const { createProxyMiddleware } = await import('http-proxy-middleware');

  const app = express();
  const colors = [chalk.cyan, chalk.magenta, chalk.yellow, chalk.green];
  const requestTimings = new WeakMap<IncomingMessage, number>();

  cfg.nodes.forEach((node, idx) => {
    const dest = cfg.destinies[idx];
    const color = colors[idx % colors.length];
    const prefix = node.startsWith('/') ? node : '/' + node;

    app.use(prefix, createProxyMiddleware({
      target: dest,
      changeOrigin: true,
      pathRewrite: (p) => p.replace(new RegExp('^' + prefix), ''),
      onProxyReq: (_, req) => {
        const msg = `${req.method} ${req.originalUrl} -> ${dest}`;
        if (cfg.log) logger('Request', msg, color);
        logToFile(node, `${new Date().toISOString()} ${msg}`);
        requestTimings.set(req, Date.now());
      },
      onProxyRes: (proxyRes, req) => {
        const start = requestTimings.get(req) || Date.now();
        requestTimings.delete(req);
        const ms = Date.now() - start;
        const msg = `${req.method} ${req.originalUrl} ${proxyRes.statusCode} +${ms}ms`;
        if (cfg.log) logger('Response', msg, color);
        logToFile(node, `${new Date().toISOString()} ${msg}`);
      },
      onError: (err, req, res) => {
        const start = requestTimings.get(req) || Date.now();
        requestTimings.delete(req);
        const ms = Date.now() - start;
        const msg = `${req.method} ${req.originalUrl} 502 +${ms}ms`;
        if (cfg.log) logger('Response', msg, color);
        logToFile(node, `${new Date().toISOString()} ${msg}`);
        console.error('Proxy error:', err.message);
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Bad gateway\n');
      }
    }));
  });

  app.listen(cfg.port, () => {
    console.log(chalk.blue(`API Gateway running on port ${cfg.port}`));
  });
}
