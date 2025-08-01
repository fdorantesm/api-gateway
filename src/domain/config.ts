import fs from 'fs';
import path from 'path';
import os from 'os';

export interface Config {
  port: number;
  nodes: string[];
  destinies: string[];
  log?: boolean;
}

export function resolveConfigPath(name: string): string {
  if (path.isAbsolute(name)) return name;
  const base = path.join(os.homedir(), '.proxy');
  if (!name.endsWith('.json')) name += '.json';
  return path.join(base, name);
}

export function loadConfig(name: string): Config | null {
  const file = resolveConfigPath(name);
  if (!fs.existsSync(file)) return null;
  const data = fs.readFileSync(file, 'utf-8');
  return JSON.parse(data);
}

export function saveConfig(name: string, cfg: Config) {
  const file = resolveConfigPath(name);
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(cfg, null, 2));
  const green = (msg: string) => `\u001b[32m${msg}\u001b[0m`;
  console.log(green(`Configuration saved to ${file}`));
}

export function ensureLogsDir() {
  const dir = path.join(os.homedir(), '.proxy', 'logs');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}
