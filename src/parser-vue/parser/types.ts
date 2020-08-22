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

export type Node = Root | ContentText | ContentMustache | Attribute | Element | Comment;
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
    root: any;
}

export interface Style extends NodeCommon {
    root: any;
}

export interface Attribute extends NodeCommon {
    type: NodeType.Attribute;
    parent?: Element;
    /** 属性名称 */
    name: string;
    /** 属性值 */
    value?: string;
    /** 属性名称结束位置 */
    nameEnd: Location;
    /** 属性值开始位置 */
    valueStart: Location;
}

export interface Command extends NodeCommon {
    type: NodeType.Command;
    parent?: Element;
    /** 属性名称 */
    name: string;
    /** 属性值 */
    value?: string;
    /**
     * 指令名称结束位置
     *  - 冒号前的位置
     */
    nameEnd: Location;
    /** 指令修饰符开始位置 */
    /**
     * 指令绑定属性名称开始位置
     *  - 冒号后的位置
     */
    /**
     * 指令绑定属性名称结束位置
     *  - 整个指令等号之前的位置
     */
    /** 指令值值开始位置 */
    valueStart: Location;
    /** 绑定的变量名称 */
    bind?: string;
    /** 指令修饰符 */
    modifier?: string[];
}

export interface ParserOptions {
    location?: boolean;
    errorDetail?: boolean;
    /** 项目根目录路径 */
    original?: string;
    /**
     * 当前文件路径
     *  - 可以是绝对路径
     *  - 也可以是相对项目根目录路径
     */
    filePath?: string;
}

export interface ErrorOutput {
    errors?: ParserError[];
    warnings?: ParserError[];
}
