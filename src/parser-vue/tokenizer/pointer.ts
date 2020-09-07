import { isWhiteSpace } from './constant';

/** 字符串指针类 */
export class CodePointer {
    private _source: string;
    private _length: number;
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

    goBackTo(pos: number) {
        this._offset = pos;
    }

    goBack(n: number) {
        this._offset -= n;
    }

    advance(n: number) {
        this._offset += n;
    }

    goToEnd() {
        this._offset = this.source.length;
    }

    nextChar() {
        return this.source.charCodeAt(this._offset++) || 0;
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

    advanceIfRegExp(regex: RegExp) {
        const str = this.source.substr(this._offset);
        const match = str.match(regex);

        if (match) {
            this._offset = this._offset + match.index! + match[0].length;
            return match[0];
        }

        return '';
    }

    advanceUntilChar(ch: number, advanceChar = false) {
        while (this._offset < this.source.length) {
            if (this.source.charCodeAt(this._offset) === ch) {
                if (advanceChar) {
                    this.advance(1);
                }

                return true;
            }

            this.advance(1);
        }

        return false;
    }

    advanceUntilChars(ch: number[], advanceChar = false) {
        while (this._offset + ch.length <= this.source.length) {
            let i = 0;

            while (i < ch.length && this.source.charCodeAt(this._offset + i) === ch[i]) {
                i++;
            }

            if (i === ch.length) {
                if (advanceChar) {
                    this.advance(ch.length);
                }

                return true;
            }

            this.advance(1);
        }

        this.goToEnd();

        return false;
    }

    advanceUntilRegExp(regex: RegExp) {
        const str = this.source.substr(this._offset);
        const match = str.match(regex);

        if (match) {
            this._offset = this._offset + match.index!;
            return match[0];
        }
        else {
            this.goToEnd();
        }

        return '';
    }

    skipWhitespace() {
        return this.advanceWhileTrue(isWhiteSpace) > 0;
    }

    advanceWhileTrue(condition: (ch: number) => boolean) {
        const posNow = this._offset;

        while (this._offset < this._length && condition(this.source.charCodeAt(this._offset))) {
            this._offset++;
        }

        return this._offset - posNow;
    }
}
