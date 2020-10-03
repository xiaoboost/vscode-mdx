import { TokenType, Scanner } from '../tokenizer';
import { PartPartial } from '@xiao-ai/utils';
import { lint } from '../lint';

import * as error from './error';

import {
  ParserError,
  ParserOptions,
  ParseOutput,
  ParserSeverity,
} from './types';

import {
  NodeType,
  Node,
  Root,
  Comment,
  Text,
  Paragraph,
  JsxStatement,
  ExpressionStatement,
  ImportStatement,
  CodeBlock,
  NodeTypeMap,
} from './node';

class Parser {
  readonly code: string;
  readonly scanner: Scanner;
  readonly options: ParserOptions;
  readonly errors: ParserError[] = [];

  readonly root: Root;

  /** 当前节点 */
  private currentNode: Node;
  /** 当前标志符 */
  private token: TokenType;

  constructor(code: string, opt: Partial<ParserOptions> = {}) {
    this.code = code;
    this.options = normalize(opt);
    this.scanner = new Scanner(code, this.options);
    this.root = new Root(code, this.options, this.getRange(0, code.length));
    this.currentNode = this.root;
    this.token = this.scanner.scan();
  }

  private getRange(start: number, end: number) {
    return { start, end };
  }

  private findParent<T extends NodeType>(target: T, node: Node): asserts node is NodeTypeMap[T] {
    while (this.currentNode.type !== target && this.currentNode.parent) {
      this.currentNode = this.currentNode.parent;
    }
  }

  private report(err: PartPartial<ParserError, 'message'>) {
    const last = this.errors[this.errors.length - 1];

    if (last) {
      if (
        err.name === last.name &&
        err.severity === last.severity &&
        err.range.start === last.range.end
      ) {
        last.range.end = err.range.end;
        return;
      }
    }

    this.errors.push({
      name: err.name,
      message: err.message ? err.message : error.text[err.name],
      severity: err.severity,
      range: { ...err.range },
    });
  }

  parse() {
    const { scanner } = this;

    while (this.token !== TokenType.EOS) {
      switch (this.token) {
        case TokenType.CommentStartTag: {
          const comment = new Comment('', {
            start: scanner.tokenStart,
            end: -1,
          });

          comment.setParent(this.currentNode);
          this.currentNode = comment;
          break;
        }
        case TokenType.CommentEndTag: {
          this.currentNode.range.end = scanner.tokenEnd;
          this.currentNode = this.currentNode.parent as Node;
          break;
        }
        case TokenType.CommentContent: {
          (this.currentNode as Comment).text = scanner.tokenText;
          this.currentNode.range.end = scanner.tokenEnd;
          break;
        }
        case TokenType.Text: {
          if (this.currentNode.type !== NodeType.Paragraph) {
            const paragraph = new Paragraph(scanner.tokenRange);
            paragraph.setParent(this.currentNode);
            this.currentNode = paragraph;
          }

          const paragraph = this.currentNode;
          const text = new Text(scanner.tokenText, scanner.tokenRange);
          text.setParent(paragraph);
          break;
        }
        case TokenType.ParagraphEnd: {
          if (this.currentNode.type === NodeType.Paragraph) {
            this.currentNode.range.end = scanner.tokenEnd;
            this.currentNode = this.currentNode.parent as Node;
          }
          break;
        }
        case TokenType.ImportStatement: {
          const text = scanner.tokenText;
          const node = new ImportStatement(text, scanner.tokenRange);
          node.setParent(this.currentNode);
          break;
        }
        case TokenType.CodeBlockStart: {
          const block = new CodeBlock('', {
            start: scanner.tokenStart,
            end: -1,
          });

          block.setParent(this.currentNode);
          this.currentNode = block;
          break;
        }
        case TokenType.CodeBlockAttribute: {
          const block = this.currentNode as CodeBlock;
          const text = scanner.tokenText;

          block.range.end = scanner.tokenEnd;

          if (!block.lang) {
            block.lang = text;
          }
          else {
            const [key, value] = text.split('=');

            if (!block.attrs) {
              block.attrs = {};
            }

            block.attrs[key] = value ?? true;
          }

          break;
        }
        case TokenType.CodeBlockContent: {
          (this.currentNode as CodeBlock).text = scanner.tokenText;
          this.currentNode.range.end = scanner.tokenEnd;
          break;
        }
        case TokenType.CodeBlockEnd: {
          this.currentNode.range.end = scanner.tokenEnd;
          this.currentNode = this.currentNode.parent as Node;
          break;
        }
        case TokenType.JsxExpression: {
          const jsx = new JsxStatement(scanner.tokenText, scanner.tokenRange);
          jsx.setParent(this.currentNode);
          break;
        }
        case TokenType.BlockExpression: {
          const codeText = scanner.tokenText;
          const block = new ExpressionStatement(
            codeText.slice(1, codeText.length - 1),
            this.currentNode.type === NodeType.Paragraph,
            scanner.tokenRange,
          );
          block.setParent(this.currentNode);
          break;
        }
        case TokenType.Whitespace: {
          break;
        }
        case TokenType.Unknown: {
          const name = this.scanner.tokenError ?? '';

          this.report({
            name,
            severity: ParserSeverity.Error,
            message: error.text[name],
            range: this.getRange(this.scanner.tokenStart, this.scanner.tokenEnd),
          });

          break;
        }
      }

      if (this.scanner.tokenError && this.scanner.tokenType !== TokenType.Unknown) {
        const name = this.scanner.tokenError;

        this.report({
          name,
          severity: ParserSeverity.Error,
          message: error.text[name],
          range: this.getRange(this.scanner.tokenStart, this.scanner.tokenEnd),
        });
      }

      this.token = scanner.scan();
    }
  }
}

/** 标准化选项 */
function normalize(opt: Partial<ParserOptions> = {}): ParserOptions {
  return {
    isMdx: opt.isMdx ?? true,
  };
}

/** 编译代码 */
export function parse(code: string, opt?: Partial<ParserOptions>): ParseOutput {
  const parser = new Parser(code, opt);

  parser.parse();

  return {
    root: parser.root,
    errors: parser.errors.concat(lint(parser.root)),
  };
}
