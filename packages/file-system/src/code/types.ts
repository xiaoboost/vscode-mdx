import { Position } from 'vscode-languageserver-types';

export type ScriptLang = 'js' | 'ts' | 'jsx' | 'tsx';
export type MarkdownLang = 'mdx' | 'md';
export type TextLang = 'text';
export type Lang = MarkdownLang | ScriptLang | TextLang;

export type InputPosition = number | Position;

export interface InputRange {
  start: InputPosition;
  end: InputPosition;
}
