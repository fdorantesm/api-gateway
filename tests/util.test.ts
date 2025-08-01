import { collect } from '../src/cli/util';

describe('collect', () => {
  it('appends values', () => {
    expect(collect('a', [])).toEqual(['a']);
    expect(collect('b', ['a'])).toEqual(['a', 'b']);
  });
});
