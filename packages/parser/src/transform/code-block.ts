import { NodeType, Node, CodeBlock } from '../parser';
import { TransformContext } from './utils';
import { Mode, CodeGen } from '@mdx/source-map';
import { NULL_EXPORT, MdCodeBlockSuffix } from '@mdx/utils';

const langMap = {
  ts: 'ts',
  js: 'js',
  jsx: 'jsx',
  tsx: 'tsx',
  javascript: 'js',
  typescript: 'ts',
  javascriptreact: 'js',
  typescriptreact: 'ts',
};

export function test(node: Node) {
  return (
    node.type === NodeType.CodeBlock &&
    (node.lang && langMap[node.lang.toLowerCase()])
  );
}

export function transform(node: CodeBlock, context: TransformContext) {
  const { blockCodes, jsxCode } = context;
  const codeGen = new CodeGen();
  const suffix = MdCodeBlockSuffix(langMap[node.lang!]);
  const filename = `${context.basename}.${blockCodes.length}${suffix}`;

  codeGen.addCode(node.text, Mode.Offset, node.range);
  codeGen.addText(`\n\n;${NULL_EXPORT}`);

  blockCodes.push({
    filename,
    codeGen,
  });

  jsxCode.codeGen.addText(`;\nimport './${filename.replace(/\.(j|t)sx?$/, '')}';\n`);
}
