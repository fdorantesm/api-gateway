import { collect } from '../src/cli/util';

describe('collect', () => {
  test('appends values', () => {
    expect(collect('a', [])).toEqual(['a']);
    expect(collect('b', ['a'])).toEqual(['a', 'b']);
  });
});
