export type MDXCodeLang = 'ts' | 'js' | 'tsx' | 'jsx';

export const NULL_EXPORT = 'export {};\n';
export const MDXSuffix = '.mdx';
export const MDSuffix = '.md';
export const MdxJsxSuffix = '._mdx.jsx';
export const MdxMdSuffix = '._mdx.md';
export const MdCodeBlockSuffix = (suffix: MDXCodeLang) => `._md_cb.${suffix}`;
export const virtualSchemeName = 'virtual';

export enum LanguageServerEvent {
  Error = 'lsp-error',
}
