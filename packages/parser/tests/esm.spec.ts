import test from 'ava';

import { parseCase } from './utils';

function parse(...args: Parameters<typeof parseCase>) {
  return parseCase(`esm/${args[0]}`, args[1]);
}

test('import-normal', ({ snapshot }) => {
  snapshot(parse('import-normal'));
});

test('import-text', ({ snapshot }) => {
  snapshot(parse('import-text'));
});
