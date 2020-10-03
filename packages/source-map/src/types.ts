import { OffsetRange } from '@mdx/utils';

export enum Mode {
  /**
   * 按照偏移量映射
   *
   * @case1
   * 123456 -> abcdef
   * ^    ^    ^    ^
   * @case2
   * 123456 -> abcdef
   *  ^  ^      ^  ^
   * @case3
   * 123456 -> abcdef
   *   ^^        ^^
   */
  Offset,
  /**
   * 只映射起点和终点
   *
   * @case1
   * 123456 -> abcdef
   * ^    ^    ^    ^
   * @case2
   * 123456 -> abcdef
   *  ^  ^     NOT_MATCH
   * @case3
   * 123456 -> abcdef
   *   ^^      NOT_MATCH
   */
  Totally,
  /**
   * 任意点都映射到起点和终点
   *
   * @case1
   * 123456 -> abcdef
   * ^    ^    ^    ^
   * @case2
   * 123456 -> abcdef
   *  ^  ^     ^    ^
   * @case3
   * 123456 -> abcdef
   *   ^^      ^    ^
   */
  Expand,
}

export interface Mapping {
  mode: Mode;
  sourceRange: OffsetRange;
  mappedRange: OffsetRange;
}
