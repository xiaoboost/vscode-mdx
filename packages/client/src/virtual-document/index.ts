import { workspace, Uri, TextDocumentContentProvider, ExtensionContext } from 'vscode';
import { virtualSchemeName as scheme, toFsPath } from '@mdx/utils';

import virtualFiles from '@mdx/language-internal';

export function activate({ subscriptions }: ExtensionContext) {
  const provider = new (class implements TextDocumentContentProvider {
    provideTextDocumentContent(input: Uri): string {
      if (input.scheme === scheme) {
        return virtualFiles[toFsPath(input.toString())];
      }

      return '';
    }
  })();

  subscriptions.push(workspace.registerTextDocumentContentProvider(scheme, provider));
}
