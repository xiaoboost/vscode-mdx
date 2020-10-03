import type * as ts from 'typescript';
import * as path from 'path';

import { TsConfigData } from './types';

export function getScriptSnapshot(code: string): ts.IScriptSnapshot {
  return {
    getText: (start, end) => code.substring(start, end),
    getLength: () => code.length,
    getChangeRange: () => void 0,
  };
}

export function getScriptKind(fileName: string, tsModule: typeof ts): ts.ScriptKind {
  const ext = path.extname(fileName);

  switch (ext) {
    case '.ts':
      return tsModule.ScriptKind.TS;
    case '.tsx':
      return tsModule.ScriptKind.TSX;
    case '.jsx':
      return tsModule.ScriptKind.JSX;
    default:
      return tsModule.ScriptKind.JS;
  }
}

export function getDefaultTsConfig(): TsConfigData {
  return {
    compilerOptions: {},
    include: ['**'],
    exclude: ['node_modules'],
  };
}

export enum ConfigFile {
  Ts = 'tsconfig.json',
  Js = 'jsconfig.json',
}
