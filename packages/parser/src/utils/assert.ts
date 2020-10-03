import { charCode } from './code';

export const newlineChars = [charCode.NWL, charCode.CAR, charCode.LFD];

/** 换行符 */
export function isNewline(char: number) {
  return newlineChars.includes(char);
}

/** 行内空白字符 */
export function isLineSpace(char: number) {
  return char === charCode.WSP || char === charCode.TAB;
}


/** 空白字符 */
export function isWhiteSpace(char: number) {
  return isNewline(char) || isLineSpace(char);
}
