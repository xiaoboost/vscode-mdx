import type { TextDocument, Diagnostic } from '../types';
import type { ServiceHost } from '@mdx/language-host-typescript';

import { toFsPath } from '@mdx/utils';
import { toDiagnostic } from '../utils';

export function doValidation(
  document: TextDocument,
  host: ServiceHost,
): Diagnostic[] {
  const filePath = toFsPath(document.uri);
  const server = host.getScriptServer();
  const jsProgram = server.getProgram();
  const sourceFile = jsProgram?.getSourceFile(filePath);

  if (!jsProgram || !sourceFile) {
    return [];
  }

  const rawScriptDiagnostics = [
    ...jsProgram.getSyntacticDiagnostics(sourceFile),
    ...jsProgram.getSemanticDiagnostics(sourceFile),
    ...server.getSuggestionDiagnostics(filePath),
  ];

  return rawScriptDiagnostics.map(err => toDiagnostic(host.getTsModule(), err, document));
}
