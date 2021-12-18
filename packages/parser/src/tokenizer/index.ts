import { CodePointer } from './pointer';
import { charCode, isLineSpace, newlineChars } from '../utils';
import { TokenType, ScannerState, ScannerImportState, ScannerJsxState } from './types';
import { StringChars } from './constant';

import type { ParserOptions } from '../parser';

export * from './types';

/** Token 标记扫描器 */
export class Scanner {
  private readonly _pointer: CodePointer;
  private _tokenType: TokenType;
  private _tokenStart = 0;
  private _tokenError?: string;
  private _state: ScannerState;
  private _lastState: ScannerState;
  private _options: ParserOptions;

  constructor(code: string, opt: ParserOptions) {
    this._pointer = new CodePointer(code);
    this._state = ScannerState.WithinContent;
    this._lastState = ScannerState.WithinContent;
    this._tokenType = TokenType.Unknown;
    this._options = opt;
  }

  get state() {
    return this._state;
  }
  set state(val: ScannerState) {
    this._lastState = this._state;
    this._state = val;
  }

  get tokenType() {
    return this._tokenType;
  }

  get tokenStart() {
    return this._tokenStart;
  }

  get tokenLength() {
    return this._pointer.pos - this._tokenStart;
  }

  get tokenEnd() {
    return this._pointer.pos;
  }

  get tokenRange() {
    return {
      start: this.tokenStart,
      end: this.tokenEnd,
    };
  }

  get tokenText() {
    return this._pointer.source.substring(this._tokenStart, this._pointer.pos);
  }

  get tokenError() {
    return this._tokenError;
  }

  /** 设置当前标识符 */
  private finishToken(start: number, type: TokenType, errorMessage?: string) {
    this._tokenType = type;
    this._tokenStart = start;
    this._tokenError = errorMessage;
    return type;
  }

  /** 跳过字符串字面量 */
  private nextString() {
    const { _pointer: pointer } = this;
    const mark = pointer.peekChar(-1);
    const splitChars = newlineChars.concat(charCode.Slash, mark);

    while (!pointer.eos) {
      pointer.advanceUntilCharOr(splitChars);

      if (pointer.advanceIfChar(charCode.Slash)) {
        pointer.advance(1);
        continue;
      }
      else {
        pointer.advance(1);
        break;
      }
    }
  }

  /** 跳过模板字符串 */
  private nextTemplateString() {
    const { _pointer: pointer } = this;

    while (!pointer.eos) {
      pointer.advanceUntilCharOr([charCode.Slash, charCode.OSQ, charCode.DOL]);

      if (pointer.advanceIfChar(charCode.Slash)) {
        pointer.advance(1);
        continue;
      }
      else if (pointer.advanceIfChars([charCode.DOL, charCode.LBR])) {
        this.nextBlockExpression();
        continue;
      }
      else if (pointer.advanceIfChar(charCode.OSQ)) {
        pointer.advance(1);
        break;
      }
    }
  }

  /** 跳过 JS 注释 */
  private nextJsComment() {
    const { _pointer: pointer } = this;
    const lastChar = pointer.peekChar(-1);

    if (lastChar === charCode.Star) {
      pointer.advanceUntilChars([charCode.Star, charCode.FSL]);
      pointer.advance(2);
    }
    else if (lastChar === charCode.FSL) {
      pointer.advanceUntilNewline();
      pointer.advanceIfNewline();
    }
  }

  /** 跳过 import 语句 */
  private nextImport() {
    const { _pointer: pointer } = this;

    let state = ScannerImportState.BeforeFromIdentifier;

    while (!pointer.eos) {
      switch (state) {
        case ScannerImportState.BeforeFromIdentifier: {
          // ' "
          if (pointer.advanceIfCharOr([charCode.SQO, charCode.DQO])) {
            this.nextString();
            state = ScannerImportState.AfterFromString;
            continue;
          }
          // from
          else if (pointer.advanceIfChars(StringChars.from)) {
            state = ScannerImportState.AfterFromIdentifier;
            continue;
          }
          else {
            pointer.advanceUntilRegExp(/'|"|from/);
            continue;
          }
        }
        case ScannerImportState.AfterFromIdentifier: {
          // ' "
          if (pointer.advanceIfCharOr([charCode.SQO, charCode.DQO])) {
            this.nextString();
            state = ScannerImportState.AfterFromString;
            continue;
          }
          else {
            pointer.advanceUntilCharOr([charCode.SQO, charCode.DQO]);
            continue;
          }
        }
        case ScannerImportState.AfterFromString: {
          pointer.advanceIfChar(charCode.Semi);
          return;
        }
      }
    }
  }

  /** 跳过 export 语句 */
  private nextExport() {
    // ..
  }

  /** 跳过 JS 公共语句 */
  private nextJsCommon() {
    const { _pointer: pointer } = this;

    // 引号
    if (pointer.advanceIfCharOr([charCode.SQO, charCode.DQO])) {
      this.nextString();
      return true;
    }
    // `
    else if (pointer.advanceIfChar(charCode.OSQ)) {
      this.nextTemplateString();
      return true;
    }
    // {
    else if (pointer.advanceIfChar(charCode.LBR)) {
      this.nextBlockExpression();
      return true;
    }
    // // /*
    else if (
      pointer.advanceIfChars([charCode.FSL, charCode.FSL]) ||
      pointer.advanceIfChars([charCode.FSL, charCode.Star])
    ) {
      this.nextJsComment();
      return true;
    }

    return false;
  }

  /** 跳过 jsx 表达式 */
  private nextJsxExpression() {
    const { _pointer: pointer } = this;

    let deep = 1;
    let state: ScannerJsxState = ScannerJsxState.InStartTag;

    while (!pointer.eos) {
      switch (state) {
        case ScannerJsxState.InStartTag: {
          if (this.nextJsCommon()) {
            continue;
          }
          // />
          else if (pointer.advanceIfChars([charCode.FSL, charCode.RAN])) {
            state = ScannerJsxState.InContent;
            deep--;

            if (deep === 0) {
              return;
            }
            else {
              continue;
            }
          }
          // >
          else if (pointer.advanceIfChar(charCode.RAN)) {
            state = ScannerJsxState.InContent;
            continue;
          }
          else {
            pointer.advanceUntilRegExp(new RegExp('//|/\\*|\'|"|{|`|/?>'));
            continue;
          }
        }
        case ScannerJsxState.InContent: {
          if (pointer.advanceIfChar(charCode.LBR)) {
            this.nextBlockExpression();
            continue;
          }
          else if (pointer.advanceIfChar(charCode.LAN)) {
            if (pointer.advanceIfChar(charCode.FSL)) {
              state = ScannerJsxState.InEndTag;
            }
            else {
              deep++;
              state = ScannerJsxState.InStartTag;
            }

            continue;
          }

          pointer.advanceUntilCharOr([charCode.LBR, charCode.LAN]);
          continue;
        }
        case ScannerJsxState.InEndTag: {
          if (pointer.advanceIfChar(charCode.RAN)) {
            state = ScannerJsxState.InContent;
            deep--;

            if (deep === 0) {
              return;
            }
            else {
              continue;
            }
          }
          else {
            pointer.advanceUntilChar(charCode.RAN);
            continue;
          }
        }
      }
    }
  }

  /** 跳过代码块 */
  private nextBlockExpression() {
    const { _pointer: pointer } = this;

    while (!pointer.eos) {
      if (this.nextJsCommon()) {
        continue;
      }
      else if (pointer.advanceIfChar(charCode.RBR)) {
        return;
      }
      else {
        pointer.advanceUntilRegExp(new RegExp('//|/\\*|\'|"|{|}|`'));
        continue;
      }
    }
  }

  /** 扫描下一个标记 */
  scan(): TokenType {
    const { _pointer: pointer, _options: options } = this;
    const { pos: startOffset } = pointer;
    const { isMdx } = options;

    if (pointer.eos) {
      return this.finishToken(pointer.pos, TokenType.EOS);
    }

    switch (this.state) {
      case ScannerState.WithinComment: {
        // '-->'
        const endSign = [charCode.Minus, charCode.Minus, charCode.RAN];

        if (pointer.advanceIfChars(endSign)) {
          this.state = this._lastState;
          return this.finishToken(startOffset, TokenType.CommentEndTag);
        }
        else {
          pointer.advanceUntilChars(endSign);
          return this.finishToken(startOffset, TokenType.CommentContent);
        }
      }
      case ScannerState.WithinContent: {
        // 空白
        if (pointer.skipWhitespace()) {
          return this.finishToken(startOffset, TokenType.Whitespace);
        }
        // '<'
        else if (pointer.advanceIfChar(charCode.LAN)) {
          // '<!--'
          if (pointer.advanceIfChars([charCode.BNG, charCode.Minus, charCode.Minus])) {
            this.state = ScannerState.WithinComment;
            return this.finishToken(startOffset, TokenType.CommentStartTag);
          }
          else {
            this.nextJsxExpression();
            return this.finishToken(startOffset, TokenType.JsxExpression);
          }
        }
        // '{'
        else if (pointer.advanceIfChar(charCode.LBR)) {
          this.nextBlockExpression();
          return this.finishToken(startOffset, TokenType.BlockExpression);
        }
        // '```'
        else if (pointer.advanceIfChars([charCode.OSQ, charCode.OSQ, charCode.OSQ])) {
          this.state = ScannerState.WithinCodeBlockAttr;
          return this.finishToken(startOffset, TokenType.CodeBlockStart);
        }
        // import
        else if (pointer.advanceIfChars(StringChars.import)) {
          this.nextImport();
          return this.finishToken(startOffset, TokenType.ImportStatement);
        }
        // export
        // else if (pointer.advanceIfChars(StringChars.export)) {
        //   this.nextExport();
        //   return this.finishToken(startOffset, TokenType.ExportStatement);
        // }
        // 纯文本
        else if (pointer.advanceUntilRegExp(/[\r\n\f<{]/)) {
          this.state = ScannerState.WithinInlineContent;
          return this.finishToken(startOffset, TokenType.Text);
        }
        // 非法字符
        else {
          this.state = ScannerState.WithinContent;
          return this.finishToken(startOffset, TokenType.Unknown);
        }
      }
      case ScannerState.WithinInlineContent: {
        // 换行
        if (pointer.advanceIfNewline()) {
          this.state = ScannerState.WithinContent;
          return this.finishToken(startOffset, TokenType.ParagraphEnd);
        }
        // <
        else if (pointer.advanceIfChar(charCode.LAN)) {
          // '<!--'
          if (pointer.advanceIfChars([charCode.BNG, charCode.Minus, charCode.Minus])) {
            this.state = ScannerState.WithinComment;
            return this.finishToken(startOffset, TokenType.CommentStartTag);
          }
          else {
            this.nextJsxExpression();
            return this.finishToken(startOffset, TokenType.JsxExpression);
          }
        }
        // '{'
        else if (pointer.advanceIfChar(charCode.LBR)) {
          this.nextBlockExpression();
          return this.finishToken(startOffset, TokenType.BlockExpression);
        }
        // 纯文本
        else if (pointer.advanceUntilRegExp(/[\r\n\f<{]/)) {
          return this.finishToken(startOffset, TokenType.Text);
        }
        else {
          this.state = ScannerState.WithinContent;
          return this.finishToken(startOffset, TokenType.Unknown);
        }
      }
      case ScannerState.WithinCodeBlockAttr: {
        // 空白
        if (pointer.advanceIfCbTrue(isLineSpace)) {
          return this.finishToken(startOffset, TokenType.Whitespace);
        }
        // 换行
        else if (pointer.advanceIfNewline()) {
          this.state = ScannerState.WithinCodeBlock;
          return this.scan();
        }
        // 非空字符
        else if (pointer.advanceIfRegExp(/^[^\s]+/)) {
          return this.finishToken(startOffset, TokenType.CodeBlockAttribute);
        }
        // 非法字符
        else {
          this.state = ScannerState.WithinContent;
          return this.finishToken(startOffset, TokenType.Unknown);
        }
      }
      case ScannerState.WithinCodeBlock: {
        if (pointer.advanceIfRegExp(/^\r?\n```/)) {
          this.state = ScannerState.WithinContent;
          return this.finishToken(startOffset, TokenType.CodeBlockEnd);
        }
        else {
          pointer.advanceUntilRegExp(/\r?\n```/);
          return this.finishToken(startOffset, TokenType.CodeBlockContent);
        }
      }
      case ScannerState.AfterEsmStatement: {
        break;
      }
      case ScannerState.AfterBlockExpression: {
        break;
      }
    }

    pointer.advance(1);
    return this.finishToken(startOffset, TokenType.Unknown);
  }
}
