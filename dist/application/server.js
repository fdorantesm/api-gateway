"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const express_1 = __importDefault(require("express"));
const chalk_1 = __importDefault(require("chalk"));
const cors_1 = __importDefault(require("cors"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const logs_1 = require("../domain/logs");
async function startServer(cfg) {
    const app = (0, express_1.default)();
    if (cfg.cors) {
        const corsOptions = {};
        if (cfg.cors.origin)
            corsOptions.origin = cfg.cors.origin;
        if (cfg.cors.methods)
            corsOptions.methods = cfg.cors.methods;
        if (cfg.cors.allowedHeaders)
            corsOptions.allowedHeaders = cfg.cors.allowedHeaders;
        app.use((0, cors_1.default)(corsOptions));
    }
    const colors = [chalk_1.default.cyan, chalk_1.default.magenta, chalk_1.default.yellow, chalk_1.default.green];
    Object.entries(cfg.nodes).forEach(([node, dest], idx) => {
        const color = colors[idx % colors.length];
        const prefix = node.startsWith('/') ? node : '/' + node;
        app.use(prefix, (0, http_proxy_middleware_1.createProxyMiddleware)({
            target: dest,
            changeOrigin: true,
            pathRewrite: (p) => p.replace(new RegExp('^' + prefix), ''),
            onProxyReq: (_, req) => {
                const msg = `${req.method} ${req.originalUrl} \u2192 ${dest}`;
                if (cfg.log)
                    console.log(color(msg));
                (0, logs_1.logToFile)(node, `${new Date().toISOString()} ${msg}`);
            }
        }));
    });
    return await new Promise((resolve) => {
        const server = app.listen(cfg.port, () => {
            console.log(chalk_1.default.blue(`API Gateway running on port ${cfg.port}`));
            resolve(server);
        });
    });
}
