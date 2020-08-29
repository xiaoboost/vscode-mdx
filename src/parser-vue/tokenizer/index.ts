import { TokenType, ScannerState } from './types';
import { CodePointer } from './pointer';
import { code, errorText } from './constant';

export * from './types';

/** Token 标记扫描器 */
export class Scanner {
    private _pointer: CodePointer;
    private _tokenType = TokenType.Unknown;
    private _tokenStart = 0;
    private _tokenError?: string;
    private _state = ScannerState.WithinContent;

    private _lastTag = '';
    private _lastAttributeName = '';
    private _hasSpaceAfterTag = false;
    private _lastAttrMark: number | null = null;
    private _lastState = ScannerState.WithinContent;

    constructor(code: string) {
        this._pointer = new CodePointer(code);
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

    get tokenText() {
        return this._pointer.source.substring(this._tokenStart, this._pointer.pos);
    }

    get tokenError() {
        return this._tokenError;
    }

    private nextElementName() {
        return this._pointer.advanceIfRegExp(/^[_:\w][_:\w-.\d]*/);
    }

    private nextAttributeName() {
        return this._pointer.advanceIfRegExp(/^[^\s"'></=\x00-\x0F\x7F\x80-\x9F]*/);
    }

    private finishToken(startOffset: number, type: TokenType, errorMessage?: string) {
        this._tokenType = type;
        this._tokenStart = startOffset;
        this._tokenError = errorMessage;

        return type;
    }

    private scanCodeContent(tagName: 'Script' | 'Style') {
        const { _pointer: pointer } = this;
        const matcher = new RegExp(`\\/\\*|\\/\\/|'|"|\`|<\\/${tagName.toLowerCase()}\\s*\\/?>?`, 'i');

        while (!pointer.eos) {
            const match = pointer.advanceIfRegExp(matcher);

            // 未匹配到结束标志，扫描结束
            if (match.length === 0) {
                pointer.goToEnd();
                return this.finishToken(this.tokenStart, TokenType[tagName]);
            }
            else if (match === '/*') {
                // ..
            }
            else if (match === '//') {
                // ..
            }
            else if (match === '\'') {
                // ..
            }
            else if (match === '"') {
                // ..
            }
            else if (match === '`') {
                // ..
            }
            // 结束标签
            else {
                // ..
            }
        }

        this._state = ScannerState.WithinContent;

        if (this.tokenStart < pointer.pos) {
            return this.finishToken(this.tokenStart, TokenType.Script);
        }

        return this.scan();
    }

    /** 扫描下一个标记 */
    scan(): TokenType {
        const { _pointer: pointer } = this;

        if (pointer.eos) {
            return this.finishToken(pointer.pos, TokenType.EOS);
        }

        let errorMessage = '';
        const startOffset = pointer.pos;

        switch (this.state) {
            case ScannerState.WithinComment: {
                // '-->'
                if (pointer.advanceIfChars([code.MIN, code.MIN, code.RAN])) {
                    this.state = ScannerState.WithinContent;
                    return this.finishToken(startOffset, TokenType.EndCommentTag);
                }

                // '-->'
                pointer.advanceUntilChars([code.MIN, code.MIN, code.RAN]);
                return this.finishToken(startOffset, TokenType.Comment);
            }
            case ScannerState.WithinContent: {
                // '<'
                if (pointer.advanceIfChar(code.LAN)) {
                    // '!'
                    if (!pointer.eos && pointer.peekChar() === code.BNG) {
                        // '<!--'
                        if (pointer.advanceIfChars([code.BNG, code.MIN, code.MIN])) {
                            this.state = ScannerState.WithinComment;
                            return this.finishToken(startOffset, TokenType.StartCommentTag);
                        }
                    }

                    // '/'
                    if (pointer.advanceIfChar(code.FSL)) {
                        this.state = ScannerState.AfterOpeningEndTag;
                        return this.finishToken(startOffset, TokenType.EndTagOpen);
                    }

                    this.state = ScannerState.AfterOpeningStartTag;
                    return this.finishToken(startOffset, TokenType.StartTagOpen);
                }
                // '{{'
                else if (pointer.advanceIfChars([code.LBR, code.LBR])) {
                    this.state = ScannerState.WithinMustache;
                    return this.finishToken(startOffset, TokenType.ContentMustacheStart);
                }
                // 纯文本，直到 '{{' 或者 '<'
                else {
                    pointer.advanceUntilRegExp(/({{|<)/);
                    return this.finishToken(startOffset, TokenType.Content);
                }
            }
            case ScannerState.AfterOpeningEndTag: {
                const tagName = this.nextElementName();

                if (tagName.length > 0) {
                    this.state = ScannerState.WithinEndTag;
                    return this.finishToken(startOffset, TokenType.EndTag);
                }

                // 非法空格
                if (pointer.skipWhitespace()) {
                    return this.finishToken(startOffset, TokenType.Whitespace, errorText.unexpectedWhitespace);
                }

                this.state = ScannerState.WithinEndTag;
                pointer.advanceUntilChar(code.RAN);

                if (startOffset < pointer.pos) {
                    return this.finishToken(startOffset, TokenType.Unknown, errorText.endTagNameExpected);
                }

                return this.scan();
            }
            case ScannerState.WithinEndTag: {
                // 非法空格
                if (pointer.skipWhitespace()) {
                    return this.finishToken(startOffset, TokenType.Whitespace);
                }

                // '>'
                if (pointer.advanceIfChar(code.RAN)) {
                    this.state = ScannerState.WithinContent;
                    return this.finishToken(startOffset, TokenType.EndTagClose);
                }

                // '<'
                if (pointer.peekChar() === code.LAN) {
                    this.state = ScannerState.WithinContent;
                    return this.finishToken(startOffset, TokenType.EndTagClose, errorText.closingBracketMissing);
                }

                errorMessage = errorText.closingBracketExpected;
                break;
            }
            case ScannerState.AfterOpeningStartTag: {
                this._lastTag = this.nextElementName();
                this._lastAttributeName = '';

                if (this._lastTag.length > 0) {
                    this._hasSpaceAfterTag = false;
                    this.state = ScannerState.WithinTag;
                    return this.finishToken(startOffset, TokenType.StartTag);
                }

                // 非法空白
                if (pointer.skipWhitespace()) {
                    return this.finishToken(startOffset, TokenType.Whitespace, errorText.unexpectedWhitespace);
                }

                // 结束标签
                if (pointer.advanceIfChars([code.LAN, code.FSL])) {
                    this.state = ScannerState.AfterOpeningEndTag;
                    return this.finishToken(startOffset, TokenType.EndTagOpen);
                }

                this.state = ScannerState.WithinTag;
                pointer.advanceUntilChar(code.RAN);

                if (startOffset < pointer.pos) {
                    return this.finishToken(startOffset, TokenType.Unknown, errorText.startTagNameExpected);
                }

                return this.scan();
            }
            case ScannerState.WithinTag: {
                // 跳过空白
                if (pointer.skipWhitespace()) {
                    this._hasSpaceAfterTag = true;
                    return this.finishToken(startOffset, TokenType.Whitespace);
                }

                // 确实跳过了空白，接下来才允许是属性名称
                if (this._hasSpaceAfterTag) {
                    this._lastAttributeName = this.nextAttributeName();

                    if (this._lastAttributeName.length > 0) {
                        this._hasSpaceAfterTag = false;
                        this.state = ScannerState.AfterAttributeName;

                        return this.finishToken(startOffset, TokenType.AttributeName);
                    }
                }

                // '/>'
                if (pointer.advanceIfChars([code.FSL, code.RAN])) {
                    this.state = ScannerState.WithinContent;
                    return this.finishToken(startOffset, TokenType.StartTagSelfClose);
                }

                // '>'
                if (pointer.advanceIfChar(code.RAN)) {
                    if (this._lastTag === 'script') {
                        this.state = ScannerState.WithinScriptContent;
                    }
                    else if (this._lastTag === 'style') {
                        this.state = ScannerState.WithinStyleContent;
                    }
                    else {
                        this.state = ScannerState.WithinContent;
                    }

                    return this.finishToken(startOffset, TokenType.StartTagClose);
                }

                // '<'
                if (pointer.peekChar() === code.LAN) {
                    this.state = ScannerState.WithinContent;
                    return this.finishToken(startOffset, TokenType.StartTagClose, errorText.closingBracketMissing);
                }

                pointer.advance(1);
                return this.finishToken(startOffset, TokenType.Unknown, errorText.unexpectedCharacterInTag);
            }
            case ScannerState.WithinMustache: {
                const isStart = this._tokenType === TokenType.ContentMustacheStart;

                // '}}'
                if (pointer.advanceIfChars([code.RBR, code.RBR])) {
                    this.state = this._lastState;

                    const err = isStart ? errorText.mustacheCannotBeEmpty : undefined;
                    const endType = TokenType.ContentMustacheEnd;

                    return this.finishToken(startOffset, endType, err);
                }
                // 纯文本，直到 '}}'
                else {
                    const result = pointer.advanceUntilChars([code.RBR, code.RBR]);
                    const err = result ? undefined : errorText.mustacheEndExpected;

                    return this.finishToken(startOffset, TokenType.ContentMustache, err);
                }
            }
            case ScannerState.AfterAttributeName: {
                // 跳过空白
                if (pointer.skipWhitespace()) {
                    this._hasSpaceAfterTag = true;
                    return this.finishToken(startOffset, TokenType.Whitespace);
                }

                if (pointer.advanceIfChar(code.EQS)) {
                    this.state = ScannerState.BeforeAttributeValue;
                    return this.finishToken(startOffset, TokenType.DelimiterAssign);
                }

                this.state = ScannerState.WithinTag;
                return this.scan();
            }
            case ScannerState.BeforeAttributeValue: {
                // 跳过空白
                if (pointer.skipWhitespace()) {
                    return this.finishToken(startOffset, TokenType.Whitespace);
                }

                const ch = pointer.peekChar();

                this.state = ScannerState.WithinAttributeValue;

                // 单引号或者双引号
                if (ch === code.SQO || ch === code.DQO) {
                    pointer.advance(1);
                    this._lastAttrMark = ch;
                    return this.finishToken(startOffset, TokenType.AttributeMark);
                }

                this._lastAttrMark = null;
                return this.scan();
            }
            case ScannerState.WithinAttributeValue: {
                // TODO: attribute 内部也是支持完整 js 语法的，这里也需要按照代码块的需求去识别

                // 存在分割标记
                if (this._lastAttrMark) {
                    if (pointer.advanceIfChar(this._lastAttrMark)) {
                        this.state = ScannerState.WithinTag;
                        return this.finishToken(startOffset, TokenType.AttributeValueMark);
                    }
                    else {
                        const markChar = String.fromCharCode(this._lastAttrMark);
                        pointer.advanceUntilRegExp(new RegExp(`({{|${markChar})`));
                        return this.finishToken(startOffset, TokenType.AttributeValueText);
                    }
                }
                else {
                    // 空白
                    if (pointer.skipWhitespace()) {
                        this._hasSpaceAfterTag = true;
                        this.state = ScannerState.WithinTag;
                        return this.finishToken(startOffset, TokenType.Whitespace);
                    }

                    // '/'
                    if (pointer.advanceIfChar(code.FSL)) {
                        // <foo bar=http://foo/>
                        if (pointer.peekChar() === code.RAN) {
                            pointer.goBack(1);
                            this._hasSpaceAfterTag = false;
                            this.state = ScannerState.WithinContent;
                            return this.finishToken(startOffset, TokenType.StartTagClose);
                        }
                        else {
                            return this.scan();
                        }
                    }

                    // '>'
                    if (pointer.advanceIfChar(code.RAN)) {
                        this.state = ScannerState.WithinContent;
                        return this.finishToken(startOffset, TokenType.StartTagClose);
                    }

                    // 纯文本，直到 /> > 以及所有空白字符
                    pointer.advanceUntilRegExp(/(\s|\/>|>)/);
                    return this.finishToken(startOffset, TokenType.AttributeValueText);
                }
            }
            case ScannerState.WithinScriptContent: {
                return this.scanCodeContent('Script');
            }
            case ScannerState.WithinStyleContent: {
                return this.scanCodeContent('Style');
            }
        }

        pointer.advance(1);
        this.state = ScannerState.WithinContent;

        return this.finishToken(pointer.pos, TokenType.Unknown, errorMessage);
    }
}
