import { files, lsp } from './utils';

// 语言服务监听文档控制器
files.listen(lsp);

files.onDidChangeContent(() => {
    // ..
});
