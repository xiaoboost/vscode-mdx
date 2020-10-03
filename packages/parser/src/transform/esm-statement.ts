import { NodeType, Node, ImportStatement } from '../parser';
import { TransformContext } from './utils';
import { Mode } from '@mdx/source-map';

export function test(node: Node) {
  return node.type === NodeType.ImportStatement;
}

export function transform(node: ImportStatement, { jsxCode }: TransformContext) {
  jsxCode.codeGen.addCode(node.text, Mode.Offset, node.range);
  jsxCode.codeGen.addText(';\n\n');
}
