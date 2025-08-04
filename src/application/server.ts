import express from 'express';
import chalk from 'chalk';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { Server } from 'http';
import { Config } from '../domain/config';
import { logToFile } from '../domain/logs';

export async function startServer(cfg: Config): Promise<Server> {
  const app = express();

  if (cfg.log) {
    console.log(chalk.green(`Proxy configuration: ${JSON.stringify(cfg, null, 2)}`));
  }
  if (cfg.cors) {
    const corsOptions: any = {};
    if (cfg.cors.origin) corsOptions.origin = cfg.cors.origin;
    if (cfg.cors.methods) corsOptions.methods = cfg.cors.methods;
    if (cfg.cors.allowedHeaders) corsOptions.allowedHeaders = cfg.cors.allowedHeaders;
    app.use(cors(corsOptions));
  }
  const colors = [chalk.cyan, chalk.magenta, chalk.yellow, chalk.green];

  Object.entries(cfg.nodes).forEach(([node, dest], idx) => {
    const color = colors[idx % colors.length];
    const prefix = node.startsWith('/') ? node : '/' + node;

    const options = {
      target: dest,
      changeOrigin: true,
      pathRewrite: (p: string) => p.replace(new RegExp('^' + prefix), ''),
    };

    if (cfg.log) {
      const displayOptions = {
        target: dest,
        changeOrigin: true,
        pathRewrite: `^${prefix} -> ''`
      };
      console.log(color(`Proxy config for ${prefix}: ${JSON.stringify(displayOptions, null, 2)}`));
    }

    app.use(prefix, createProxyMiddleware({
      ...options,
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
