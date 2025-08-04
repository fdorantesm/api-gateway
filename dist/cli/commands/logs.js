"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeLogsCommand = makeLogsCommand;
const commander_1 = require("commander");
const logs_1 = require("../../domain/logs");
function makeLogsCommand() {
    const cmd = new commander_1.Command('logs');
    cmd.argument('<node>', 'Node to show logs for');
    cmd.action((node) => {
        (0, logs_1.tailLog)(node);
    });
    return cmd;
}
