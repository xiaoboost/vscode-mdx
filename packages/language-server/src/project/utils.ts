import * as ts from 'typescript';
import * as fs from 'fs';

import compare from 'compare-versions';

import type { ServiceHostFileSystem } from '@mdx/language-host-typescript';

export const tsModule: typeof ts = (() => {
  try {
    const tsInternal = require('typescript');

    if (compare(tsInternal.version, ts.version) >= 0) {
      return tsInternal;
    }
    else {
      return ts;
    }
  }
  catch (e) {
    return ts;
  }
})();

export const fileSystem: ServiceHostFileSystem = {
  readFile(target) {
    try {
      return fs.readFileSync(target, 'utf-8');
    }
    catch (e) {
      return;
    }
  },
  readDir(target) {
    try {
      return fs.readdirSync(target);
    }
    catch (e) {
      return [];
    }
  },
  stat(target) {
    try {
      return fs.statSync(target);
    }
    catch (e) {
      return;
    }
  },
};
