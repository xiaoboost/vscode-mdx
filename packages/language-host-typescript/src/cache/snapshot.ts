import type * as ts from 'typescript';

import { getScriptSnapshot } from '../utils';

/** 代码快照缓存 */
export class SnapshotCache {
  /** 文件名称集合 */
  private readonly names = new Set<string>();
  /** 文件版本号缓存 */
  private readonly versions = new Map<string, number>();
  /** 代码快照缓存 */
  private readonly snapshots = new Map<string, ts.IScriptSnapshot>();

  /** 文件是否存在 */
  has(file: string) {
    return this.names.has(file);
  }

  /** 获取所有文件名称 */
  getNames() {
    return Array.from(this.names);
  }

  /** 获取文件版本号 */
  getVersion(file: string) {
    return this.versions.get(file) ?? 0;
  }

  /** 设置文件版本号 */
  setVersion(file: string, version = this.getVersion(file) + 1) {
    this.versions.set(file, version);
  }

  /** 新增文件 */
  addScript(file: string, content?: string) {
    if (!this.names.has(file)) {
      this.names.add(file);
    }

    if (content) {
      this.snapshots.set(file, getScriptSnapshot(content));
      this.setVersion(file);
    }
  }

  /** 获取代码快照 */
  getSnapshot(file: string) {
    return this.snapshots.get(file);
  }

  /** 移除文件缓存 */
  delete(file: string) {
    const r1 = this.names.delete(file);
    const r2 = this.versions.delete(file);
    const r3 = this.snapshots.delete(file);
    return r1 || r2 || r3;
  }
}
