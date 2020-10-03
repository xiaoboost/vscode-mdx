import { LanguageClient } from 'vscode-languageclient/node';
import { LanguageServerEvent } from '@mdx/utils';
import { window } from 'vscode';

interface ErrorEvent {
  message: string;
}

export async function active(lsp: LanguageClient) {
  await lsp.onReady();

  lsp.onRequest(LanguageServerEvent.Error, (data: ErrorEvent) => {
    window.showErrorMessage(data.message);
  });
}
