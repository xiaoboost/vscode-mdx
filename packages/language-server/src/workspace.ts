import { WorkspaceFolder, WorkspaceFoldersChangeEvent } from 'vscode-languageserver';
import { projects } from './store';

export function onWorkspaceInit(folders: WorkspaceFolder[]) {
  for (const { uri } of folders) {
    projects.create(uri);
  }
}

export function onWorkspaceRemove(folders: WorkspaceFolder[]) {
  for (const { uri } of folders) {
    projects.delete(uri);
  }
}

export async function onWorkspaceChange({ added, removed }: WorkspaceFoldersChangeEvent) {
  onWorkspaceInit(added);
  onWorkspaceRemove(removed);
}
