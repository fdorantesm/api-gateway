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
function makeStartCommand() {
    const cmd = new commander_1.Command('start');
    cmd
        .option('-p, --port <number>', 'Port to listen on', (v) => parseInt(v, 10))
        .option('-n, --node <name>', 'Node name/path', util_1.collect, [])
        .option('-d, --destiny <url>', 'Destination URL', util_1.collect, [])
        .option('-c, --config <file>', 'Config file name or path')
        .option('-s, --save <file>', 'Save config under given name')
        .option('--log', 'Enable request logging')
        .option('--daemon', 'Run in background')
        .addHelpText('after', `\nExamples:\n` +
        `  $ npx agw start -p 8000 --node auth --destiny http://localhost:9000\n` +
        `  $ npx agw start --save myconfig\n` +
        `  $ npx agw start --config myconfig\n` +
        `  $ npx agw start --daemon --config myconfig\n`);
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
        if (opts.config)
            cfg = (0, config_1.loadConfig)(opts.config);
        if (!cfg && (opts.node.length === 0 || opts.destiny.length === 0)) {
            cfg = await promptConfig();
        }
        if (!cfg) {
            cfg = {
                port: opts.port || 8000,
                nodes: opts.node,
                destinies: opts.destiny,
                log: opts.log || false,
            };
        }
        else {
            cfg.port = opts.port ?? cfg.port;
            cfg.log = opts.log ?? cfg.log;
            if (opts.node.length)
                cfg.nodes = opts.node;
            if (opts.destiny.length)
                cfg.destinies = opts.destiny;
        }
        if (cfg.nodes.length !== cfg.destinies.length) {
            console.error('The number of nodes and destinies must match');
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
    const nodes = [];
    const destinies = [];
    let addMore = true;
    while (addMore) {
        const ans = await inquirer_1.default.prompt([
            { name: 'node', message: 'Node path (e.g. auth)' },
            { name: 'destiny', message: 'Destination URL' },
            { type: 'confirm', name: 'more', message: 'Add another route?', default: false },
        ]);
        nodes.push(ans.node);
        destinies.push(ans.destiny);
        addMore = ans.more;
    }
    const { log } = await inquirer_1.default.prompt([
        { type: 'confirm', name: 'log', message: 'Enable console log?', default: true },
    ]);
    return { port: answers.port, nodes, destinies, log };
}
