#!/usr/bin/env node
import { Command } from 'commander';
import { makeStartCommand } from './commands/start';
import { makeLogsCommand } from './commands/logs';

const packageJson = require('../../package.json');

const program = new Command();
program
  .name('proxy')
  .description('Local API Gateway proxy');

// Add version support
(program as any).version(packageJson.version);

program.addCommand(makeStartCommand());
program.addCommand(makeLogsCommand());

program.parse(process.argv);
