import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import GenerateJsonWebpackPlugin from 'generate-json-webpack-plugin';
import { RequireSplitChunkPlugin } from 'require-split-chunk-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import {
  Options,
  resolve,
  resolveRoot,
  mergeManifest,
  printWebpackResult,
} from './utils';

function getPackageData() {
  const rootPackagePath = resolveRoot('package.json');
  const workspacePackagePath = fs.readdirSync(resolve('..'));
  const packages = workspacePackagePath
    .map((file) => path.join(resolve('..'), file, 'package.json'))
    .concat(rootPackagePath);
  const packageData = packages.map((file) => {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  });

  return packageData.filter(Boolean);
}

function getBaseConfig(opt: Options): webpack.Configuration {
  const outDir = resolveRoot(opt.outDir);
  const mode: webpack.Configuration['mode'] = opt.production ? 'production' : 'development';
  const tsLoaderConfig = opt.production
    ? {
      loader: 'ts-loader',
      options: {
        configFile: resolve('src/tsconfig.json'),
        compilerOptions: {
          module: 'ESNext',
          target: 'ESNext',
        },
      },
    }
    : {
      loader: 'esbuild-loader',
      options: {
        loader: 'tsx',
        target: 'es2015',
        tsconfigRaw: require(resolve('src/tsconfig.json')),
      },
    };

  const packageMerged = mergeManifest(...getPackageData(), {
    main: 'scripts/client.js',
    // icon: 'resources/logo.png',
  });

  const baseConfig: webpack.Configuration = {
    target: 'node',
    entry: {
      client: resolve('entry/client.ts'),
      'language-server': resolve('entry/language-server.ts'),
    },
    output: {
      path: outDir,
      publicPath: '../',
      filename: 'scripts/[name].js',
      chunkFilename: 'scripts/[name].js',
      library: {
        type: 'commonjs',
      },
    },
    resolveLoader: {
      modules: [resolve('node_modules')],
    },
    resolve: {
      extensions: ['.ts', '.js', '.json'],
      mainFiles: ['index.ts', 'index.js', 'index.json'],
      mainFields: ['source', 'module', 'main'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          ...tsLoaderConfig,
        },
      ],
    },
    externals: ['vscode'],
    optimization: {
      concatenateModules: true,
      moduleIds: 'deterministic',
      splitChunks: {
        maxInitialRequests: Infinity,
        minSize: 0,
        minChunks: 1,
        cacheGroups: {
          commons: {
            test(module: any) {
              return (
                module.resource &&
                (
                  /[\\/]node_modules[\\/]/.test(module.resource) ||
                  /packages[\\/](language-internal|utils)/.test(module.resource)
                )
              );
            },
            name: 'common',
            chunks: 'all',
            enforce: true,
          },
        },
      },
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(mode),
      }),
      new RequireSplitChunkPlugin(),
      new ProgressBarPlugin({
        width: 40,
        format: `${chalk.green('⚡️ Building main:')} [:bar] ${chalk.green(
          ':percent',
        )} (:elapsed seconds)`,
      }),
      new GenerateJsonWebpackPlugin('package.json', packageMerged),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: resolve('node_modules/@mdx/language-syntax/dist/**/*.json'),
            to({ absoluteFilename }) {
              return path.relative(
                resolve('node_modules/@mdx/language-syntax/dist'),
                absoluteFilename,
              );
            },
          },
          {
            from: resolveRoot('LICENSE'),
            to: '.',
          },
          // {
          //   from: resolve('assets/**/*'),
          //   to({ absoluteFilename }) {
          //     return path.relative(resolve('assets'), absoluteFilename);
          //   },
          // },
        ],
      }),
    ],
  };

  if (opt.development) {
    baseConfig.mode = 'development';
    baseConfig.devtool = 'source-map';
    packageMerged.extensionDependencies = undefined;
    baseConfig.plugins!.push(new webpack.NoEmitOnErrorsPlugin());
  }
  else if (opt.production) {
    baseConfig.mode = 'production';
    if (!baseConfig.optimization) {
      baseConfig.optimization = {
        minimize: true,
      };
    }

    if (!baseConfig.optimization.minimizer) {
      baseConfig.optimization.minimizer = [];
    }

    baseConfig.optimization.minimizer = baseConfig.optimization.minimizer.concat([
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          ecma: 'es6',
          module: false,
          format: null,
          nameCache: null,
          ie8: false,
          safari10: false,
        },
      }),
    ]);

    baseConfig.performance = {
      hints: false,
      maxAssetSize: 512000,
      maxEntrypointSize: 512000,
    };

    if (opt.bundleAnalyze) {
      baseConfig.plugins!.push(new (BundleAnalyzerPlugin as any)({
        analyzerPort: '6060',
      }));
    }
  }

  return baseConfig;
}

export function watch(opt: Options) {
  const config = getBaseConfig(opt);
  const compiler = webpack(config);

  compiler.watch({ ignored: /node_modules/ }, (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      return;
    }

    if (stats) {
      printWebpackResult(stats);
    }
  });
}

export async function build(opt: Options) {
  return new Promise<void>((resolve, reject) => {
    webpack(getBaseConfig(opt), (err, stats) => {
      if (err) {
        reject(err);
        return;
      }

      if (stats) {
        printWebpackResult(stats);
      }

      resolve();
    });
  });
}
