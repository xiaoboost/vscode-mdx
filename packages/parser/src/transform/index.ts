import { Root } from '../parser';
import { CodeGen } from '@mdx/source-map';
import { transform as realTransform } from './transform';
import { getMdxFileName, MdxFileType, removeTsSuffix } from '@mdx/utils';

import type { TransformResult, TransformContext } from './utils';
export type { TransformResult, TransformedData } from './utils';

/** jsx 代码预处理 */
function beforeTransformJsx(jsxCode: CodeGen) {
  jsxCode.addText('import React from \'react\';\n\n');
}

/** index 代码预处理 */
function beforeTransformIndex(indexCode: CodeGen, filename: string) {
  indexCode.addText(`
import { FC } from 'react';

declare const MDXComponent: FC<Record<string, any>>;
export default MDXComponent;

export * from './${removeTsSuffix(getMdxFileName(filename, MdxFileType.MainJsx))}';
`.trim());
}

export function transform(ast: Root, fileName: string): TransformResult {
  const indexCodeGen = new CodeGen();
  const jsxCodeGen = new CodeGen();
  const mdCodeGen = new CodeGen();
  const context: TransformContext = {
    fileName,
    indexCode: {
      filename: getMdxFileName(fileName, MdxFileType.Index),
      codeGen: indexCodeGen,
    },
    mdCode:  {
      filename: getMdxFileName(fileName, MdxFileType.MainMd),
      codeGen: mdCodeGen,
    },
    jsxCode: {
      filename: getMdxFileName(fileName, MdxFileType.MainJsx),
      codeGen: jsxCodeGen,
    },
    blockCodes: [],
  };

  beforeTransformJsx(jsxCodeGen);
  beforeTransformIndex(indexCodeGen, fileName);

  realTransform(ast, context);

  return context;
}
