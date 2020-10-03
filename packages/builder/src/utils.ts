import path from 'path';
import chalk from 'chalk';
import webpack from 'webpack';

import { Manifest } from '@mdx/utils';

/** 编译选项 */
export interface Options {
  outDir: string;
  watchName?: string;
  development: boolean;
  production: boolean;
  bundleAnalyze: boolean;
}

export function resolveRoot(...paths: (string | number)[]) {
  return path.join(process.cwd(), ...paths.map(String)).replace(/\\/g, '/');
}

export function resolve(...paths: (string | number)[]) {
  return path.join(__dirname, '..', ...paths.map(String)).replace(/\\/g, '/');
}

export function mergeManifest(...configs: Partial<Manifest>[]): Manifest {
  const data: Manifest = {
    name: 'vscode-mdx-2',
    version: '1.0.0',
    publisher: '',
    engines: {},
    main: '',
  };

  const sampleValueKeys = [
    'name',
    'version',
    'publisher',
    'main',
    'icon',
    'description',
    'displayName',
    'author',
    'repository',
  ];
  const arrayValueKeys = ['categories', 'keywords', 'activationEvents', 'extensionDependencies'];
  const contributeArrayKeys = [
    'commands',
    'languages',
    'grammars',
    'keybindings',
    'jsonValidation',
    'customEditors',
  ];

  for (const config of configs) {
    for (const key of sampleValueKeys) {
      if (config[key]) {
        data[key] = config[key];
      }
    }

    for (const key of arrayValueKeys) {
      if (config[key]) {
        data[key] = config[key].concat(data[key] ?? []);
      }
    }

    if (config.engines) {
      data.engines = {
        ...data.engines,
        ...config.engines,
      };
    }

    if (!config.contributes) {
      continue;
    }

    if (!data.contributes) {
      data.contributes = {};
    }

    for (const key of contributeArrayKeys) {
      if (config.contributes[key]) {
        data.contributes[key] = config.contributes[key].concat(data.contributes[key] ?? []);
      }
    }

    if (config.contributes?.menus) {
      if (!data.contributes.menus) {
        data.contributes.menus = {};
      }

      for (const key of Object.keys(config.contributes.menus)) {
        const value = config.contributes.menus[key];
        data.contributes.menus[key] = value.concat(data.contributes.menus[key] ?? []);
      }
    }
  }

  return data;
}

function isIgnoreError(err: webpack.WebpackError) {
  if (!err.message.includes('Critical dependency')) {
    return false;
  }

  const context = err.module.context;

  if (!context) {
    return false;
  }

  const ignoreModule = ['@babel', 'typescript', 'power-assert-formatter'];

  return ignoreModule.some((name) => {
    return context.includes(name);
  });
}

export function printWebpackResult(stats: webpack.Stats) {
  stats.compilation.warnings = stats.compilation.warnings.filter((item) => {
    return !isIgnoreError(item);
  });

  console.log('\x1Bc');
  console.log(
    stats.toString({
      chunks: false,
      chunkModules: false,
      chunkOrigins: false,
      colors: true,
      modules: false,
      children: false,
    }),
  );

  console.log(chalk.cyan('\n  Build complete.\n'));
}
