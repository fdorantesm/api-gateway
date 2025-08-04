import express from 'express';
import chalk from 'chalk';
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { Server } from 'http';
import { Config } from '../domain/config';
import { logToFile } from '../domain/logs';

export async function startServer(cfg: Config): Promise<Server> {
  const app = express();
  const colors = [chalk.cyan, chalk.magenta, chalk.yellow, chalk.green];

  Object.entries(cfg.nodes).forEach(([node, dest], idx) => {
    const color = colors[idx % colors.length];
    const prefix = node.startsWith('/') ? node : '/' + node;

    app.use(prefix, createProxyMiddleware({
      target: dest,
      changeOrigin: true,
      pathRewrite: (p) => p.replace(new RegExp('^' + prefix), ''),
      onProxyReq: (_, req) => {
        const msg = `${req.method} ${req.originalUrl} \u2192 ${dest}`;
        if (cfg.log) console.log(color(msg));
        logToFile(node, `${new Date().toISOString()} ${msg}`);
      }
    }));
  });

  return await new Promise<Server>((resolve) => {
    const server = app.listen(cfg.port, () => {
      console.log(chalk.blue(`API Gateway running on port ${cfg.port}`));
      resolve(server);
    });
  });
}
