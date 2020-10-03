import { ExtensionContext, commands, window, ProgressLocation } from 'vscode';
import { client, activate as serverInit } from './server';

export async function displayServerProgress(promise: Promise<void>) {
  return window.withProgress(
    {
      title: '正在初始化 MDX 语言服务',
      location: ProgressLocation.Window,
    },
    () => promise,
  );
}

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('mdx.languageServer.restart', () => {
      if (!client) {
        serverInit(context);
        return;
      }

      return displayServerProgress(
        client
          .stop()
          .then(() => client!.start())
          .then(() => client!.onReady()),
      );
    }),
  );
}
