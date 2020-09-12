import { URI } from 'vscode-uri';
import { WorkspaceFolder } from 'vscode-languageclient';

import * as path from 'path';
import * as array from 'src/utils/array';
import * as assert from 'src/utils/assert';

const uris: string[] = [];

function isPathContain(target: string, outPath: string) {
    let dir = target;
    let last = '';

    while (dir !== outPath && dir !== last) {
        last = dir;
        dir = path.dirname(dir);
    }

    return dir === outPath;
}

function normalize(input: string | URI | WorkspaceFolder) {
    let val = '';

    if (assert.isString(input)) {
        val = input;
    }
    else if (URI.isUri(input)) {
        val = input.fsPath;
    }
    else if ('uri' in input) {
        val = URI.parse(input.uri).fsPath;
    }

    return val;
}

export function get() {
    return uris.slice();
}

export function add(input: string | URI | WorkspaceFolder) {
    const val = normalize(input);

    if (!uris.includes(val)) {
        uris.push(val);
    }
}

export function remove(input: string | URI | WorkspaceFolder) {
    array.removeVal(uris, normalize(input))
}

export function getWorkspaceByFile(file: string) {
    return uris.find((uri) => isPathContain(file, uri));
}
