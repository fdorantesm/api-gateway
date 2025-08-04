"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeStartCommand = makeStartCommand;
const commander_1 = require("commander");
const inquirer_1 = __importDefault(require("inquirer"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const config_1 = require("../../domain/config");
const server_1 = require("../../application/server");
const util_1 = require("../util");
const buildRoutes_1 = require("../buildRoutes");
function makeStartCommand() {
    const cmd = new commander_1.Command('start');
    cmd
        .option('-p, --port <number>', 'Port to listen on', (v) => parseInt(v, 10))
        .option('-n, --node <mapping>', 'Node mapping as node:destiny', util_1.collect, [])
        .option('-c, --config <file>', 'Config file name or path')
        .option('-s, --save <file>', 'Save config under given name')
        .option('--log', 'Enable request logging')
        .option('--daemon', 'Run in background')
        .option('--cors', 'Enable CORS')
        .option('--cors-origin <origin>', 'Allowed CORS origin', util_1.collect, [])
        .option('--cors-method <method>', 'Allowed CORS method', util_1.collect, [])
        .option('--cors-header <header>', 'Allowed CORS header', util_1.collect, [])
        .addHelpText('after', `\nExamples:\n` +
        `  $ npx proxy start -p 8000 --node auth:http://localhost:9000 --node products:http://localhost:9001\n` +
        `  $ npx proxy start --save myconfig\n` +
        `  $ npx proxy start --config myconfig\n` +
        `  $ npx proxy start --daemon --config myconfig\n`);
    cmd.action(async (opts) => {
        if (opts.daemon) {
            const args = process.argv.slice(3).filter(a => a !== '--daemon');
            const bin = path_1.default.join(__dirname, '..', 'index.js');
            const child = (0, child_process_1.spawn)(process.execPath, [bin, 'start', ...args], {
                detached: true,
                stdio: 'ignore'
            });
            child.unref();
            console.log(`Daemon started with PID ${child.pid}`);
            return;
        }
        let cfg = null;
        if (opts.config) {
            cfg = (0, config_1.loadConfig)(opts.config);
        }
        else {
            const existing = (0, config_1.listConfigs)();
            if (existing.length) {
                const ans = await inquirer_1.default.prompt([
                    {
                        type: 'list',
                        name: 'cfg',
                        message: 'Select configuration',
                        choices: [...existing, 'create new']
                    }
                ]);
                if (ans.cfg !== 'create new')
                    cfg = (0, config_1.loadConfig)(ans.cfg);
            }
        }
        const argRoutes = (0, buildRoutes_1.buildRoutes)(opts.node);
        if (!cfg && (Object.keys(argRoutes).length === 0)) {
            cfg = await promptConfig();
        }
        if (!cfg) {
            cfg = {
                port: opts.port || 8000,
                nodes: argRoutes,
                log: opts.log || false,
            };
        }
        else {
            cfg.port = opts.port ?? cfg.port;
            cfg.log = opts.log ?? cfg.log;
            if (Object.keys(argRoutes).length)
                cfg.nodes = argRoutes;
        }
        const cors = {};
        if (opts.corsOrigin && opts.corsOrigin.length)
            cors.origin = opts.corsOrigin;
        if (opts.corsMethod && opts.corsMethod.length)
            cors.methods = opts.corsMethod;
        if (opts.corsHeader && opts.corsHeader.length)
            cors.allowedHeaders = opts.corsHeader;
        if (opts.cors || Object.keys(cors).length)
            cfg.cors = cors;
        if (Object.keys(cfg.nodes).length === 0) {
            console.error('At least one node mapping must be provided');
            process.exit(1);
        }
        if (opts.save)
            (0, config_1.saveConfig)(opts.save, cfg);
        await (0, server_1.startServer)(cfg);
    });
    return cmd;
}
async function promptConfig() {
    const answers = await inquirer_1.default.prompt([
        { type: 'number', name: 'port', message: 'Port', default: 8000 },
    ]);
    const nodes = {};
    let addMore = true;
    while (addMore) {
        const ans = await inquirer_1.default.prompt([
            { name: 'node', message: 'Node path (e.g. auth)' },
            { name: 'destiny', message: 'Destination URL' },
            { type: 'confirm', name: 'more', message: 'Add another route?', default: false },
        ]);
        nodes[ans.node] = ans.destiny;
        addMore = ans.more;
    }
    const { log } = await inquirer_1.default.prompt([
        { type: 'confirm', name: 'log', message: 'Enable console log?', default: true },
    ]);
    return { port: answers.port, nodes, log };
}
