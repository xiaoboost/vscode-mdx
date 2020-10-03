import type { TextDocument } from 'vscode-languageserver-textdocument';

export interface Stat {
  isDirectory(): boolean;
}

export enum FileChangeType {
  Created = 1,
  Changed,
  Deleted,
  Closed,
}

export interface FileEvent {
  type: FileChangeType;
  document?: TextDocument;
  uri?: string;
}

export interface OnChangeFilesParams {
  changes: FileEvent[];
}

export enum VirtualFileChangeType {
  Changed,
  Deleted,
}

export interface VirtualFileEvent {
  type: VirtualFileChangeType;
  document: TextDocument;
}

export interface OnChangeVirtualFilesParams {
  changes: VirtualFileEvent[];
}

export type VirtualFileEventCallback = (params: OnChangeVirtualFilesParams) => any;
