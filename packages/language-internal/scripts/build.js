const path = require('path');
const fs = require('fs');
const Glob = require('fast-glob');
const outDir = path.resolve(__dirname, '../dist');
const libs = ['@types/node', '@types/react', '@types/mdx-js__react', 'typescript'];

async function writeData() {
  const files = {};
  const rootPath = path.resolve(__dirname, '..');
  const dtsFiles = await Glob(`node_modules/{${libs.join(',')}}/**/{*.d.ts,package.json}`, {
    cwd: rootPath,
  });

  await Promise.all((dtsFiles.map(async (name) => {
    files[name] = await fs.promises.readFile(path.join(rootPath, name), 'utf-8');
  })));

  await fs.promises.writeFile(path.join(outDir, 'index.json'), JSON.stringify(files));
}

async function writeDts() {
  await fs.promises.writeFile(
    path.join(outDir, 'index.d.ts'),
    `declare const files: { [path: string]: string };\nexport default files;`,
  );
}

async function main() {
  if (!fs.existsSync(outDir)) {
    await fs.promises.mkdir(outDir);
  }

  await writeData();
  await writeDts();
  console.log('Finish build internal .d.ts files.');
}

main();
