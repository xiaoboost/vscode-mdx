import path from 'path';

import { MDXSuffix, MDSuffix, MdxJsxSuffix, MdCodeBlockSuffix, MDXCodeLang } from './constant';

/** 是否是 mdx 文件 */
export function isMdxFile(file: string) {
  return file.endsWith(MDXSuffix);
}

/** 是否是 md 文件 */
export function isMdFile(file: string) {
  return file.endsWith(MDSuffix);
}

/** 是否是 mdx 转换后的 jsx 文件 */
export function isMdxJsx(file: string) {
  return file.endsWith(MdxJsxSuffix);
}

/** 是否是 md 文件内的代码块 */
export function isMdCodeBlock(file: string) {
  return /\._md\.(t|j)sx?$/.test(file);
}

/** 生成 mdx 转换后的 jsx 文件名称 */
export function getMdxJsxName(mdxName: string) {
  const name = path.parse(mdxName);
  return path.format({
    dir: name.dir,
    base: name.base,
    ext: MdxJsxSuffix,
  });
}

/** 生成 md 中的代码块文件名称 */
export function getMdCodeBlockName(mdxName: string, index: number, lang: MDXCodeLang) {
  const name = path.parse(mdxName);
  return path.format({
    dir: name.dir,
    base: `${name.base}-${index}`,
    ext: MdCodeBlockSuffix(lang),
  });
}
