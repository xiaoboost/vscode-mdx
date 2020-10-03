import type { LanguageService, CompletionItem } from '../types';

export const NULL_HOVER = null;
export const NULL_SIGNATURE = null;
export const NULL_COMPLETION: CompletionItem[] = [];
export const nullMode: LanguageService = {
  getId: () => '',
};

export const lowerLetter = Array(26)
  .fill(false)
  .map((_, i) => String.fromCharCode(97 + i));

export const upperLetter = Array(26)
  .fill(false)
  .map((_, i) => String.fromCharCode(65 + i));
