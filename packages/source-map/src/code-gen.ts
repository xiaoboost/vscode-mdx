import { Mode, Mapping } from './types';
import { OffsetRange } from '@mdx/utils';

export class CodeGen {
  /** 映射后的代码 */
  private _mapped = '';
  /** 映射数据 */
  private readonly _mappings: Mapping[] = [];

  getMappedCode() {
    return this._mapped;
  }
  getMappings() {
    return this._mappings.slice();
  }
  addText(str: string) {
    const range: OffsetRange = {
      start: this._mapped.length,
      end: this._mapped.length + str.length,
    };

    this._mapped += str;

    return range;
  }
  addMapping(data: Mapping) {
    this._mappings.push(data);
  }
  addCode(str: string, mode: Mode, sourceRange: OffsetRange) {
    const targetRange = this.addText(str);

    this.addMapping({
      mappedRange: targetRange,
      sourceRange,
      mode,
    });

    return targetRange;
  }
}
