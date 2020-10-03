import test from 'ava';

import { parseCase } from './utils';

function parse(...args: Parameters<typeof parseCase>) {
  return parseCase(`jsx/${args[0]}`, args[1]);
}

test('block', ({ snapshot }) => {
  snapshot(parse('block'));
});

test('inline', ({ snapshot }) => {
  snapshot(parse('inline'));
});
