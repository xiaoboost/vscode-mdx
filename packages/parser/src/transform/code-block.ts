import { NodeType, Node, CodeBlock } from '../parser';
import { TransformContext } from './utils';
import { Mode, CodeGen } from '@mdx/source-map';
import { NULL_EXPORT, removeTsSuffix, getMdxFileName, MdxFileType } from '@mdx/utils';

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
  const { blockCodes, indexCode } = context;
  const codeGen = new CodeGen();
  const filename = getMdxFileName(
    context.fileName,
    MdxFileType.CodeBlock,
    blockCodes.length,
    langMap[node.lang!],
  );

  codeGen.addCode(node.text, Mode.Offset, node.range);
  codeGen.addText(`\n\n;${NULL_EXPORT}`);
  blockCodes.push({ filename, codeGen });
  indexCode.codeGen.addText(`\nimport './${removeTsSuffix(filename)}';\n`);
}
