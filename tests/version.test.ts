import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

describe('version command', () => {
  const cliPath = path.join(__dirname, '..', 'dist', 'cli', 'index.js');
  const packageJson = require('../package.json');

  it('should output version with --version flag', async () => {
    const { stdout } = await execAsync(`node ${cliPath} --version`);
    expect(stdout.trim()).toBe(packageJson.version);
  });

  it('should output version with -V flag', async () => {
    const { stdout } = await execAsync(`node ${cliPath} -V`);
    expect(stdout.trim()).toBe(packageJson.version);
  });
});