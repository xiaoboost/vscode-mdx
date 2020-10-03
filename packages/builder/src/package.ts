import { createVSIX } from 'vsce';
import { join, dirname } from 'path';
import { promises as fs } from 'fs';

export interface Options {
  input: string;
  output: string;
}

async function readPackageInfo(packagePath: string) {
  const content = await fs.readFile(join(packagePath, 'package.json'), 'utf-8');
  const info = JSON.parse(content);
  return {
    name: info.name,
    version: info.version,
  };
}

export async function build(opt: Options) {
  const cwd = process.cwd();
  const inputDir = join(cwd, opt.input);
  const info = await readPackageInfo(inputDir);
  const outputPath = join(cwd, opt.output)
    .replace('[name]', info.name)
    .replace('[version]', info.version);

  await fs.mkdir(dirname(outputPath), { recursive: true });
  await createVSIX({
    cwd: inputDir,
    packagePath: outputPath,
    useYarn: false,
  });
}
