import { Mode, Mapping } from './types';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { OffsetRange } from '@mdx/utils';

export class SourceMap {
  /** 源代码 */
  private readonly _source: TextDocument;
  /** 映射后的代码 */
  private readonly _mapped: TextDocument;
  /** 映射数据 */
  private readonly _mappings: Mapping[];
  /** 范围缓存 */
  private readonly rangeCache = new Map<string, OffsetRange[]>();
  /** 偏移缓存 */
  private readonly offsetCache = new Map<string, number[]>();

  constructor(source: TextDocument, mapped: TextDocument, mappings: Mapping[] = []) {
    this._source = source;
    this._mapped = mapped;
    this._mappings = mappings;
  }

  get source() {
    return this._source;
  }
  get mapped() {
    return this._mapped;
  }

  private getRange(
    start: number,
    end: number,
    sourceToTarget: boolean,
    mode: Mode,
    sourceRange: OffsetRange,
    targetRange: OffsetRange,
  ) {
    const mappedToRange = sourceToTarget ? targetRange : sourceRange;
    const mappedFromRange = sourceToTarget ? sourceRange : targetRange;
    if (mode === Mode.Totally) {
      if (start === mappedFromRange.start && end === mappedFromRange.end) {
        const _start = mappedToRange.start;
        const _end = mappedToRange.end;
        return {
          start: Math.min(_start, _end),
          end: Math.max(_start, _end),
        };
      }
    }
    else if (mode === Mode.Offset) {
      if (start >= mappedFromRange.start && end <= mappedFromRange.end) {
        const _start = mappedToRange.start + start - mappedFromRange.start;
        const _end = mappedToRange.end + end - mappedFromRange.end;
        return {
          start: Math.min(_start, _end),
          end: Math.max(_start, _end),
        };
      }
    }
    else if (mode === Mode.Expand) {
      if (start >= mappedFromRange.start && end <= mappedFromRange.end) {
        const _start = mappedToRange.start;
        const _end = mappedToRange.end;
        return {
          start: Math.min(_start, _end),
          end: Math.max(_start, _end),
        };
      }
    }
  }
  private getOffset(
    offset: number,
    sourceToTarget: boolean,
    mode: Mode,
    sourceRange: OffsetRange,
    targetRange: OffsetRange,
  ) {
    const mappedToRange = sourceToTarget ? targetRange : sourceRange;
    const mappedFromRange = sourceToTarget ? sourceRange : targetRange;

    if (mode === Mode.Totally) {
      if (offset === mappedFromRange.start) {
        return mappedToRange.start;
      }
      else if (offset === mappedFromRange.end) {
        return mappedToRange.end;
      }
    }
    else if (mode === Mode.Offset) {
      if (offset >= mappedFromRange.start && offset <= mappedFromRange.end) {
        const _start = mappedToRange.start + offset - mappedFromRange.start;
        const _end = mappedToRange.end + offset - mappedFromRange.end;
        return Math.min(_start, _end);
      }
    }
    else if (mode === Mode.Expand) {
      if (offset >= mappedFromRange.start && offset <= mappedFromRange.end) {
        const _start = mappedToRange.start;
        const _end = mappedToRange.end;
        return Math.min(_start, _end);
      }
    }
  }
  private getRanges(start: number, end: number, sourceToTarget: boolean) {
    const key = start + ':' + end + ':' + sourceToTarget;

    if (this.rangeCache.has(key)) {
      return this.rangeCache.get(key)!;
    }

    const result: OffsetRange[] = [];

    for (const mapping of this._mappings) {
      const mapped = this.getRange(
        start,
        end,
        sourceToTarget,
        mapping.mode,
        mapping.sourceRange,
        mapping.mappedRange,
      );

      if (mapped) {
        result.push(mapped);
      }
    }

    this.rangeCache.set(key, result);

    return result;
  }
  private getOffsets(offset: number, sourceToTarget: boolean) {
    const key = offset + ':' + sourceToTarget;

    if (this.offsetCache.has(key)) {
      return this.offsetCache.get(key)!;
    }

    const result: number[] = [];

    for (const mapping of this._mappings) {
      const mapped = this.getOffset(
        offset,
        sourceToTarget,
        mapping.mode,
        mapping.sourceRange,
        mapping.mappedRange,
      );

      if (mapped) {
        result.push(mapped);
      }
    }

    this.offsetCache.set(key, result);

    return result;
  }

  isSourceRange(start: number, end: number) {
    return this.getRanges(start, end, true).length > 0;
  }
  isMappedRange(start: number, end: number) {
    return this.getRanges(start, end, false).length > 0;
  }
  getSourceRange(start: number, end: number): OffsetRange | undefined {
    return this.getRanges(start, end, false)[0];
  }
  getMappedRange(start: number, end: number): OffsetRange | undefined {
    return this.getRanges(start, end, true)[0];
  }
  getSourceRanges(start: number, end: number) {
    return this.getRanges(start, end, false);
  }
  getMappedRanges(start: number, end: number) {
    return this.getRanges(start, end, true);
  }

  isSourceOffset(offset: number) {
    return this.getOffsets(offset, true).length > 0;
  }
  isMappedOffset(offset: number) {
    return this.getOffsets(offset, false).length > 0;
  }
  getSourceOffset(offset: number): number | undefined {
    return this.getOffsets(offset, false)[0];
  }
  getMappedOffset(offset: number): number | undefined {
    return this.getOffsets(offset, true)[0];
  }
  getSourceOffsets(offset: number): number[] {
    return this.getOffsets(offset, false);
  }
  getMappedOffsets(offset: number): number[] {
    return this.getOffsets(offset, true);
  }
}
