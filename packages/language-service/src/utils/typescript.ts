import type * as ts from 'typescript';

import * as previewer from './previewer';

import {
  CompletionItemKind,
  DiagnosticSeverity,
  DiagnosticTag,
  CompletionItem,
  CompletionItemTag,
  Diagnostic,
  Range,
  TextDocument,
} from '../types';

const legalChars = ['@', '#', '.', '"', "'", '`', '/', '<'];

function toDiagnosticSeverity(tsModule: typeof ts, severity: ts.DiagnosticCategory, code: number) {
  // 声明了但是没有使用
  if (code === 6133) {
    return DiagnosticSeverity.Hint;
  }

  switch (severity) {
    case tsModule.DiagnosticCategory.Error:
      return DiagnosticSeverity.Error;
    case tsModule.DiagnosticCategory.Warning:
      return DiagnosticSeverity.Warning;
    case tsModule.DiagnosticCategory.Message:
      return DiagnosticSeverity.Information;
    case tsModule.DiagnosticCategory.Suggestion:
      return DiagnosticSeverity.Hint;
    default:
      return DiagnosticSeverity.Information;
  }
}

function toDiagnosticTag(diag: ts.Diagnostic) {
  const tags: DiagnosticTag[] = [];

  if (diag.reportsUnnecessary) {
    tags.push(DiagnosticTag.Unnecessary);
  }

  if (diag.reportsDeprecated) {
    tags.push(DiagnosticTag.Deprecated);
  }

  return tags;
}

export function toRange(span: ts.TextSpan, text: TextDocument,): Range {
  return Range.create(
    text.positionAt(span.start),
    text.positionAt(span.start + span.length),
  );
}

export function toDiagnostic(
  tsModule: typeof ts,
  diag: ts.Diagnostic,
  text: TextDocument,
): Diagnostic {
  return {
    range: toRange(diag as ts.TextSpan, text),
    severity: toDiagnosticSeverity(tsModule, diag.category, diag.code),
    message: tsModule.flattenDiagnosticMessageText(diag.messageText, '\n'),
    code: `ts/${diag.code}`,
    tags: toDiagnosticTag(diag),
    source: 'MDX',
  };
}

export function toCompletionItemKind(kind: ts.ScriptElementKind): CompletionItemKind {
  switch (kind) {
    case 'primitive type':
    case 'keyword':
      return CompletionItemKind.Keyword;
    case 'var':
    case 'local var':
      return CompletionItemKind.Variable;
    case 'property':
    case 'getter':
    case 'setter':
      return CompletionItemKind.Field;
    case 'function':
    case 'method':
    case 'construct':
    case 'call':
    case 'index':
      return CompletionItemKind.Function;
    case 'enum':
      return CompletionItemKind.Enum;
    case 'module':
      return CompletionItemKind.Module;
    case 'class':
      return CompletionItemKind.Class;
    case 'interface':
      return CompletionItemKind.Interface;
    case 'warning':
      return CompletionItemKind.File;
    case 'script':
      return CompletionItemKind.File;
    case 'directory':
      return CompletionItemKind.Folder;
  }

  return CompletionItemKind.Property;
}

export function getUserPreferences(): ts.UserPreferences {
  return {
    quotePreference: 'auto',
    importModuleSpecifierPreference: 'relative',
    importModuleSpecifierEnding: 'auto',
    allowTextChangesInNewFiles: true,
    providePrefixAndSuffixTextForRename: false,
    includeAutomaticOptionalChainCompletions: true,
    provideRefactorNotApplicableReason: true,
  };
}

export function getFormatCodeSettings(): ts.FormatCodeSettings {
  return {
    tabSize: undefined,
    indentSize: undefined,
    convertTabsToSpaces: true,
    insertSpaceAfterCommaDelimiter: true,
  };
}

export function getCompleteChar(char: string) {
  return legalChars.includes(char) ? (char as ts.CompletionsTriggerCharacter) : undefined;
}

export function parseKindModifier(kindModifiers: string) {
  const kinds = new Set(kindModifiers.split(/,|\s+/g));

  return {
    optional: kinds.has('optional'),
    deprecated: kinds.has('deprecated'),
    color: kinds.has('color'),
  };
}

export function getCompletionItem(entry: ts.CompletionEntry, index: number) {
  const item: CompletionItem = {
    preselect: entry.isRecommended ? true : undefined,
    label: entry.name,
    filterText: entry.insertText,
    sortText: `${entry.sortText}${index}`,
    kind: toCompletionItemKind(entry.kind),
    insertText: entry.insertText,
  };

  if (entry.kindModifiers) {
    const kindModifiers = parseKindModifier(entry.kindModifiers ?? '');
    if (kindModifiers.optional) {
      if (!item.insertText) {
        item.insertText = item.label;
      }
      if (!item.filterText) {
        item.filterText = item.label;
      }
      item.label += '?';
    }
    if (kindModifiers.deprecated) {
      item.tags = [CompletionItemTag.Deprecated];
    }
    if (kindModifiers.color) {
      item.kind = CompletionItemKind.Color;
    }
  }

  return item;
}

export function getCompletionResolve(
  item: CompletionItem,
  details: ts.CompletionEntryDetails,
  tsModule: typeof ts,
) {
  item.detail = tsModule
    .displayPartsToString(details.displayParts)
    .replace(/( +)?[\n\r]+/g, '\n\r');

  item.documentation = {
    kind: 'markdown',
    value: tsModule.displayPartsToString(details.documentation) + '\n\n',
  };

  // TODO:
  if (details.codeActions) {
    // ..
  }

  for (const tag of details.tags ?? []) {
    const tagDoc = previewer.getTagDocumentation(tag, tsModule);

    if (tagDoc) {
      item.documentation.value += `${tagDoc}\n\n`;
    }
  }

  // 不需要再进入此回调，删除缓存
  delete item.data;

  return item;
}
