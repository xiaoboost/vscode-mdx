import { Node, ParserError } from '../parser';
import { RuleData, LintContext, LintSeverity } from './types';

import { rules } from './rules';
import { toOption } from './utils';

export function lint(root: Node) {
  const entries: ParserError[] = [];
  const allRules: RuleData[] = rules
    .map((rule) => ({ ...rule, option: toOption(rule.option) }))
    .filter((rule) => rule.option.severity !== LintSeverity.Ignore);

  function createContext(rule: RuleData): LintContext {
    return {
      option: rule.option,
      addEntry(err) {
        entries.push({
          name: rule.name,
          message: err.message,
          range: { ...err.range },
          severity: rule.option.severity,
        });
      },
    };
  }

  for (const rule of allRules) {
    const context = createContext(rule);

    root.walk((node) => {
      rule.visit(node, context);
    });
  }

  return entries;
}
