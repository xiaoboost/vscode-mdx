import { readFileSync } from "fs";
import { join } from 'path';
import { parse } from '../src';

export function parseCase(name: string, options?: Parameters<typeof parse>[1]) {
  const casePath = join(__dirname, 'cases', `${name}.mdx`);
  const code = readFileSync(casePath, 'utf-8');
  const result = parse(code, options);

  result.root.walk((node) => {
    delete node.parent;
    (node as any)._kind = node.kind;
  });

  return result;
}
