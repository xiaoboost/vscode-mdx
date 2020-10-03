import { URI } from 'vscode-uri';
import { dirname } from 'path';

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
