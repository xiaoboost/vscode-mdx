import lineColumn from 'line-column';

import { isWhiteSpace } from '../tokenizer/constant';
import { ParserError, Root, NodeType, Range, Element, Node, Location } from './types';

export interface ErrorOutput {
    errors: ParserError[];
    warnings: ParserError[];
}

export type RangeAt = (start: number, end: number) => Range;
export type Check = (node: Element, root: Root, range: RangeAt) => ErrorOutput | void | undefined;

export const nullLoc: Location = {
    offset: -1,
};

export const nullRange: Range = {
    start: nullLoc,
    end: nullLoc,
};

export function findLocation(code: string, enable = true) {
    if (!enable) {
        return {
            rangeAt: (start: number, end: number): Range => ({
                start: {
                    offset: start,
                },
                end: {
                    offset: end,
                },
            }),
            positionAt: (offset: number): Location => ({
                offset,
            }),
        };
    }

    const len = code.length;
    const positionFinder = lineColumn(code);
    const endPosition = purePositionAt(len - 1);
    const eosPosition = {
        ...endPosition,
        offset: endPosition.offset + 1,
        col: endPosition.col + 1,
    };

    function purePositionAt(offset: number) {
        const result = positionFinder.fromIndex(offset);

        return {
            offset,
            ...(result || {
                line: -1,
                col: -1,
            }),
        };
    }

    function positionAt(offset: number) {
        return offset === len
            ? { ...eosPosition }
            : purePositionAt(offset);
    }
    function rangeAt(start: number, end: number): Range {
        return {
            start: positionAt(start),
            end: positionAt(end),
        };
    }

    return {
        rangeAt,
        positionAt,
    };
}

export function offsetNotWhiteSpaceStart(text: string) {
    let start = 0;

    while(isWhiteSpace(text.charCodeAt(start))) {
        start++;
    }

    return start;
}

export function offsetNotWhiteSpaceEnd(text: string) {
    let end = 0;

    while(isWhiteSpace(text.charCodeAt(text.length - end - 1))) {
        end++;
    }

    return end;
}

export function getPre(node: Node) {
    const parent = node.parent;

    if (!parent) {
        return;
    }

    const list = parent.children!;
    const index = list.findIndex((item) => item === node);

    return list[index - 1];
}

export function getNext(node: Node) {
    const parent = node.parent;

    if (!parent) {
        return;
    }

    const list = parent.children!;
    const index = list.findIndex((item) => item === node);

    return list[index + 1];
}

/** 获取上一个元素节点 */
export function getPreElement(node: Node) {
    let cur: Node | undefined = getPre(node);

    while(cur && cur.type !== NodeType.Element) {
        cur = getPre(cur);
    }

    return cur;
}

/** 非空子元素范围 */
export function getNoSpaceChild(node: Element) {
    if (!node.children || node.children.length === 0) {
        return [0, 0];
    }

    const first = node.children[0];
    const last = node.children[node.children.length - 1];

    let start = first.range.start.offset;
    let end = last.range.end.offset;

    if (first.type === NodeType.ContentText) {
        start += offsetNotWhiteSpaceStart(first.text);
    }

    if (last.type === NodeType.ContentText) {
        end -= offsetNotWhiteSpaceStart(last.text);
    }

    return [start, end];
}
