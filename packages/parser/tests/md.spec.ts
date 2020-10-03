import test from 'ava';

import { parseCase } from './utils';

function parse(...args: Parameters<typeof parseCase>) {
  return parseCase(`md/${args[0]}`, args[1]);
}

test('code-block', ({ snapshot }) => {
  snapshot(parse('code-block'));
});

test('comment', ({ snapshot }) => {
  snapshot(parse('comment'));
});
