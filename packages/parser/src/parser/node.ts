import { ParserOptions } from './types';
import { getNullRange } from './utils';
import { OffsetRange } from '@mdx/utils';

export enum NodeType {
  Root,
  Text,
  Comment,
  Paragraph,
  CodeBlock,
  ImportStatement,
  JsxStatement,
  ExpressionStatement,
}

export type NodeKind = keyof typeof NodeType;

export type Node =
  | Root
  | Text
  | Comment
  | Paragraph
  | CodeBlock
  | ImportStatement
  | JsxStatement
  | ExpressionStatement;

export class NodeCommon {
  /** 节点类型 */
  declare readonly type: NodeType;
  /** 节点类型字符串 */
  declare readonly kind: NodeKind;

  /** 节点范围 */
  range: OffsetRange;
  /** 上级节点 */
  declare parent?: Node;
  /** 下级节点列表 */
  declare children?: Node[];

  constructor(type: NodeType, range?: OffsetRange) {
    this.type = type;
    this.range = range ?? getNullRange();
  }

  /**
   * 遍历所有节点
   *  - 回调返回`true`则退出迭代
   */
  protected _walk(cb: (node: Node) => boolean): boolean {
    /* eslint-disable-next-line @typescript-eslint/no-this-alias */
    const self: Node = this as any;

    let result = cb(self);

    // 返回 true 则退出
    if (result) {
      return true;
    }

    if (self.children) {
      result = (self.children as NodeCommon[]).some(node => node._walk(cb));

      if (result) {
        return true;
      }
    }

    return result;
  }

  /** 遍历所有节点 */
  walk(cb: (node: Node) => any) {
    this._walk((node) => {
      cb(node);
      return false;
    });
  }

  index(node: NodeCommon): number {
    return this.children ? this.children.indexOf(node as Node) : -1;
  }

  next(): Node | undefined {
    if (!this.parent) {
      return;
    }

    const index = this.parent.index(this);
    return this.parent.children![index + 1];
  }

  prev(): Node | undefined {
    if (!this.parent) {
      return;
    }

    const index = this.parent.index(this);
    return this.parent.children![index - 1];
  }

  root(): Root {
    /* eslint-disable-next-line @typescript-eslint/no-this-alias */
    let result: any = this;

    while (result.parent) {
      result = result.parent;
    }

    return result;
  }

  setParent(this: Node, parent: Node) {
    if (this.parent) {
      this.parent.removeChild(this);
    }

    this.parent = parent;

    const list = parent.children as Node[] | undefined;

    if (!list) {
      parent.children = [this];
    }
    else if (list.every(item => item !== this)) {
      list.push(this as any);
    }
  }

  removeChild(this: Node, node: Node) {
    if (this.children) {
      const list = this.children;

      if (Array.isArray(list)) {
        const index = list.indexOf(node);

        if (index > -1) {
          list.splice(index, 1);
        }
      }
    }
  }

  toOriginString() {
    const root = this.root();
    return root.code.substring(this.range.start, this.range.end);
  }

  toString() {
    // 没有自定义 toString 的使用 toOriginString 兜底
    return this.toOriginString();
  }
}

// 原型链上添加 kind 访问器
Object.defineProperty(NodeCommon.prototype, 'kind', {
  get(this: NodeCommon) {
    return NodeType[this.type];
  },
});

/** 根 */
export class Root extends NodeCommon {
  declare readonly type: NodeType.Root;
  declare readonly kind: 'Root';
  /** 源码 */
  readonly code: string;
  /** 编译选项 */
  readonly options: ParserOptions;

  constructor(code: string, opt: ParserOptions, range?: OffsetRange) {
    super(NodeType.Root, range);
    this.code = code;
    this.options = opt;
  }
}

/** 注释 */
export class Comment extends NodeCommon {
  declare readonly type: NodeType.Comment;
  declare readonly kind: 'Comment';

  /** 原始文本 */
  text: string;

  constructor(text: string, range?: OffsetRange) {
    super(NodeType.Comment, range);
    this.text = text;
  }

  toString() {
    return `<!--${this.text}-->`;
  }
}

/** 文本 */
export class Text extends NodeCommon {
  declare readonly type: NodeType.Text;
  declare readonly kind: 'Text';

  /** 原始文本 */
  text: string;

  constructor(text: string, range?: OffsetRange) {
    super(NodeType.Text, range);
    this.text = text;
  }

  toString() {
    return this.text;
  }
}

/** 段落 */
export class Paragraph extends NodeCommon {
  declare readonly type: NodeType.Paragraph;
  declare readonly kind: 'Paragraph';

  constructor(range?: OffsetRange) {
    super(NodeType.Paragraph, range);
  }

  toString() {
    return this.children?.map((node: any) => node.toString()).join('\n') ?? '';
  }
}

/** 代码块 */
export class CodeBlock extends NodeCommon {
  declare readonly type: NodeType.CodeBlock;
  declare readonly kind: 'CodeBlock';

  /** 原始文本 */
  text: string;
  /** 代码块语言 */
  lang?: string;
  /** 代码块属性 */
  attrs?: Record<string, string | boolean>;

  constructor(text: string, range?: OffsetRange) {
    super(NodeType.CodeBlock, range);
    this.text = text;
  }

  toString() {
    return this.text;
  }
}

/** import / export 语句 */
export class ImportStatement extends NodeCommon {
  declare readonly type: NodeType.ImportStatement;
  declare readonly kind: 'ImportStatement';

  /** 原始文本 */
  text: string;

  constructor(text: string, range?: OffsetRange) {
    super(NodeType.ImportStatement, range);
    this.text = text;
  }

  toString() {
    return this.text;
  }
}

/** jsx 表达式 */
export class JsxStatement extends NodeCommon {
  declare readonly type: NodeType.JsxStatement;
  declare readonly kind: 'JsxStatement';

  /** 原始文本 */
  text: string;

  constructor(text: string, range?: OffsetRange) {
    super(NodeType.JsxStatement, range);
    this.text = text;
  }

  toString() {
    return this.text;
  }
}

/** js 表达式 */
export class ExpressionStatement extends NodeCommon {
  declare readonly type: NodeType.ExpressionStatement;
  declare readonly kind: 'ExpressionStatement';

  /** 原始文本 */
  text: string;
  /** 是否是行内表达式 */
  isInline: boolean;

  constructor(text: string, isInline: boolean, range?: OffsetRange) {
    super(NodeType.ExpressionStatement, range);
    this.text = text;
    this.isInline = isInline;
  }

  toString() {
    return this.text;
  }
}

export interface NodeTypeMap {
  [NodeType.Root]: Root;
  [NodeType.Text]: Text;
  [NodeType.Comment]: Comment;
  [NodeType.Paragraph]: Paragraph;
  [NodeType.ImportStatement]: ImportStatement;
  [NodeType.JsxStatement]: JsxStatement;
  [NodeType.ExpressionStatement]: ExpressionStatement;
  [NodeType.CodeBlock]: CodeBlock;
}
