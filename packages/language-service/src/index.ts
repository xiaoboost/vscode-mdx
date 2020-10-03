import type { DiskController, BaseCode, MdxCode } from '@mdx/file-system';
import type { ServiceHost } from '@mdx/language-host-typescript';

import { toFsPath } from '@mdx/utils';
import { isArray } from '@xiao-ai/utils';
import { getMarkdownLanguageService } from './md';
import { getScriptLanguageService } from './script';

import {
  LanguageService,
  languageId,
  ServerCapabilities,
  TextDocumentSyncKind,
  Diagnostic,
  Position,
  TextDocument,
  CompletionList,
} from './types';

export * from './types';

export const capabilities: ServerCapabilities = {
  textDocumentSync: TextDocumentSyncKind.Incremental,
  hoverProvider: true,
  // completionProvider: {
  //   triggerCharacters: ['.', ':', '<', '"', "'", '/', '@', '*'], // .concat(lowerLetter),
  //   resolveProvider: true,
  // },
  // definitionProvider: true,
  // // referencesProvider: true,
  // documentLinkProvider: {
  //   resolveProvider: false,
  // },
  workspace: {
    workspaceFolders: {
      supported: true,
      changeNotifications: true,
    },
  },
};

export function getLanguageService(fs: DiskController, host: ServiceHost): LanguageService {
  const scriptService = getScriptLanguageService(fs, host);
  const mdService = getMarkdownLanguageService();
  const services = {
    js: scriptService,
    ts: scriptService,
    jsx: scriptService,
    tsx: scriptService,
    md: mdService,
  };

  /** 创建事件上下文 */
  function createCodeContext(text: TextDocument, position: Position) {
    const fsPath = toFsPath(text.uri);
    const offset = text.offsetAt(position);
    const code = fs.getCode(fsPath, offset);
    const mode: LanguageService = services[code?.lang ?? ''];

    if (!code || !mode) {
      return;
    }

    const newText = code.document;
    const newOffset = code.sourceMap!.getMappedOffset(offset);

    if (!newOffset) {
      return;
    }

    return {
      mode,
      code,
      lang: code.lang,
      text: newText,
      position: newText.positionAt(newOffset),
    };
  }

  return {
    getId: () => languageId,
    dispose() {
      mdService.dispose?.();
      scriptService.dispose?.();
    },
    doValidation(document) {
      const diagnostics: Diagnostic[] = [];
      const fsPath = toFsPath(document.uri);
      const mdxCode = fs.getCode<MdxCode>(fsPath);

      if (!mdxCode) {
        return [];
      }

      const codes: (BaseCode | undefined)[] = [
        mdxCode.jsxCode,
        mdxCode.mdCode,
        ...mdxCode.blockCodes,
      ];

      for (const code of codes) {
        if (!code) {
          continue;
        }

        const mode: LanguageService = services[code?.lang ?? ''];
        const errors = mode?.doValidation?.(code.document) ?? [];

        diagnostics.push(...errors.map((err) => ({
          ...err,
          range: code.getSourceRange(err.range),
        })));
      }

      return diagnostics;
    },
    doHover(text, position) {
      const context = createCodeContext(text, position);
      const result = context?.mode.doHover?.(context.text, context.position);

      if (!context || !result) {
        return;
      }

      return {
        contents: result.contents,
        range: result.range ? context.code.getSourceRange(result.range) : undefined,
      };
    },
    doComplete(text, position) {
      const context = createCodeContext(text, position);
      const result = context?.mode.doComplete?.(context.text, context.position);

      if (!context || !result) {
        return;
      }

      const { code } = context;
      const list: CompletionList = isArray(result)
        ? {
          isIncomplete: false,
          items: result,
        }
        : result;

      return {
        isIncomplete: list.isIncomplete,
        items: list.items.map((item) => {
          const data = { ...item };

          if (data.textEdit) {
            if ('range' in data.textEdit) {
              data.textEdit.range = code.getSourceRange(data.textEdit.range);
            }
            else {
              data.textEdit.insert = code.getSourceRange(data.textEdit.insert);
              data.textEdit.replace = code.getSourceRange(data.textEdit.replace);
            }
          }

          if (data.additionalTextEdits) {
            data.additionalTextEdits = data.additionalTextEdits
              .filter(Boolean)
              .map((text) => ({
                newText: text.newText,
                range: code.getSourceRange(text.range),
              }));
          }

          return data;
        }),
      };
    },
    // doResolve(item) {
    //   const id = item.data?.subLanguageId;
    //   const mode = services[id] as mdx.LanguageService | undefined;
    //   return mode?.doResolve?.(item) ?? item;
    // },
    // findDefinition(text, position) {
    //   const context = createCodeContext(text, position);
    //   return context?.mode.findDefinition?.(context.text, context.position);
    // },
  };
}
