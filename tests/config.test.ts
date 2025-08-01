import { resolveConfigPath } from '../src/domain/config';
import os from 'os';
import path from 'path';
import test from 'node:test';
import assert from 'node:assert/strict';

test('resolves absolute paths unchanged', () => {
  const p = '/tmp/config.json';
  assert.equal(resolveConfigPath(p), p);
});

test('resolves names in home directory', () => {
  const result = resolveConfigPath('foo');
  assert.equal(result, path.join(os.homedir(), '.agw', 'foo.json'));
});
