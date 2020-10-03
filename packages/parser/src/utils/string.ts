import { isWhiteSpace } from './assert';

export function offsetNotWhiteSpaceStart(text: string) {
  let start = 0;

  while (isWhiteSpace(text.charCodeAt(start))) {
    start++;
  }

  return start;
}

export function offsetNotWhiteSpaceEnd(text: string) {
  let end = 0;

  while (isWhiteSpace(text.charCodeAt(text.length - end - 1))) {
    end++;
  }

  return end;
}
