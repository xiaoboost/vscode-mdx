import { LintRuleOptionInput, LintRuleOption, LintSeverity } from './types';
import { isArray } from '@xiao-ai/utils';

export function toLevel(level: string): LintSeverity {
  const val = level.toLowerCase();

  switch (val) {
    case 'ignore':
      return LintSeverity.Ignore;
    case 'warn':
      return LintSeverity.Warn;
    case 'error':
      return LintSeverity.Error;
    default:
      return LintSeverity.Ignore;
  }
}

export function toOption(opt: LintRuleOptionInput): LintRuleOption {
  if (isArray(opt)) {
    return {
      severity: toLevel(opt[0]),
      value: opt[1],
    };
  }
  else {
    return {
      severity: toLevel(opt) ?? LintSeverity.Ignore,
    };
  }
}
