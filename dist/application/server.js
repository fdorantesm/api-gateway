"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const express_1 = __importDefault(require("express"));
const chalk_1 = __importDefault(require("chalk"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const logs_1 = require("../domain/logs");
async function startServer(cfg) {
    const app = (0, express_1.default)();
    const colors = [chalk_1.default.cyan, chalk_1.default.magenta, chalk_1.default.yellow, chalk_1.default.green];
    cfg.nodes.forEach((node, idx) => {
        const dest = cfg.destinies[idx];
        const color = colors[idx % colors.length];
        const prefix = node.startsWith('/') ? node : '/' + node;
        app.use(prefix, (0, http_proxy_middleware_1.createProxyMiddleware)({
            target: dest,
            changeOrigin: true,
            pathRewrite: (p) => p.replace(new RegExp('^' + prefix), ''),
            onProxyReq: (_, req) => {
                const msg = `${req.method} ${req.originalUrl} -> ${dest}`;
                if (cfg.log)
                    console.log(color(msg));
                (0, logs_1.logToFile)(node, `${new Date().toISOString()} ${msg}`);
            }
        }));
    });
    app.listen(cfg.port, () => {
        console.log(chalk_1.default.blue(`API Gateway running on port ${cfg.port}`));
    });
}
