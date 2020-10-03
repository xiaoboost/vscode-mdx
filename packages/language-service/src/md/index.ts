import type { LanguageService } from '../types';

import { languageId } from './constant';
// import { doValidation } from './do-validation';
// import { doHover } from './do-hover';
// import { doComplete } from './do-complete';
// import { doResolve } from './do-resolve';
// import { findDefinition } from './find-definition';

export function getMarkdownLanguageService(): LanguageService {
  return {
    getId: () => languageId,
    // doValidation(document) {
    //   return doValidation(document, opt.cards, opt.host);
    // },
    // doHover(document, position) {
    //   return doHover(document, position, opt.cards, opt.host);
    // },
    // doComplete(text, position) {
    //   return doComplete(text, position, opt.cards, opt.host);
    // },
    // doResolve(item) {
    //   return doResolve(item, opt.host);
    // },
    // findDefinition(text, position) {
    //   return findDefinition(text, position, opt.cards, opt.host);
    // },
  };
}
