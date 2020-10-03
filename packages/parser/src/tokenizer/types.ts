export enum TokenType {
  Text,
  ParagraphEnd,
  ParagraphEndLine,
  CodeBlockStart,
  CodeBlockAttribute,
  CodeBlockContent,
  CodeBlockEnd,
  CommentStartTag,
  CommentContent,
  CommentEndTag,
  JsxExpression,
  BlockExpression,
  ImportStatement,
  ExportStatement,
  Whitespace,
  Unknown,
  EOS,
}

export enum ScannerState {
  /** 顶层文本 */
  WithinContent,
  /** 代码块 */
  WithinCodeBlock,
  /** 代码块属性 */
  WithinCodeBlockAttr,
  /** 注释 */
  WithinComment,
  /** 行内文本 */
  WithinInlineContent,
  /** Esm 语句结束之后 */
  AfterEsmStatement,
  /** Block Expression 语句结束之后 */
  AfterBlockExpression,
}

export enum ScannerImportState {
  BeforeFromIdentifier,
  AfterFromIdentifier,
  AfterFromString,
}

export enum ScannerExportState {
  // ..
}

export enum ScannerJsxState {
  InStartTag,
  InEndTag,
  InContent,
  InString,
  InTemplateString,
  InComment,
}
