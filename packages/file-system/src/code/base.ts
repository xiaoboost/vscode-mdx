import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { Position, Range } from 'vscode-languageserver-types';
import type { Lang, InputPosition, InputRange } from './types';
import type { SourceMap } from '@mdx/source-map';
import type { DiskController } from '../file-system/controller';

import { toFsPath } from '@mdx/utils';
import { isNumber } from '@xiao-ai/utils';

/** 基础代码类 */
export abstract class BaseCode {
  /** 文件系统 */
  readonly fs: DiskController;
  /** 代码文档 */
  readonly document: TextDocument;
  /** 代码版本 */
  version = 0;
  /** 所属的文件 */
  sourceMap?: SourceMap;

  constructor(document: TextDocument, fs: DiskController, sourceMap?: SourceMap) {
    this.fs = fs;
    this.document = document;
    this.sourceMap = sourceMap;
    this.fs.codes.set(toFsPath(document.uri), this);
  }

  /** 代码语言 */
  get lang() {
    return this.document.languageId as Lang;
  }

  /** 获取在原始文件的位置 */
  getSourcePosition(offset: InputPosition): Position {
    let offsetInOrigin = isNumber(offset) ? offset : this.document.offsetAt(offset);
    let source = this.document;

    if (this.sourceMap) {
      const result = this.sourceMap.getSourceOffset(offsetInOrigin);

      if (isNumber(result)) {
        source = this.sourceMap.source;
        offsetInOrigin = result;
      }
    }

    return source.positionAt(offsetInOrigin);
  }

  getSourceRange(range: InputRange): Range {
    return {
      start: this.getSourcePosition(range.start),
      end: this.getSourcePosition(range.end),
    };
  }

  /** 编译 */
  parse() {
    // 空白函数占位
  }
}
