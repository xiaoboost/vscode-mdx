import { NodeType, Node, Root } from '../parser';
import { transformChildren } from './transform';
import { TransformContext } from './utils';
import { NULL_EXPORT } from '@mdx/utils';

export function test(node: Node) {
  return node.type === NodeType.Root;
}

export function transform(node: Root, context: TransformContext) {
  transformChildren(node, context);
  context.jsxCode.codeGen.addText(NULL_EXPORT);
}
