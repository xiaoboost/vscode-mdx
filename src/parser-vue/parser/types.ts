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
    name: {
        value: string;
        range: Range;
    };
    /** 属性值 */
    value: {
        value: string | boolean;
        range?: Range;
    };
}

export interface Command extends Omit<Attribute, 'type'> {
    type: NodeType.Command;
    /** 是否是缩写指令 */
    isShortName: boolean;
    /**
     * 指令参数
     *  - `:`之后，等号之前的部分
     *  - `v-bind:test="test"`中`'test'`部分
     */
    arg?: {
        value: string;
        range: Range;
    };
    /**
     * 指令修饰符
     *  - `.`之后的部分
     *  - `v-on:click.left.stop`中`['left', 'stop']`的部分
     */
    modifiers?: {
        value: string;
        range: Range;
    }[];
}

export interface ParserOptions {
    location?: boolean;
    errorDetail?: boolean;
    /** 当前 vue 版本 */
    version?: string;
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
