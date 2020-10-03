import { ServiceHost } from '@mdx/language-host-typescript';
import { DiskController } from '@mdx/file-system';
import { toFsPath } from '@mdx/utils';
import { tsModule, fileSystem } from './utils';
import { getLanguageService, LanguageService } from '@mdx/language-service';
import { fs as vfs } from '../store';

import type { TextDocument } from 'vscode-languageserver-textdocument';

import {
  Diagnostic,
  Position,
} from '@mdx/language-service';

export class ProjectServer implements Omit<LanguageService, 'getId'> {
  /** 项目根目录 */
  readonly root: string;
  /** 虚拟文件系统 */
  readonly vfs: DiskController;
  /** ts 语言主机 */
  readonly tsHost: ServiceHost;
  /** 语言服务器 */
  readonly language: LanguageService;

  constructor(root: string) {
    this.root = toFsPath(root);
    this.vfs = vfs;
    this.tsHost = new ServiceHost(this.root, fileSystem, vfs, tsModule);
    this.language = getLanguageService(vfs, this.tsHost);
  }

  doValidation?(text: TextDocument): Diagnostic[] {
    return this.language.doValidation?.(text) ?? [];
  }
  doHover(text: TextDocument, position: Position) {
    return this.language.doHover?.(text, position);
  }
  doComplete(text: TextDocument, position: Position) {
    return this.language.doComplete?.(text, position);
  }

  dispose() {
    this.language.dispose?.();
  }
}
