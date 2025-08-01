declare module 'fs';
declare module 'path';
declare module 'os';
declare module 'commander' {
  export class Command {
    constructor(name?: string);
    name(n: string): this;
    description(desc: string): this;
    addCommand(cmd: Command): this;
    option(...args: any[]): this;
    argument(...args: any[]): this;
    action(cb: (...args: any[]) => any): this;
    addHelpText(pos: string, text: string): this;
    parse(args: string[]): void;
  }
}
declare module 'inquirer';
declare module 'express';
declare module 'http-proxy-middleware';
declare module 'chalk';
declare module 'child_process';
declare var process: any;
declare var __dirname: string;
declare var Buffer: any;
declare module 'node:test';
declare module 'node:assert/strict';
