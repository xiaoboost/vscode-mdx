import type { ServiceHost } from '@mdx/language-host-typescript';

import { TextDocument, Position, MarkupContent, MarkupKind } from '../types';
import { toRange } from '../utils';
import { toFsPath } from '@mdx/utils';

export function doHover(
  document: TextDocument,
  position: Position,
  host: ServiceHost,
) {
  const server = host.getScriptServer();
  const filePath = toFsPath(document.uri);
  const offset = document.offsetAt(position);
  const info = server.getQuickInfoAtPosition(filePath, offset);

  if (!info) {
    return;
  }

  const display = host.getTsModule().displayPartsToString(info.displayParts);
  const contents: MarkupContent = {
    kind: MarkupKind.Markdown,
    value: `\`\`\`typescript\n${display}\n\`\`\``,
  };

  return {
    contents,
    range: toRange(info.textSpan, document),
  };
}
