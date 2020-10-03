import { Root } from '../parser';
import { transform as origin } from './transform';
import { CodeGen } from '@mdx/source-map';
import { MdxJsxSuffix, MdxMdSuffix } from '@mdx/utils';

import type { TransformResult, TransformContext } from './utils';
export type { TransformResult, TransformedData } from './utils';

export function transform(ast: Root, filename: string): TransformResult {
  const jsxCodeGen = new CodeGen();
  const mdCodeGen = new CodeGen();
  const basename = filename.replace(/\.[^.]*$/, '');
  const context: TransformContext = {
    basename,
    mdCode: {
      filename: `${basename}${MdxMdSuffix}`,
      codeGen: mdCodeGen,
    },
    jsxCode: {
      filename: `${basename}${MdxJsxSuffix}`,
      codeGen: jsxCodeGen,
    },
    blockCodes: [],
  };

  // jsx 代码默认需要加入 react
  jsxCodeGen.addText('import React from \'react\';\n\n');

  origin(ast, context);

  return context;
}
