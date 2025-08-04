import { Command } from 'commander';
import inquirer from 'inquirer';
import path from 'path';
import { spawn } from 'child_process';
import { Config, loadConfig, saveConfig, listConfigs } from '../../domain/config';
import { startServer } from '../../application/server';
import { collect } from '../util';
import { buildRoutes } from '../buildRoutes';

export function makeStartCommand(): Command {
  const cmd = new Command('start');
  cmd
    .option('-p, --port <number>', 'Port to listen on', (v) => parseInt(v, 10))
    .option('-n, --node <mapping>', 'Node mapping as node:destiny', collect, [])
    .option('-c, --config <file>', 'Config file name or path')
    .option('-s, --save <file>', 'Save config under given name')
    .option('--log', 'Enable request logging')
    .option('--daemon', 'Run in background')
    .addHelpText('after', `\nExamples:\n` +
      `  $ npx proxy start -p 8000 --node auth:http://localhost:9000 --node products:http://localhost:9001\n` +
      `  $ npx proxy start --save myconfig\n` +
      `  $ npx proxy start --config myconfig\n` +
      `  $ npx proxy start --daemon --config myconfig\n`);

  cmd.action(async (opts) => {
    if (opts.daemon) {
      const args = process.argv.slice(3).filter(a => a !== '--daemon');
      const bin = path.join(__dirname, '..', 'index.js');
      const child = spawn(process.execPath, [bin, 'start', ...args], {
        detached: true,
        stdio: 'ignore'
      });
      child.unref();
      console.log(`Daemon started with PID ${child.pid}`);
      return;
    }

    let cfg: Config | null = null;
    if (opts.config) {
      cfg = loadConfig(opts.config);
    } else {
      const existing = listConfigs();
      if (existing.length) {
        const ans: any = await inquirer.prompt([
          {
            type: 'list',
            name: 'cfg',
            message: 'Select configuration',
            choices: [...existing, 'create new']
          }
        ]);
        if (ans.cfg !== 'create new') cfg = loadConfig(ans.cfg);
      }
    }

    const argRoutes = buildRoutes(opts.node);

    if (!cfg && (Object.keys(argRoutes).length === 0)) {
      cfg = await promptConfig();
    }
    if (!cfg) {
      cfg = {
        port: opts.port || 8000,
        nodes: argRoutes,
        log: opts.log || false,
      };
    } else {
      cfg.port = opts.port ?? cfg.port;
      cfg.log = opts.log ?? cfg.log;
      if (Object.keys(argRoutes).length) cfg.nodes = argRoutes;
    }

    if (Object.keys(cfg.nodes).length === 0) {
      console.error('At least one node mapping must be provided');
      process.exit(1);
    }

    if (opts.save) saveConfig(opts.save, cfg);

    await startServer(cfg);
  });

  return cmd;
}

async function promptConfig(): Promise<Config> {
  const answers: any = await inquirer.prompt([
    { type: 'number', name: 'port', message: 'Port', default: 8000 },
  ]);
  const nodes: Record<string, string> = {};
  let addMore = true;
  while (addMore) {
    const ans: any = await inquirer.prompt([
      { name: 'node', message: 'Node path (e.g. auth)' },
      { name: 'destiny', message: 'Destination URL' },
      { type: 'confirm', name: 'more', message: 'Add another route?', default: false },
    ]);
    nodes[ans.node] = ans.destiny;
    addMore = ans.more;
  }
  const { log } = await inquirer.prompt([
    { type: 'confirm', name: 'log', message: 'Enable console log?', default: true },
  ]);
  return { port: answers.port, nodes, log };
}
