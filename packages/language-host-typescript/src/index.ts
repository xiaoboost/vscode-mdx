import type ts from 'typescript';

import * as path from 'path';

import libFiles from '@mdx/language-internal';
import compare from 'compare-versions';

import { unique } from '@xiao-ai/utils';
import { SnapshotCache } from './cache/snapshot';
import { ModuleResolutionCache } from './cache/module-resolution';
import { TsConfigData, ServiceHostFileSystem } from './types';
import { isSubpath, toFsPath, printer } from '@mdx/utils';

import {
  getScriptKind,
  getDefaultTsConfig,
  ConfigFile,
} from './utils';

import {
  DiskController,
  OnChangeVirtualFilesParams,
  VirtualFileChangeType,
} from '@mdx/file-system';

export * from './types';

/** 语言宿主 */
export class ServiceHost {
  /** ts 库依赖 */
  private readonly tsModule: typeof ts;
  /** 项目根目录 */
  private readonly root: string;
  /** 数据缓存 */
  private readonly files = new SnapshotCache();
  /** 模块引入模块缓存 */
  private readonly moduleResolutionCache = new ModuleResolutionCache();
  /** 项目版本号 */
  private projectVersion = 1;
  /** 编译命令 */
  private parsedConfig: ts.ParsedCommandLine;
  /** 代理文件系统 */
  private mdxSys!: ts.System;
  /** 外部文件系统 */
  private fs: ServiceHostFileSystem;
  /** 虚拟文件系统 */
  private vfs: DiskController;
  /** 编译选项 */
  private tsConfigData: TsConfigData = getDefaultTsConfig();
  /**
   * 使用 tsconfig.json 文件
   *  - 否则使用 jsconfig.json
   */
  private useTsConfig = true;

  /** js/ts 语言服务器 */
  private jsHost: ts.LanguageServiceHost;
  /** 共享文档注册器 */
  private registry: ts.DocumentRegistry;
  /** js/ts 语言服务 */
  private jsLanguageService: ts.LanguageService;

  constructor(
    root: string,
    fs: ServiceHostFileSystem,
    vfs: DiskController,
    tsModule: typeof ts
  ) {
    this.root = root;
    this.fs = fs;
    this.vfs = vfs;
    this.tsModule = tsModule;

    this.projectVersion = 1;
    this.mdxSys = this.getMdxSys();
    this.parsedConfig = this.getParsedConfig();
    this.jsHost = this.createLanguageServiceHost();
    this.registry = this.tsModule.createDocumentRegistry(true);
    this.jsLanguageService = this.tsModule.createLanguageService(
      this.jsHost,
      this.registry
    );

    this.loadLibs();

    this.parsedConfig.fileNames.forEach((file) => this.files.addScript(file));
    this.vfs.onVirtualFileChange((param) => this.fileChange(param));
  }

  /** 载入内置类型文件 */
  private loadLibs() {
    const packageFile = 'package.json';
    const loadFiles: Record<string, string> = {};
    const allFiles = Object.keys(libFiles);
    const packages = allFiles
      .filter((file) => file.endsWith(packageFile))
      .filter((file) => {
        const realPath = path.join(this.root, file);
        const realFile = this.fs.readFile(realPath);

        // 实际文件不存在，保留此文件
        if (!realFile) {
          return true;
        }

        let realData: Record<string, string>;

        try {
          realData = JSON.parse(realFile);
        }
        catch (e) {
          return true;
        }

        const internalData: Record<string, string> = JSON.parse(libFiles[file]);

        // 小于 0，表示实际的小内置的，返回 true，保留内置数据
        return compare(realData.version, internalData.version) < 0;
      })
      .map((file) => path.dirname(file));

    for (const file of allFiles) {
      if (packages.some((name) => isSubpath(name, file))) {
        loadFiles[file] = libFiles[file];
      }
    }

    this.vfs.fillFiles(loadFiles, this.root);
  }
  /** 卸载内置类型文件 */
  private unloadLibs() {
    this.vfs.rm(this.root);
  }
  /** 创建内部语言服务器 */
  private createLanguageServiceHost(): ts.LanguageServiceHost {
    return {
      getProjectVersion: () => this.projectVersion.toString(),
      getCompilationSettings: () => this.getCompilerOptions(),
      getScriptFileNames: () => this.files.getNames(),
      getScriptVersion: (fileName) => {
        if (fileName.includes('node_modules')) {
          return '0';
        }

        return String(this.files.getVersion(fileName));
      },
      getScriptKind: (fileName) => {
        return getScriptKind(fileName, this.tsModule);
      },
      resolveModuleNames: (
        moduleNames: string[],
        containingFile: string,
      ): (ts.ResolvedModule | undefined)[] => {
        const compilerOptions = this.getCompilerOptions();
        const result: (ts.ResolvedModule | undefined)[] = moduleNames.map(
          (name) => {
            // 读取缓存
            const cachedResolvedModule = this.moduleResolutionCache.getCache(
              name,
              containingFile,
            );

            if (cachedResolvedModule) {
              return cachedResolvedModule;
            }

            // TODO: 引用 .md 文件


            // 引用普通 ts/js 文件
            const resolvedModule = this.tsModule.resolveModuleName(
              name,
              containingFile,
              compilerOptions,
              this.mdxSys
            ).resolvedModule;

            if (resolvedModule) {
              this.moduleResolutionCache.setCache(
                name,
                containingFile,
                resolvedModule
              );

              return resolvedModule;
            }
          }
        );

        return result;
      },
      getScriptSnapshot: (fileName: string) => {
        // 读取缓存
        if (this.files.has(fileName)) {
          const snapshot = this.files.getSnapshot(fileName);

          if (snapshot) {
            return snapshot;
          }
        }

        // printer.log('getScriptSnapshot', fileName);

        // 映射至虚拟文件地址
        // const fsPath = this.getVirtualPath(fileName);

        // 读取文件
        const fileText = this.mdxSys.readFile(fileName) ?? '';

        this.files.addScript(fileName, fileText);

        return this.files.getSnapshot(fileName);
      },
      getNewLine: () => '\n',
      useCaseSensitiveFileNames: () => true,
      getDirectories: this.mdxSys.getDirectories,
      directoryExists: this.mdxSys.directoryExists,
      fileExists: this.mdxSys.fileExists,
      readFile: this.mdxSys.readFile,
      readDirectory: this.mdxSys.readDirectory,
      getCurrentDirectory: this.mdxSys.getCurrentDirectory,
      getDefaultLibFileName: (options: ts.CompilerOptions) => {
        return this.tsModule.getDefaultLibFilePath(options);
        // if (isBrowser) {
        //   return path.join(
        //     this.root,
        //     'node_modules/typescript/lib',
        //     this.tsModule.getDefaultLibFileName(options),
        //   );
        // }
        // else if (isNode) {
        //   return this.tsModule.getDefaultLibFilePath(options);
        // }
        // else {
        //   return '';
        // }
      },
    };
  }
  /** 读取配置文件 */
  private readConfigFile() {
    // 优先读取 tsconfig
    let configFilePath = path.join(this.root, ConfigFile.Ts);
    let configFile = this.mdxSys.readFile(configFilePath);

    if (configFile) {
      this.useTsConfig = true;
      this.tsConfigData = this.tsModule.readConfigFile(
        configFilePath,
        this.mdxSys.readFile
      ).config;
    }
    // 否则再读取 jsconfig
    else {
      configFilePath = path.join(this.root, ConfigFile.Js);
      configFile = this.mdxSys.readFile(configFilePath);

      this.useTsConfig = false;

      if (configFile) {
        this.tsConfigData = this.tsModule.readConfigFile(
          configFilePath,
          this.mdxSys.readFile
        ).config;

        // jsconfig 需要强制设置 allowJs 为 true
        this.tsConfigData.compilerOptions.allowJs = true;
      }
      // 不存在配置文件，则取默认值
      else {
        this.tsConfigData = getDefaultTsConfig();
      }
    }

    this.tsConfigData.include = this.tsConfigData.include ?? [];
    this.tsConfigData.exclude = unique(
      ['node_modules'].concat(this.tsConfigData.exclude ?? [])
    );
  }
  /** 获取编译选项 */
  private getParsedConfig() {
    this.readConfigFile();
    return this.tsModule.parseJsonConfigFileContent(
      this.tsConfigData,
      this.mdxSys,
      this.root,
    );
  }
  /** 拦截 ts 文件系统 */
  private getMdxSys(): ts.System {
    // 某些特殊情况下 tsModule.sys 是不存在的
    const sys: ts.System | undefined = this.tsModule.sys;
    const mdxSys: ts.System = {
      args: sys?.args ?? [],
      exit: sys?.exit ?? (() => void 0),
      newLine: sys?.newLine ?? '\n',
      useCaseSensitiveFileNames: sys?.useCaseSensitiveFileNames ?? true,
      write: sys?.write ?? (() => void 0),
      writeFile: sys?.writeFile ?? (() => void 0),
      resolvePath: sys?.resolvePath ?? (() => void 0),
      createDirectory: sys?.createDirectory ?? (() => void 0),
      getExecutingFilePath: sys?.getExecutingFilePath ?? (() => void 0),
      getCurrentDirectory: () => this.root,
      fileExists: (path) => {
        let stat = this.vfs.stat(path);

        if (stat) {
          return !stat.isDirectory();
        }

        stat = this.fs.stat(path);
        return stat ? !stat.isDirectory() : false;
      },
      readFile: (path) => {
        const vFile = this.vfs.readFile(path);

        if (vFile) {
          return vFile.getText();
        }

        return this.fs.readFile(path);
      },
      getDirectories: (path) => {
        const vItems = this.vfs.readdir(path);
        const items = this.fs.readDir(path);
        return unique(vItems.concat(items));
      },
      directoryExists: (path) => {
        let stat = this.vfs.stat(path);

        if (stat) {
          return stat.isDirectory();
        }

        stat = this.fs.stat(path);
        return stat?.isDirectory() ?? false;
      },
      readDirectory: (
        path: string,
        extensions?: string[],
        exclude?: string[],
        include?: string[],
        depth?: number,
      ) => {
        if (sys?.readDirectory) {
          return sys.readDirectory(path, extensions, exclude, include, depth);
        }
        else {
          return [];
        }
      },
    };

    // sys 代理
    const mdxSysProxy = new Proxy(mdxSys, {
      get(target, key) {
        return target[key] ?? sys[key];
      },
    });

    return mdxSysProxy;
  }
  /** 更新文件 */
  private fileChange({ changes }: OnChangeVirtualFilesParams) {
    let projectChange = false;

    for (const { document, type } of changes) {
      const fsPath = toFsPath(document.uri);
      const extname = path.extname(fsPath);

      // tsconfig 变更
      if (fsPath === path.join(this.root, ConfigFile.Ts)) {
        this.useTsConfig = true;
        this.readConfigFile();
        projectChange = true;
      }
      // jsconfig 变更
      else if (fsPath === path.join(this.root, ConfigFile.Js)) {
        // 只有使用 js 配置文件时才重新读取配置
        if (!this.useTsConfig) {
          this.readConfigFile();
          projectChange = true;
        }
      }
      // js/tx 变更
      else if (/\.(j|t)sx?/.test(extname)) {
        projectChange = true;

        if (type === VirtualFileChangeType.Changed) {
          this.files.addScript(fsPath, document.getText());
        }
        else {
          this.files.delete(fsPath);
        }
      }
    }

    console.log('host-server change');
    this.projectVersion += projectChange ? 1 : 0;
  }
  /** 获取编译选项 */
  private getCompilerOptions() {
    return {
      strict: false,
      allowJs: true,
      allowSyntheticDefaultImports: true,
      experimentalDecorators: true,
      ...(this.tsConfigData.compilerOptions ?? {}),

      // 强制设定
      allowNonTsExtensions: true,
      target: this.tsModule.ScriptTarget.Latest,
      moduleResolution: this.tsModule.ModuleResolutionKind.NodeJs,
      module: this.tsModule.ModuleKind.ESNext,
      lib: ['ESNext', 'DOM'],
      skipLibCheck: true,
    };
  }

  /** 获取当前 js 语言服务 */
  getScriptServer() {
    return this.jsLanguageService;
  }
  /** 获取 ts 模块 */
  getTsModule() {
    return this.tsModule;
  }
  /** 关闭语言服务器 */
  dispose() {
    this.unloadLibs();
    this.jsLanguageService.dispose();
  }
}
