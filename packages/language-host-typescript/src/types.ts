import type * as ts from 'typescript';

export interface TsConfigData {
  compilerOptions: Record<string, ts.CompilerOptionsValue>;
  extends?: string;
  include?: string[];
  exclude?: string[];
}

export interface ServiceHostFileStat {
  isDirectory(): boolean;
}

export interface ServiceHostFileSystem {
  readFile(uri: string): string | undefined;
  readDir(uri: string): string[];
  stat(uri: string): ServiceHostFileStat | undefined;
}
