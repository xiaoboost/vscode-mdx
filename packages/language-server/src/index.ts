import {
  InitializeParams,
  FileChangeType as VSCodeFileChangeType,
} from 'vscode-languageserver';

import { lsp, fs, documents, projects } from './store';
import { FileChangeType, FileEvent } from '@mdx/file-system';
import { capabilities } from '@mdx/language-service';
import { toFsPath } from '@mdx/utils';
import { debounce } from '@xiao-ai/utils';

import * as workspace from './workspace';

lsp.listen();
documents.listen(lsp);

lsp.onInitialize(async (params: InitializeParams) => {
  if (params.workspaceFolders) {
    await workspace.onWorkspaceInit(params.workspaceFolders);
  }

  return {
    capabilities,
  };
});

lsp.onInitialized(() => {
  // 验证当前打开的所有文件
  const validation = debounce(function validation() {
    for (const doc of documents.all()) {
      const project = projects.find(toFsPath(doc.uri));

      if (project) {
        lsp.sendDiagnostics({
          uri: doc.uri,
          diagnostics: project.doValidation?.(doc) ?? [],
        });
      }
    }
  }, 50);

  documents.onDidOpen(({ document }) => {
    fs.filesChange({ changes: [{ type: FileChangeType.Created, document }] });
    validation();
  });

  documents.onDidChangeContent(({ document }) => {
    fs.filesChange({ changes: [{ type: FileChangeType.Changed, document }] });
    validation();
  });

  documents.onDidClose(({ document }) => {
    fs.filesChange({ changes: [{ type: FileChangeType.Closed, document }] });
  });

  lsp.onDidChangeWatchedFiles((params) => {
    const typeMap = {
      [VSCodeFileChangeType.Changed]: FileChangeType.Changed,
      [VSCodeFileChangeType.Created]: FileChangeType.Created,
      [VSCodeFileChangeType.Deleted]: FileChangeType.Deleted,
    };

    const changes: FileEvent[] = params.changes.map((event) => ({
      type: typeMap[event.type],
      uri: event.uri,
    }));

    fs.filesChange({ changes });
    validation();
  });

  lsp.workspace.onDidChangeWorkspaceFolders(ev => {
    workspace.onWorkspaceChange(ev);
  });

  lsp.onHover(({ textDocument, position }) => {
    const doc = documents.get(textDocument.uri);
    const project = projects.find(toFsPath(textDocument.uri));

    if (!doc || !project) {
      return;
    }

    return project.doHover(doc, position) ?? null;
  });

  // lsp.onCompletion(param => {
  //   return projects.find(toFsPath(param.textDocument.uri))?.onCompletion(param);
  // });

  // lsp.onCompletionResolve(item => {
  //   if (item.data?.fsPath) {
  //     return projects.find(item.data.fsPath)?.onResolve(item) ?? item;
  //   }

  //   return item;
  // });

  // lsp.onColorPresentation(param => {
  //   return projects.find(toFsPath(param.textDocument.uri))?.onColorPresentation(param) ?? [];
  // });

  // lsp.onDocumentColor(param => {
  //   return projects.find(toFsPath(param.textDocument.uri))?.onDocumentColor(param) ?? [];
  // });

  // lsp.onDefinition(param => {
  //   return projects.find(toFsPath(param.textDocument.uri))?.onDefinition(param);
  // });

  // lsp.onReferences(param => {
  //   return projects.find(toFsPath(param.textDocument.uri))?.onReferences(param) ?? null;
  // });

  // lsp.onDocumentLinks(param => {
  //   return projects.find(toFsPath(param.textDocument.uri))?.onDocumentLinks(param);
  // });

  // lsp.onDocumentSymbol(param => {
  //   return projects.find(toFsPath(param.textDocument.uri))?.onDocumentSymbol(param) ?? null;
  // });
});
