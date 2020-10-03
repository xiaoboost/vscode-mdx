import yargs from 'yargs';

import { watch, build } from './webpack';
import { build as buildExtension } from './package';

function setYargsCommand(yargs: yargs.Argv<any>) {
  return yargs.options({
    outDir: {
      type: 'string',
      describe: '输出文件夹',
      require: true,
    },
    watch: {
      type: 'boolean',
      describe: '监听项目',
      default: false,
    },
    development: {
      type: 'boolean',
      describe: '调试模式',
      default: false,
    },
    production: {
      type: 'boolean',
      describe: '构建模式',
      default: false,
    },
    bundleAnalyze: {
      type: 'boolean',
      describe: '分析包构成，只有当 production 为 true 时才有效',
      default: false,
    },
  });
}

export function run() {
  yargs
    .command(
      ['build'],
      'build',
      yargs => setYargsCommand(yargs),
      argv => build(argv),
    )
    .command(
      ['watch'],
      'watch',
      yargs => setYargsCommand(yargs),
      argv => watch(argv),
    )
    .command(
      ['package'],
      'package',
      yargs => yargs.options({
        output: {
          type: 'string',
          describe: '输出路径',
          require: true,
        },
        input: {
          type: 'string',
          describe: '打包路径',
          require: true,
        },
      }),
      argv => buildExtension(argv),
    )
    .strict()
    .showHelpOnFail(false).argv;
}
