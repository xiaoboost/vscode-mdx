import { URI } from 'vscode-uri';
import { dirname, parse, format } from 'path';

export function toFsPath(uri: string) {
  return normalize(URI.parse(uri).fsPath);
}

export function toURI(fsPath: string, scheme = 'file') {
  const uri = URI.from({
    scheme,
    path: fsPath,
  });

  return uri.toString();
}

export function isSubpath(main: string, sub: string) {
  const normalizedMain = normalize(main);

  let current = normalize(sub);
  let lastPath = '';

  while (current !== lastPath) {
    lastPath = current;
    current = dirname(current);

    if (current === normalizedMain) {
      return true;
    }
  }

  return false;
}

const slash = /[/\\]+/;
const slashGlobal = new RegExp(slash.source, 'g');
const endSlash = new RegExp(`${slash.source}$`);
const windowStart = /^[a-zA-Z]:\/$/;
const windowStartPath = /^[a-z]:\/([^/]|$)/;

/** 标准化路径 */
export function normalize(fsPath: string) {
  let normalized = fsPath.replace(slashGlobal, '/');

  if (windowStartPath.test(normalized)) {
    normalized = `${normalized[0].toUpperCase()}${normalized.substring(1, normalized.length)}`;
  }

  if (endSlash.test(normalized) && !windowStart.test(normalized)) {
    normalized = normalized.replace(endSlash, '');
  }

  return normalized;
}

export function dirnames(target: string) {
  const fsPath = normalize(target);
  const result: string[] = [];

  let current = fsPath;

  while (current !== '/' && !windowStart.test(current)) {
    result.push(current)
    current = dirname(current);
  }

  result.push(current);

  return result;
}

/** 替换路径后缀 */
export function replaceSuffix(fileName: string, extname: string) {
  const name = parse(fileName);

  return normalize(format({
    root: name.root,
    dir: name.dir,
    name: name.base.replace(name.ext, ''),
    ext: extname,
  }));
}

/** 去除`ts/js`文件后缀  */
export function removeTsSuffix(fileName: string) {
  return fileName.replace(/(\.d)?\.(t|j)sx?$/, '');
}
