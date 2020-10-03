import type * as ts from 'typescript';

function replaceLinks(text: string): string {
  return (
    text
      // Http(s) links
      .replace(
        /\{@(link|linkplain|linkcode) (https?:\/\/[^ |}]+?)(?:[| ]([^{}\n]+?))?\}/gi,
        (_, tag: string, link: string, text?: string) => {
          switch (tag) {
            case 'linkcode':
              return `[\`${text ? text.trim() : link}\`](${link})`;

            default:
              return `[${text ? text.trim() : link}](${link})`;
          }
        },
      )
  );
}

function processInlineTags(text: string): string {
  return replaceLinks(text);
}

function getTagBodyText(tag: ts.JSDocTagInfo, tsModule: typeof ts): string | undefined {
  if (!tag.text) {
    return undefined;
  }

  // Convert to markdown code block if it is not already one
  function makeCodeblock(text: string): string {
    if (text.match(/^\s*[~`]{3}/g)) {
      return text;
    }
    return '```\n' + text + '\n```';
  }

  // const text = tag.text;
  const text = tsModule.displayPartsToString(tag.text);

  switch (tag.name) {
    case 'example': {
      // check for caption tags, fix for #79704
      const captionTagMatches = text.match(/<caption>(.*?)<\/caption>\s*(\r\n|\n)/);
      if (captionTagMatches && captionTagMatches.index === 0) {
        return (
          captionTagMatches[1] + '\n\n' + makeCodeblock(text.substr(captionTagMatches[0].length))
        );
      }
      else {
        return makeCodeblock(text);
      }
    }
    case 'author': {
      // fix obsucated email address, #80898
      const emailMatch = text.match(/(.+)\s<([-.\w]+@[-.\w]+)>/);

      if (emailMatch === null) {
        return text;
      }
      else {
        return `${emailMatch[1]} ${emailMatch[2]}`;
      }
    }
    case 'default': {
      return makeCodeblock(text);
    }
  }

  return processInlineTags(text);
}

export function getTagDocumentation(tag: ts.JSDocTagInfo, tsModule: typeof ts): string | undefined {
  // const tagText = tag.text ?? '';
  const tagText = tsModule.displayPartsToString(tag.text);

  switch (tag.name) {
    case 'augments':
    case 'extends':
    case 'param':
    case 'template': {
      const body = tagText.split(/^(\S+)\s*-?\s*/);
      if (body?.length === 3) {
        const param = body[1];
        const doc = body[2];
        const label = `*@${tag.name}* \`${param}\``;
        if (!doc) {
          return label;
        }
        return (
          label +
          (doc.match(/\r\n|\n/g) ? '  \n' + processInlineTags(doc) : ` — ${processInlineTags(doc)}`)
        );
      }
    }
  }

  // Generic tag
  const label = `*@${tag.name}*`;
  const text = getTagBodyText(tag, tsModule);

  if (!text) {
    return label;
  }

  return label + (text.match(/\r\n|\n/g) ? '  \n' + text : ` — ${text}`);
}

export function plain(parts: ts.SymbolDisplayPart[] | string): string {
  return processInlineTags(
    typeof parts === 'string' ? parts : parts.map(part => part.text).join(''),
  );
}
