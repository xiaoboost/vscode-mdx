import { ScriptLang } from './constant';
import { replaceSuffix } from './uri';

export const MDXSuffix = '.mdx';
export const MDSuffix = '.md';
export const IndexSuffix = '.mdx_index.d.ts';
export const MainJsxSuffix = '._mdx.jsx';
export const MainMdSuffix = '._mdx.md';
export const getMdCodeBlockSuffix = (index: number, suffix: ScriptLang) => {
  return `._md_cb.${index}.${suffix}`;
};

export enum MdxFileType {
  /** 不是 MDX 文件 */
  None,
  /** 原始 MD 文件 */
  Md,
  /** 原始 MDX 文件 */
  Mdx,
  /** MDX 转换后的 MD 文件 */
  MainMd,
  /** 代码块文件 */
  CodeBlock,
  /** MDX 转换后的主体 JSX 文件 */
  MainJsx,
  /** MDX 转换后提供给外部引用的索引文件 */
  Index,
}

/** 当前文件是否是 MDX 系列文件 */
export function isMdxFile(fileName: string) {
  const type = getMdxFileType(fileName);
  return type === MdxFileType.Mdx || type === MdxFileType.Md;
}

/** 获取当前 MDX 文件类型 */
export function getMdxFileType(fileName: string): MdxFileType {
  if (fileName.endsWith(MDXSuffix)) {
    return MdxFileType.Mdx;
  }
  else if (fileName.endsWith(MDSuffix)) {
    return fileName.endsWith(MainMdSuffix) ? MdxFileType.MainMd : MdxFileType.Md;
  }
  else if (fileName.endsWith(MainJsxSuffix)) {
    return MdxFileType.MainJsx;
  }
  else if (fileName.endsWith(IndexSuffix)) {
    return MdxFileType.Index;
  }
  else if (/\._md_cb\.\d+\.(t|j)sx?$/.test(fileName)) {
    return MdxFileType.CodeBlock;
  }
  else {
    return MdxFileType.None;
  }
}

/** 生成代码块临时文件名称 */
export function getMdxFileName(
  origin: string,
  type: MdxFileType.CodeBlock,
  index: number,
  lang: ScriptLang,
): string;
/** 生成 MDX 各种类型文件名称 */
export function getMdxFileName(
  origin: string,
  type: MdxFileType,
): string;
export function getMdxFileName(
  origin: string,
  type: MdxFileType,
  index?: number,
  lang?: ScriptLang,
) {
  switch (type) {
    case MdxFileType.Mdx: {
      return replaceSuffix(origin, MDXSuffix);
    }
    case MdxFileType.Md: {
      return replaceSuffix(origin, MDSuffix);
    }
    case MdxFileType.MainJsx: {
      return replaceSuffix(origin, MainJsxSuffix);
    }
    case MdxFileType.MainMd: {
      return replaceSuffix(origin, MainMdSuffix);
    }
    case MdxFileType.Index: {
      return replaceSuffix(origin, IndexSuffix);
    }
    case MdxFileType.CodeBlock: {
      return replaceSuffix(origin, getMdCodeBlockSuffix(index!, lang!));
    }
    case MdxFileType.None: {
      return origin;
    }
    default: {
      throw '文件类型错误';
    }
  }
}
