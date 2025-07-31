#!/usr/bin/env node
import { Command } from 'commander';
import { makeStartCommand } from './commands/start';
import { makeLogsCommand } from './commands/logs';

const program = new Command();
program
  .name('agw')
  .description('Local API Gateway proxy');

program.addCommand(makeStartCommand());
program.addCommand(makeLogsCommand());

program.parse(process.argv);
