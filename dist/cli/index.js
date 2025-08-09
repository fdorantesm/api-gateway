#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const start_1 = require("./commands/start");
const logs_1 = require("./commands/logs");
const packageJson = require('../../package.json');
const program = new commander_1.Command();
program
    .name('proxy')
    .description('Local API Gateway proxy');
// Add version support
program.version(packageJson.version);
program.addCommand((0, start_1.makeStartCommand)());
program.addCommand((0, logs_1.makeLogsCommand)());
program.parse(process.argv);
