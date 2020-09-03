export const errorText = {
    tagUnClosed: 'Tag is not closed.',
    extraCloseTag: 'Extra closing tags.',
    attributeDuplicate: 'Attributes duplicate.',
    commandDuplicate: 'Command duplicate.',
    unusedAttribute: (name: string, tag: string) => `Can't use Attribute '${name}' in Tag '${tag}'.`,
    unexpectedCharacter: (char: string) => `Unexpected character "${char}".`,
    ifChainError: `'v-else-if' or 'v-else' directives require being preceded by the element which has a 'v-if' or 'v-else-if' directive.`,
    templateNotDefined: (name: string) => `Undefined template name '${name}'.`,
};
