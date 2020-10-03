import type { TextDocument } from 'vscode-languageserver-textdocument';

import type {
  Diagnostic,
  Position,
  Hover,
  CompletionItem,
  CompletionList,
  Color,
  ColorPresentation,
  ColorInformation,
  DocumentLink,
  SymbolInformation,
  DocumentHighlight,
  CodeActionContext,
  Command,
  FoldingRange,
  SelectionRange,
  WorkspaceEdit,
} from 'vscode-languageserver-types';

export const languageId = 'mdx';

export type UnDef = null | undefined | void;

export interface CompletionItemData {
  filePath: string;
  virtualPath: string;
  triggerChar: string;
  offset: number;
  languageId: string;
  subLanguageId?: string;
}

export interface FoldingRangeContext {
  rangeLimit?: number;
}

/** 语言服务接口 */
export interface LanguageService {
  getId(): string;
  doValidation?(text: TextDocument): Diagnostic[];
  doHover?(text: TextDocument, position: Position): Hover | UnDef;
  doComplete?(text: TextDocument, position: Position): CompletionList | CompletionItem[] | UnDef;
  doResolve?(item: CompletionItem): CompletionItem;
  findDocumentColors?(text: TextDocument): ColorInformation[];
  getColorPresentations?(text: TextDocument, color: Color, range: Range): ColorPresentation[];
  findDefinition?(text: TextDocument, position: Position): Location[] | Location | UnDef;
  findReferences?(text: TextDocument, position: Position): Location[];
  findDocumentLinks?(text: TextDocument): DocumentLink[];
  findDocumentHighlights?(text: TextDocument, position: Position): DocumentHighlight[];
  findDocumentSymbols?(text: TextDocument): SymbolInformation[];
  doCodeActions?(text: TextDocument, range: Range, context: CodeActionContext): Command[];
  doRename?(text: TextDocument, position: Position, newName: string): WorkspaceEdit;
  getFoldingRanges?(text: TextDocument, context?: FoldingRangeContext): FoldingRange[];
  getSelectionRanges?(text: TextDocument, positions: Position[]): SelectionRange[];
  dispose?(): void;
}

export { TextDocument } from 'vscode-languageserver-textdocument';

export {
  Diagnostic,
  Position,
  Hover,
  CompletionItem,
  CompletionList,
  Color,
  ColorPresentation,
  ColorInformation,
  DocumentLink,
  SymbolInformation,
  DocumentHighlight,
  CodeActionContext,
  Command,
  FoldingRange,
  SelectionRange,
  WorkspaceEdit,
  ServerCapabilities,
  TextDocumentSyncKind,
  CompletionItemKind,
  DiagnosticSeverity,
  DiagnosticTag,
  CompletionItemTag,
  Range,
  MarkupContent,
  MarkupKind,
} from 'vscode-languageserver';
