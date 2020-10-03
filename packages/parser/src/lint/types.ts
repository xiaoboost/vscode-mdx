import { ParserSeverity, ParserError, Range, Node } from '../parser';

export {
  ParserSeverity as LintSeverity,
}

export type LintSeverityInput = keyof typeof ParserSeverity;
export type LintRuleOptionInput = LintSeverityInput | [LintSeverityInput, any];
export type LintError = ParserError;

export interface LintRuleOption {
  severity: ParserSeverity;
  value?: any;
}

export interface EntryInput {
  message: string;
  range: Range;
}

export interface LintContext {
  option: LintRuleOption;
  addEntry(error: EntryInput): void;
}

export interface RuleData {
  name: string;
  option: LintRuleOption;
  visit(node: Node, context: LintContext): void;
}

export interface RuleInputData {
  name: string;
  option: LintRuleOptionInput;
  visit(node: Node, context: LintContext): void;
}
