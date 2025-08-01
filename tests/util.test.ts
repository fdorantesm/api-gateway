import { collect } from '../src/cli/util';
import test from 'node:test';
import assert from 'node:assert/strict';

test('collect appends values', () => {
  assert.deepStrictEqual(collect('a', []), ['a']);
  assert.deepStrictEqual(collect('b', ['a']), ['a', 'b']);
});
