import { charCode } from '../utils';
import { isWhiteSpace, isNewline } from '../utils/assert';

/** 字符串指针类 */
export class CodePointer {
  private readonly _source: string;
  private readonly _length: number;
  private _offset: number;

  constructor(source: string) {
    this._source = source;
    this._length = source.length;
    this._offset = 0;
  }

  get eos() {
    return this._length <= this._offset;
  }

  get source() {
    return this._source;
  }

  get pos() {
    return this._offset;
  }

  go(pos: number) {
    this._offset = pos;
  }

  goBack(n: number) {
    this._offset -= n;
  }

  goToEnd() {
    this._offset = this.source.length;
  }

  advance(n: number) {
    this._offset += n;
  }

  peekChar(n = 0) {
    return this.source.charCodeAt(this._offset + n) || 0;
  }

  peekChars(n = 0) {
    const chars: number[] = [];

    for (let i = 0; i < n; i++) {
      chars.push(this._offset + i);
    }

    return chars;
  }

  peekSame(chars: number[]) {
    const len = chars.length;

    for (let i = 0; i < len; i++) {
      if (chars[i] !== this.source.charCodeAt(this._offset + i)) {
        return false;
      }
    }

    return true;
  }

  advanceIfChar(ch: number) {
    if (ch === this.source.charCodeAt(this._offset)) {
      this._offset++;
      return true;
    }

    return false;
  }

  advanceIfCharOr(chars: number[]) {
    if (chars.includes(this.source.charCodeAt(this._offset))) {
      this._offset++;
      return true;
    }

    return false;
  }

  advanceIfChars(ch: number[]) {
    let i: number;

    if (this._offset + ch.length > this.source.length) {
      return false;
    }

    for (i = 0; i < ch.length; i++) {
      if (this.source.charCodeAt(this._offset + i) !== ch[i]) {
        return false;
      }
    }

    this.advance(i);

    return true;
  }

  advanceIfCbTrue(cb: (ch: number) => boolean) {
    let i = 0;

    while (cb(this.source.charCodeAt(this._offset + i)) && this._offset + i <= this.source.length) {
      i++;
    }

    this.advance(i);
    return i > 0;
  }

  advanceIfRegExp(regex: RegExp) {
    const str = this.source.substr(this._offset);
    const match = regex.exec(str);

    if (match) {
      this._offset = this._offset + match.index + match[0].length;
      return match[0];
    }

    return '';
  }

  advanceUntilChar(ch: number) {
    while (this._offset < this.source.length) {
      if (this.source.charCodeAt(this._offset) === ch) {
        return true;
      }

      this.advance(1);
    }

    return false;
  }

  advanceUntilCharOr(ch: number[]) {
    while (this._offset < this.source.length) {
      const char = this.source.charCodeAt(this._offset);

      for (let j = 0; j < ch.length; j++) {
        if (char === ch[j]) {
          return true;
        }
      }

      this.advance(1);
    }

    this.goToEnd();
    return false;
  }

  advanceUntilChars(ch: number[]) {
    while (this._offset + ch.length <= this.source.length) {
      let i = 0;

      for (; i < ch.length && this.source.charCodeAt(this._offset + i) === ch[i]; i++) {
        // ..
      }

      if (i === ch.length) {
        return true;
      }

      this.advance(1);
    }

    this.goToEnd();

    return false;
  }

  advanceUntilRegExp(regex: RegExp) {
    const str = this.source.substr(this._offset);
    const match = regex.exec(str);

    if (match) {
      this._offset = this._offset + match.index;
      return match[0];
    }
    else {
      this.goToEnd();
    }

    return '';
  }

  advanceIfNewline() {
    if (this.advanceIfChar(charCode.CAR)) {
      this.advanceIfChar(charCode.NWL);
      return true;
    }
    else {
      return this.advanceIfCharOr([charCode.NWL, charCode.LFD]);
    }
  }

  advanceUntilNewline() {
    return this.advanceIfCbTrue((ch) => !isNewline(ch));
  }

  skipWhitespace() {
    return this.advanceWhileChar(isWhiteSpace) > 0;
  }

  advanceWhileChar(condition: (ch: number) => boolean) {
    const posNow = this._offset;

    while (this._offset < this._length && condition(this.source.charCodeAt(this._offset))) {
      this._offset++;
    }

    return this._offset - posNow;
  }
}
