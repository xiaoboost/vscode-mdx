import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node';

import { ExtensionContext, workspace } from 'vscode';

import { join } from 'path';
import { displayServerProgress } from './command';
import { active as activeError } from './error';
import { active as activeVirtualDocument } from './error';

export let client: LanguageClient | undefined;

function scheme(lang: string) {
  return {
    scheme: 'file',
    language: lang,
  };
}

export function activate(context: ExtensionContext) {
  // 语言服务文件绝对路径
  const serverModule = context.asAbsolutePath(join('scripts', 'language-server.js'));
  // 语言服务启动配置
  const serverOptions: ServerOptions = {
    run: {
      module: serverModule,
      transport: TransportKind.ipc,
    },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: {
        // 注意端口号和 launch 中的调试端口要一致
        execArgv: ['--nolazy', '--inspect=6009'],
      },
    },
  };
  // 客户端控制语言服务配置
  const clientOptions: LanguageClientOptions = {
    documentSelector: [scheme('mdx')],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher(
        '{**/*.jsx?,**/*.tsx?,**/*.json}',
        false,
        false,
        false,
      ),
    },
  };

  // 创建插件客户端
  client = new LanguageClient(
    'VSCodeMdxClient',
    'VSCode Mdx Language Server',
    serverOptions,
    clientOptions,
  );

  // 启动客户端
  client.start();

  displayServerProgress(client.onReady());
  activeError(client);
  activeVirtualDocument(client);

  return client;
}

export function deactivate() {
  if (client) {
    return client.stop();
  }
}
