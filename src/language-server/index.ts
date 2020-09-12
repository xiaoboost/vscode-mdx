import { files, lsp } from './utils/store';

import * as workspaces from './utils/workspace';

lsp.onInitialize(() => {
    return {
        capabilities: {
            colorProvider: true,
            workspace: {
                workspaceFolders: {
                    supported: true,
                },
            },
        },
    };
});

lsp.onInitialized(() => {
    lsp.workspace.onDidChangeWorkspaceFolders((event) => {
        event.added.forEach(workspaces.add);
        event.removed.forEach(workspaces.remove);
    });
});
