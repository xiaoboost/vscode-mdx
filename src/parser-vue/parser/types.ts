export interface Location {
    line?: number;
    col?: number;
    offset: number;
}

export interface Range {
    start: Location;
    end: Location;
}

export enum NodeType {
    Root,
    Element,
    Comment,
    Attribute,
    Command,
    ContentText,
    ContentMustache,
}

export type Node = Root | ContentText | ContentMustache | Attribute | Command | Element | Comment;
export type TextNode = ContentText | ContentMustache;

export interface ParserError {
    message: string;
    range: Range;
    detail?: string;
}

export interface NodeCommon {
    type: NodeType;
    range: Range;
    parent?: Node;
    children?: Node[];
}

export interface Root extends NodeCommon {
    type: NodeType.Root;
}

export interface Element extends NodeCommon {
    type: NodeType.Element;
    tag: string;
    selfClose?: boolean;
    attrs?: Attribute[];
    commands?: Command[];
    startTagEnd: Location;
    endTagStart: Location;
}

export interface Comment extends NodeCommon {
    type: NodeType.Comment;
    text: string;
}

export interface ContentText extends NodeCommon {
    type: NodeType.ContentText;
    text: string;
}

export interface ContentMustache extends NodeCommon {
    type: NodeType.ContentMustache;
    text: string;
}

export interface Script extends NodeCommon {
    ast: any;
    text: string;
}

export interface Style extends NodeCommon {
    ast: any;
    text: string;
}

export interface Attribute extends NodeCommon {
    type: NodeType.Attribute;
    parent?: Element;
    /** 属性名称 */
    name: string;
    /** 属性值 */
    value: string | boolean;
    /** 属性名称结束位置 */
    nameEnd: Location;
    /** 属性值开始位置 */
    valueStart: Location;
}

export interface Command extends NodeCommon {
    type: NodeType.Command;
    parent?: Element;
    /** 指令作为属性的完整名称 */
    originName: string;
    /** 指令名称 */
    name: string;
    /** 属性值 */
    value: string | boolean;
    /**
     * 指令名称结束位置
     *  - 冒号前的位置
     */
    nameEnd: Location;
    /**
     * 属性值开始位置
     *  - 等号或第一个引号后的位置
     */
    valueStart: Location;
    /**
     * 指令参数部分
     *  - `:`之后的部分
     *  - `v-bind:test="test"`中`'test'`部分
     */
    arg?: {
        name: string;
        range: Range;
    };
    /**
     * 指令修饰符
     *  - `.`之后的部分
     *  - `v-on:click.left.stop`中`['left', 'stop']`的部分
     */
    modifiers?: {
        name: string;
        range: Range;
    }[];
}

export interface ParserOptions {
    location?: boolean;
    errorDetail?: boolean;
    /**
     * 项目根目录路径
     *  - 默认值是`/`
     */
    workspace?: string;
    /**
     * 当前文件路径
     *  - 可以是绝对路径
     *  - 也可以是相对项目根目录路径
     *  - 默认值是`/index.vue`
     */
    filePath?: string;
}

export interface ErrorOutput {
    errors?: ParserError[];
    warnings?: ParserError[];
}
