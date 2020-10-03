import type { RuleInputData } from '../types';

/**
 * 行内表达式不允许换行
 */
export const inlineExpressionNewline: RuleInputData = {
  name: 'inline-expression-newline',
  option: 'Error',
  visit(node, { addEntry }) {
    if (
      node.kind === 'ExpressionStatement' &&
      node.isInline &&
      /[\n\f]/.test(node.text)
    ) {
      addEntry({
        message: 'Inline expression can\'t contain blank lines.',
        range: node.range,
      });
    }
  },
}
