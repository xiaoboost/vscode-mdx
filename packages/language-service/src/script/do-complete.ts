import type { ServiceHost } from '@mdx/language-host-typescript';
import type { DiskController } from '@mdx/file-system';

import { TextDocument, Position, languageId, CompletionItemData } from '../types';
import { toFsPath } from '@mdx/utils';

import { getCompleteChar, getUserPreferences, getCompletionItem } from '../utils';
import { languageId as subLanguageId } from './constant';

export function doComplete(
  document: TextDocument,
  position: Position,
  fs: DiskController,
  host: ServiceHost,
) {
  const server = host.getScriptServer();
  const filePath = toFsPath(document.uri);
  const offset = document.offsetAt(position);
  const jsProgram = server.getProgram();
  const code = fs.getCode(filePath);
  const sourceFile = jsProgram?.getSourceFile(filePath);
  const sourcemap = code?.sourceMap;

  if (!jsProgram || !sourceFile || !code || !sourcemap) {
    return;
  }

  const triggerChar = document.getText()[offset - 1];
  const completions = server.getCompletionsAtPosition(filePath, offset, {
    disableSuggestions: false,
    includeCompletionsForModuleExports: false,
    includePackageJsonAutoImports: 'auto',
    triggerCharacter: getCompleteChar(triggerChar),
    includeCompletionsWithInsertText: true,
    ...getUserPreferences(),
  });

  if (!completions) {
    return;
  }

  return completions.entries.map((entry, i) => {
    const item = getCompletionItem(entry, i);
    const data: CompletionItemData = {
      uri: document.uri,
      source: entry.source,
      triggerChar,
      offset,
      languageId,
      subLanguageId,
    };

    item.data = data;

    return item;
  });
}
