import { resolveConfigPath } from '../src/domain/config';
import os from 'os';
import path from 'path';

describe('resolveConfigPath', () => {
  it('returns absolute paths unchanged', () => {
    const p = '/tmp/config.json';
    expect(resolveConfigPath(p)).toBe(p);
  });

  it('resolves names in home directory', () => {
    const result = resolveConfigPath('foo');
    expect(result).toBe(path.join(os.homedir(), '.agw', 'foo.json'));
  });
});
