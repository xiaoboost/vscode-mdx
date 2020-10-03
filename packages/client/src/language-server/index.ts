import type { ExtensionContext } from 'vscode';

import * as server from './server';
import * as command from './command';

export function activate(context: ExtensionContext) {
  server.activate(context);
  command.activate(context);
}

export function deactivate() {
  server.deactivate();
}
