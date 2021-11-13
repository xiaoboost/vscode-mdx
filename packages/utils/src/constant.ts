export type ScriptLang = 'ts' | 'js' | 'tsx' | 'jsx';

export const NULL_EXPORT = 'export {};\n';
export const virtualSchemeName = 'virtual';

export enum LanguageServerEvent {
  Error = 'lsp-error',
}
