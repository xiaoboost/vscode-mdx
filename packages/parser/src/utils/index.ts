import { Node } from '../parser';

/**
 * 遍历所有节点
 *  - 若回调返回`true`则退出迭代
 */
function each(root: Node, cb: (node: Node) => boolean): boolean {
    let result = cb(root);

    // 返回 true 则退出
    if (result) {
        return result;
    }

    if ('commands' in root && root.commands) {
        result = root.commands.some((node) => each(node, cb));
    }

    if ('attrs' in root && root.attrs) {
        result = root.attrs.some((node) => each(node, cb));
    }

    if (result) {
        return result;
    }

    if (result) {
        return result;
    }

    if (root.children) {
        result = root.children.some((node) => each(node, cb));
    }

    return result;
}

export function walk(root: Node, cb: (node: Node) => any) {
    each(root, (node) => {
        cb(node);
        return false;
    });
}

export function find(root: Node, cb: (node: Node) => boolean) {
    let result: Node | undefined;

    each(root, (node) => {
        if (cb(node)) {
            result = node;
            return true;
        }

        return false;
    });

    return result;
}

export function findAll(root: Node, cb: (node: Node) => boolean) {
    const result: Node[] = [];

    each(root, (node) => {
        if (cb(node)) {
            result.push(node);
        }

        return false;
    });

    return result;
}
