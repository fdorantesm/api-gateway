import express from 'express';
import chalk from 'chalk';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Config } from '../domain/config';
import { logToFile } from '../domain/logs';

export async function startServer(cfg: Config) {
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
        if (cfg.log) console.log(color(msg));
        logToFile(node, `${new Date().toISOString()} ${msg}`);
      }
    }));
  });

  app.listen(cfg.port, () => {
    console.log(chalk.blue(`API Gateway running on port ${cfg.port}`));
  });
}
