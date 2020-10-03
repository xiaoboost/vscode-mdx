import * as path from 'path';

import { BaseCode } from './base';
import { TextCode } from './text';
import { toFsPath } from '@mdx/utils';
import { SourceMap } from '@mdx/source-map';
import { parse, transform, Root, ParserError, TransformedData } from '@mdx/parser';

function writeCode(mdx: MdxCode, dirname: string, { filename, codeGen }: TransformedData) {
  const codePath = path.join(dirname, filename);
  const document = mdx.fs.writeFile(codePath, codeGen.getMappedCode());

  if (!document) {
    throw `路径错误：${codePath}`;
  }

  const sourceMap = new SourceMap(mdx.document, document, codeGen.getMappings());
  const script = new TextCode(document, mdx.fs, sourceMap);

  mdx.fs.codes.set(codePath, script);

  return script;
}

/** MDX 文件代码 */
export class MdxCode extends BaseCode {
  /** 语法树 */
  ast?: Root;
  /** 错误 */
  errors: ParserError[] = [];
  /** jsx 代码 */
  jsxCode?: BaseCode;
  /** jsx 代码 */
  mdCode?: BaseCode;
  /** 代码块代码 */
  blockCodes: BaseCode[] = [];

  parse() {
    if (this.version >= this.document.version) {
      return;
    }

    this.ast = undefined;
    this.errors.length = 0;
    this.version = this.document.version;

    try {
      const result = parse(this.document.getText());
      this.ast = result.root;
      this.errors = result.errors;
    }
    catch (e) {
      console.warn(e);
    }

    if (!this.ast) {
      return;
    }

    const fsPath = toFsPath(this.document.uri);
    const dirname = path.dirname(fsPath);
    const result = transform(this.ast, path.basename(fsPath));

    // 删除多余代码文件
    while (this.blockCodes.length > result.blockCodes.length) {
      const lastCode = this.blockCodes[this.blockCodes.length - 1];
      const uri = lastCode.document.uri;
      this.fs.rm(toFsPath(uri));
      this.blockCodes.pop();
    }

    // 清空代码缓存
    this.blockCodes.length = 0;

    // 写入所有代码块的虚拟文件
    for (const code of result.blockCodes) {
      this.blockCodes.push(writeCode(this, dirname, code));
    }

    // 写入虚拟文件
    this.jsxCode = writeCode(this, dirname, result.jsxCode);
    this.mdCode = writeCode(this, dirname, result.mdCode);
  }
}
