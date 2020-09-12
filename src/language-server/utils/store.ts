import { TextDocument } from 'vscode-languageserver-textdocument';

import {
    TextDocuments,
    createConnection,
    ProposedFeatures,
} from 'vscode-languageserver';

/** 文档控制器 */
export const files = new TextDocuments(TextDocument);
/** 语言服务器 */
export const lsp = createConnection(ProposedFeatures.all);

// 启动监听
files.listen(lsp);
lsp.listen();
