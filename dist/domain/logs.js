"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logToFile = logToFile;
exports.tailLog = tailLog;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
function logToFile(node, message) {
    const dir = (0, config_1.ensureLogsDir)();
    const file = path_1.default.join(dir, `${node}.log`);
    fs_1.default.appendFileSync(file, message + '\n');
}
function tailLog(node) {
    const file = path_1.default.join((0, config_1.ensureLogsDir)(), `${node}.log`);
    if (!fs_1.default.existsSync(file)) {
        console.error('Log file not found for', node);
        process.exit(1);
    }
    let size = fs_1.default.statSync(file).size;
    const stream = fs_1.default.createReadStream(file, { encoding: 'utf-8', start: 0 });
    stream.on('data', chunk => process.stdout.write(chunk));
    fs_1.default.watchFile(file, { interval: 1000 }, () => {
        const newSize = fs_1.default.statSync(file).size;
        if (newSize > size) {
            const fd = fs_1.default.openSync(file, 'r');
            const buffer = Buffer.alloc(newSize - size);
            fs_1.default.readSync(fd, buffer, 0, buffer.length, size);
            fs_1.default.closeSync(fd);
            process.stdout.write(buffer.toString());
            size = newSize;
        }
    });
}
