import test from 'ava';

import { parseCase } from './utils';

function parse(...args: Parameters<typeof parseCase>) {
  return parseCase(`expression/${args[0]}`, args[1]);
}

test('normal', ({ snapshot }) => {
  snapshot(parse('normal'));
});

test('inline cant contain blank line', ({ snapshot }) => {
  snapshot(parse('inline-newline'));
});
