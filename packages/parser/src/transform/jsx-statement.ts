import { NodeType, Node, JsxStatement } from '../parser';
import { TransformContext } from './utils';
import { Mode } from '@mdx/source-map';

export function test(node: Node) {
  return node.type === NodeType.JsxStatement;
}

export function transform(node: JsxStatement, { jsxCode }: TransformContext) {
  jsxCode.codeGen.addCode(node.text, Mode.Offset, node.range);
  jsxCode.codeGen.addText(';\n\n');
}
