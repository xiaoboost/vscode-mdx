import { CodeGen } from '@mdx/source-map';
import { Node } from '../parser';

export interface TransformedData {
  filename: string;
  codeGen: CodeGen;
}

/** 代码转换结果 */
export interface TransformResult {
  indexCode: TransformedData;
  jsxCode: TransformedData;
  mdCode: TransformedData;
  blockCodes: TransformedData[];
}

export interface TransformContext extends TransformResult {
  /**
   * 原始文件名
   *  - 单纯的文件名，没有路径
   */
  fileName: string;
}

export interface Transformer {
  test(node: Node): boolean;
  transform(node: Node, context: TransformContext): any;
}

export function createTransformer(transformers: Transformer[]) {
  return function transform(node: Node, context: TransformContext) {
    const transformer = transformers.find((item) => item.test(node));

    if (transformer) {
      transformer.transform(node, context);
    }
  };
}
