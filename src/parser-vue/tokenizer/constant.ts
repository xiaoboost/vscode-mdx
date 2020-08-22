/** 字符编码 */
export const code = {
    /** 惊叹号 */
    BNG: '!'.charCodeAt(0),
    /** 中横杠 */
    MIN: '-'.charCodeAt(0),
    /** 左尖括号 */
    LAN: '<'.charCodeAt(0),
    /** 右尖括号 */
    RAN: '>'.charCodeAt(0),
    /** 斜杠 */
    FSL: '/'.charCodeAt(0),
    /** 等号 */
    EQS: '='.charCodeAt(0),
    /** 星号 */
    STA: '*'.charCodeAt(0),
    /** 双引号 */
    DQO: '"'.charCodeAt(0),
    /** 单引号 */
    SQO: '\''.charCodeAt(0),
    /** 换行符 */
    NWL: '\n'.charCodeAt(0),
    /** 软空格 */
    CAR: '\r'.charCodeAt(0),
    /** 换页符 */
    LFD: '\f'.charCodeAt(0),
    /** 空格 */
    WSP: ' '.charCodeAt(0),
    /** 制表符 */
    TAB: '\t'.charCodeAt(0),
    /** 左花括号 */
    LBR: '{'.charCodeAt(0),
    /** 右花括号 */
    RBR: '}'.charCodeAt(0),
};

/** 错误文本 */
export const errorText = {
    unexpectedWhitespace: 'Tag name must directly follow the open bracket.',
    startTagNameExpected: 'Start tag name expected.',
    mustacheEndExpected: 'Mustache end expected.',
    closingBracketMissing: 'Closing bracket missing.',
    closingBracketExpected: 'Closing bracket expected.',
    unexpectedCharacterInTag: 'Unexpected character in tag.',
    endTagNameExpected: 'End tag name expected.',
    mustacheCannotBeEmpty: 'Mustache Can\'t Be Empty.',
};

/** 是否是空白 */
export function isWhiteSpace(ch: number) {
    return ch === code.WSP || ch === code.TAB || ch === code.NWL || ch === code.LFD || ch === code.CAR;
}
