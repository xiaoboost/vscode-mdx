import type * as ts from 'typescript';

import { isMdxJsx } from '@mdx/utils';

interface ModuleResolutionData {
  [containingFile: string]: {
    [moduleName: string]: ts.ResolvedModule;
  };
}

/** 模块搜索缓存 */
export class ModuleResolutionCache {
  private _cache: ModuleResolutionData = {};

  getCache(moduleName: string, containingFile: string): ts.ResolvedModule | undefined {
    if (this._cache[containingFile]) {
      return this._cache[containingFile][moduleName];
    }
    // else if (isMdxJsx(containingFile)) {
    //   this._cache[containingFile] = this._cache[`${containingFile}${templateSuffix}`] = {};
    // }
    // else if (containingFile.endsWith('.ly.ttml')) {
    //   this._cache[containingFile.slice(0, -5)] = this._cache[containingFile] = {};
    // }
    else {
      this._cache[containingFile] = {};
    }

    return undefined;
  }

  setCache(moduleName: string, containingFile: string, cache: ts.ResolvedModule) {
    if (this._cache[containingFile]) {
      this._cache[containingFile][moduleName] = cache;
    }
    else if (!this._cache[containingFile]) {
      // if (containingFile.endsWith(sfcSuffix)) {
      //   this._cache[containingFile] = this._cache[`${containingFile}${templateSuffix}`] = {};
      // }
      // else if (containingFile.endsWith('.ly.ttml')) {
      //   this._cache[containingFile.slice(0, -5)] = this._cache[containingFile] = {};
      // }
      // else {
      //   this._cache[containingFile] = {};
      // }
    }
  }
}
