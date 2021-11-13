import type { ServiceHost } from '@mdx/language-host-typescript';

import { CompletionItem, CompletionItemData, CompletionItemKind } from '../types';
import { getFormatCodeSettings, getUserPreferences, getCompletionResolve } from '../utils';
import { languageId } from './constant';
import { toFsPath } from '@mdx/utils';

export function doResolve(item: CompletionItem, host: ServiceHost) {
  const data: CompletionItemData = item.data;

  if (
    !data ||
    data.subLanguageId !== languageId ||
    item.kind === CompletionItemKind.File ||
    item.kind === CompletionItemKind.Folder
  ) {
    return item;
  }

  const server = host.getScriptServer();
  const details = server.getCompletionEntryDetails(
    toFsPath(data.uri),
    data.offset,
    item.label,
    getFormatCodeSettings(),
    data.source,
    getUserPreferences(),
    undefined,
  );

  if (!details) {
    return item;
  }

  getCompletionResolve(item, details, host.getTsModule());

  return item;
}
