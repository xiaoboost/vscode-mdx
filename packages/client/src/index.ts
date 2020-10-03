import { ExtensionContext } from 'vscode';

import * as server from './language-server';
import * as virtual from './virtual-document';

export function activate(context: ExtensionContext) {
  server.activate(context);
  virtual.activate(context);
}

export function deactivate() {
  server.deactivate();
}
