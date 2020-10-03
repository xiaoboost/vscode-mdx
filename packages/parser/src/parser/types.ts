import type { Root } from './node';
import type { OffsetRange } from '@mdx/utils';

export type Range = OffsetRange;

export interface ParserOptions {
  /** 是否是 mdx 代码 */
  isMdx: boolean;
}

export enum ParserSeverity {
  Ignore,
  Warn,
  Error,
}

export interface ParserError {
  name: string;
  message: string;
  severity: ParserSeverity;
  range: Range;
}

export interface ParseOutput {
  root: Root;
  errors: ParserError[];
}
