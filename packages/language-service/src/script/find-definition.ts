import type { ServiceHost } from '@mdx/language-host-typescript';
import type { DiskController } from '@mdx/file-system';

import { TextDocument, Position, Location } from '../types';
import { isDef } from '@xiao-ai/utils';

import {
  toURI,
  toFsPath,
  normalize,
  virtualSchemeName,
  isMdxJsx,
  isMdCodeBlock,
} from '@mdx/utils';

export function findDefinition(
  document: TextDocument,
  position: Position,
  fs: DiskController,
  host: ServiceHost,
) {
  const server = host.getScriptServer();
  const filePath = toFsPath(document.uri);
  const offset = document.offsetAt(position);
  const definitions = server.getDefinitionAtPosition(filePath, offset);

  if (!definitions) {
    return [];
  }

  // const program = server.getProgram();

  // if (!program) {
  //   return [];
  // }

  const definitionResults: Location[] = definitions
    .map(({ fileName, textSpan }) => {
      // node_modules 中的虚拟文件
      if (fs.readFile(fileName) && /[\\/]node_modules[\\/].*\.d\.ts$/.test(fileName)) {
        const libPath = normalize(fileName.replace(/^.*[\\/]node_modules/, 'node_modules'));

        return {
          uri: toURI(libPath, virtualSchemeName),
          range: {
            start: document.positionAt(textSpan.start),
            end: document.positionAt(textSpan.start + textSpan.length),
          },
        };
      }
      // 拆解出来的文件
      else if (isMdxJsx(fileName) || isMdCodeBlock(fileName)) {
        const startOffset = textSpan.start;
        const endOffset = textSpan.start + textSpan.length;
        const code = fs.getCode(fileName);
        const sourceMap = code?.sourceMap;
        const sourceDocument = sourceMap?.source;
        const sourceRange = sourceMap?.getSourceRange(startOffset, endOffset);

        if (!code || !sourceMap || !sourceDocument || !sourceRange) {
          return;
        }

        return {
          uri: sourceDocument.uri,
          range: {
            start: sourceDocument.positionAt(sourceRange.start),
            end: sourceDocument.positionAt(sourceRange.end),
          },
        };
      }
      // 原生脚本文件
      else {
        return {
          uri: toURI(fileName),
          range: {
            start: document.positionAt(textSpan.start),
            end: document.positionAt(textSpan.start + textSpan.length),
          },
        };
      }
    })
    .filter(isDef);

  return definitionResults;
}
