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
// Helper to sanitize config for logging
function getSanitizedConfig(cfg) {
    // Copy only non-sensitive fields. Adjust as needed for your config structure.
    const { port, cors, nodes, log } = cfg;
    return { port, cors, nodes, log };
}
async function startServer(cfg) {
    const app = (0, express_1.default)();
    if (cfg.log) {
        console.log(chalk_1.default.green(`Proxy configuration: ${JSON.stringify(getSanitizedConfig(cfg), null, 2)}`));
    }
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
        const options = {
            target: dest,
            changeOrigin: true,
            pathRewrite: (p) => p.replace(new RegExp('^' + prefix), ''),
        };
        if (cfg.log) {
            const displayOptions = {
                target: dest,
                changeOrigin: true,
                pathRewrite: `^${prefix} -> ''`
            };
            console.log(color(`Proxy config for ${prefix}: ${JSON.stringify(displayOptions, null, 2)}`));
        }
        app.use((0, http_proxy_middleware_1.createProxyMiddleware)(prefix, {
            ...options,
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
