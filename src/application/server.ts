import express from 'express';
import chalk from 'chalk';
import util from 'util';
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
  if ('_extend' in util) {
    (util as typeof util & { _extend?: typeof Object.assign })._extend = Object.assign;
  }

  // Load http-proxy-middleware after patching util._extend.
  const { createProxyMiddleware } = await import('http-proxy-middleware');

  const app = express();
  const colors = [chalk.cyan, chalk.magenta, chalk.yellow, chalk.green];

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
        requestTimings.set(req, Date.now()); // Store start time in WeakMap
      },
      onProxyRes: (proxyRes, req) => {
        const start = requestTimings.get(req) || Date.now(); // Retrieve start time
        const ms = Date.now() - start;
        const msg = `${req.method} ${req.originalUrl} ${proxyRes.statusCode} +${ms}ms`;
        if (cfg.log) logger('Response', msg, color);
        logToFile(node, `${new Date().toISOString()} ${msg}`);
      },
      onError: (err, _req, res) => {
        const start = requestTimings.get(_req) || Date.now(); // Retrieve start time
        const ms = Date.now() - start;
        const msg = `${_req.method} ${_req.originalUrl} 502 +${ms}ms`;
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
