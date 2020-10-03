import { Node } from '../parser';
import { createTransformer, TransformContext } from './utils';

import * as Root from './root';
import * as Esm from './esm-statement';
import * as Jsx from './jsx-statement';
import * as Block from './code-block';

export const transform = createTransformer([Root, Esm, Jsx, Block]);

export function transformChildren(node: Node, context: TransformContext) {
  for (const el of node.children ?? []) {
    transform(el, context);
  }
}
