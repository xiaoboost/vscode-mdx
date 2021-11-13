import * as path from 'path';

import { TextDocument } from 'vscode-languageserver-textdocument';

import { BaseCode, MdxCode } from '../code';
import { isString, isDef } from '@xiao-ai/utils';

import {
  Stat,
  FileChangeType,
  OnChangeFilesParams,
  VirtualFileEvent,
  VirtualFileChangeType,
  VirtualFileEventCallback,
} from './types';

import {
  isSubpath,
  toFsPath,
  toURI,
  normalize,
  dirnames,
  isMdxFile,
} from '@mdx/utils';

export class DiskController {
  /** 所有代码 */
  readonly codes = new Map<string, BaseCode>();
  /** 所有文件 */
  private _files = new Map<string, TextDocument>();
  /** 所有文件夹 */
  private _directories = new Set<string>();

  /** 变更事件定时器 */
  private _fileChangeTimer?: NodeJS.Timer;
  /** 变更代码数据储存 */
  private _fileChangeData: VirtualFileEvent[] = [];
  /** 变更事件储存 */
  private _fileChangeEvents: VirtualFileEventCallback[] = [];

  /** 储存所有文件夹路径 */
  private storeDirs(target: string) {
    for (const fsPath of dirnames(target)) {
      if (this._directories.has(fsPath)) {
        break;
      }

      this._directories.add(fsPath);
    }
  }
  /** 添加变更数据 */
  private addFileChangeData(data: VirtualFileEvent) {
    if (!this._fileChangeTimer) {
      this._fileChangeTimer = setTimeout(() => {
        this.runFileChangeCallback();
        this._fileChangeTimer = undefined;
      });
    }

    this._fileChangeData.push(data);
  }
  /** 执行变更数据回调 */
  private runFileChangeCallback() {
    for (const ev of this._fileChangeEvents) {
      ev({ changes: this._fileChangeData });
    }

    this._fileChangeTimer = undefined;
    this._fileChangeData.length = 0;
  }

  // 事件接口
  /** 文件变更 */
  filesChange({ changes }: OnChangeFilesParams) {
    for (const event of changes) {
      const fsPath = toFsPath(event.uri ?? event.document?.uri ?? '');

      if (!fsPath) {
        continue;
      }

      // 文件系统中删除
      if (event.type === FileChangeType.Deleted) {
        if (isMdxFile(fsPath)) {
          // TODO:
        }
        else {
          this.rm(fsPath);
        }
      }
      // 编辑器中关闭
      else if (event.type === FileChangeType.Closed) {
        // 只有 md 文件需要检测是否从缓存中删除
        if (isMdxFile(fsPath)) {
          // TODO:
        }
      }
      // 文档变更或者创建
      else if (
        event.type === FileChangeType.Changed ||
        event.type === FileChangeType.Created
      ) {
        if (!event.document) {
          continue;
        }

        if (isMdxFile(fsPath)) {
          const code = (
            this.getCode(fsPath)
              ?? new MdxCode(event.document, this)
          );

          code.parse();
        }
        else {
          this.writeFile(event.document);
        }
      }
    }
  }
  /** 虚拟文件变更 */
  onVirtualFileChange(cb: VirtualFileEventCallback) {
    this._fileChangeEvents.push(cb);
  }

  // 代码系统
  /** 获取当前代码 */
  getCode<T extends BaseCode>(target: string, offset?: number): T | undefined {
    const fsPath = normalize(target);
    const find = this.codes.get(fsPath) as T;

    if (!isDef(offset) || find.lang === 'text') {
      return find;
    }

    const code = find as unknown as MdxCode;
    const children = ([] as (BaseCode | undefined)[])
      .concat(code.blockCodes)
      .concat([code.jsxCode, code.mdCode]);

    return children.find((child) => {
      return child?.sourceMap?.isSourceOffset(offset);
    }) as T | undefined;
  }

  // 文件系统
  /** 读取文件 */
  readFile(target: string) {
    return this._files.get(normalize(target));
  }
  /** 写入文件 */
  writeFile(document: TextDocument): TextDocument | undefined;
  writeFile(target: string, content: string): TextDocument | undefined;
  writeFile(target: string | TextDocument, content?: string): TextDocument | undefined {
    if (isString(target)) {
      if (!content) {
        content = '';
      }
    }
    else {
      content = target.getText();
      target = toFsPath(target.uri);
    }

    const fsPath = normalize(target);

    // 路径是文件夹，则直接退出
    if (this._directories.has(fsPath)) {
      return;
    }

    let document = this._files.get(fsPath);

    if (document) {
      if (document.getText() !== content) {
        TextDocument.update(
          document,
          [{ text: content }],
          document.version + 1,
        );

        this.addFileChangeData({
          type: VirtualFileChangeType.Changed,
          document,
        });
      }
    }
    else {
      document = TextDocument.create(
        toURI(fsPath, 'file'),
        path.extname(fsPath).slice(1),
        1,
        content,
      );

      this.addFileChangeData({
        type: VirtualFileChangeType.Changed,
        document,
      });

      this.storeDirs(path.dirname(fsPath));
      this._files.set(fsPath, document);
    }

    return document;
  }
  /** 写入文件堆 */
  fillFiles(files: Record<string, string>, basePath = '') {
    for (const origin of Object.keys(files)) {
      const filePath = path.join(basePath, origin);
      const content = files[origin];
      this.writeFile(filePath, content);
    }
  }
  /** 读取文件夹的下级元素 */
  readdir(target: string): string[] {
    const fsPath = normalize(target);
    const len = fsPath.length;
    const getChildPath = (paths: string[]) => {
      return paths
        .filter((item) => item.length > len)
        .filter((item) => path.dirname(item) === fsPath)
        .map((item) => path.relative(fsPath, item))
    };

    return (
      getChildPath(Array.from(this._directories))
        .concat(getChildPath(Array.from(this._files.keys())))
    );
  }
  /** 读取路径状态 */
  stat(target: string): Stat | undefined {
    const fsPath = normalize(target);
    if (this._directories.has(fsPath)) {
      return {
        isDirectory: () => true,
      };
    }
    else if (this._files.has(fsPath)) {
      return {
        isDirectory: () => false,
      };
    }
  }
  /** 移除目标路径项 */
  rm(target: string) {
    const fsPath = normalize(target);

    // 移除文件
    if (this._files.has(fsPath)) {
      this.addFileChangeData({
        type: VirtualFileChangeType.Deleted,
        document: this._files.get(fsPath)!,
      });

      this._files.delete(fsPath);
      this.codes.delete(fsPath);
    }
    // 移除文件夹
    else if (this._directories.has(fsPath)) {
      this._directories.forEach((key, _, set) => {
        if (fsPath === key || isSubpath(fsPath, key)) {
          set.delete(key);
        }
      });
      this._files.forEach((_, key, map) => {
        if (isSubpath(fsPath, key)) {
          map.delete(key);
        }
      });
    }

    for (const dir of dirnames(fsPath)) {
      this._directories.delete(dir);

      if (this.readdir(dir).length > 0) {
        break;
      }
    }
  }
}
