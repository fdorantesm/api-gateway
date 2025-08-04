"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveConfigPath = resolveConfigPath;
exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;
exports.listConfigs = listConfigs;
exports.ensureLogsDir = ensureLogsDir;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
function resolveConfigPath(name) {
    if (path_1.default.isAbsolute(name))
        return name;
    const base = path_1.default.join(os_1.default.homedir(), '.proxy');
    if (!name.endsWith('.json'))
        name += '.json';
    return path_1.default.join(base, name);
}
function loadConfig(name) {
    const file = resolveConfigPath(name);
    if (!fs_1.default.existsSync(file))
        return null;
    const data = fs_1.default.readFileSync(file, 'utf-8');
    return JSON.parse(data);
}
function saveConfig(name, cfg) {
    const file = resolveConfigPath(name);
    const dir = path_1.default.dirname(file);
    if (!fs_1.default.existsSync(dir))
        fs_1.default.mkdirSync(dir, { recursive: true });
    fs_1.default.writeFileSync(file, JSON.stringify(cfg, null, 2));
    const green = (msg) => `\u001b[32m${msg}\u001b[0m`;
    console.log(green(`Configuration saved to ${file}`));
}
function listConfigs() {
    const dir = path_1.default.join(os_1.default.homedir(), '.proxy');
    if (!fs_1.default.existsSync(dir))
        return [];
    return fs_1.default
        .readdirSync(dir)
        .filter((f) => f.endsWith('.json'))
        .map((f) => f.replace(/\.json$/, ''));
}
function ensureLogsDir() {
    const dir = path_1.default.join(os_1.default.homedir(), '.proxy', 'logs');
    if (!fs_1.default.existsSync(dir))
        fs_1.default.mkdirSync(dir, { recursive: true });
    return dir;
}
