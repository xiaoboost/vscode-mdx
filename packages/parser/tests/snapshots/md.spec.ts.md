# Snapshot report for `tests/md.spec.ts`

The actual snapshot is saved in `md.spec.ts.snap`.

Generated by [AVA](https://avajs.dev).

## code-block

> Snapshot 1

    {
      errors: [],
      root: Root {
        _kind: 'Root',
        children: [
          Paragraph {
            _kind: 'Paragraph',
            children: [
              Text {
                _kind: 'Text',
                range: {
                  end: 4,
                  start: 0,
                },
                text: '# 标题',
                type: 1,
              },
            ],
            range: {
              end: 6,
              start: 0,
            },
            type: 3,
          },
          Paragraph {
            _kind: 'Paragraph',
            children: [
              Text {
                _kind: 'Text',
                range: {
                  end: 11,
                  start: 8,
                },
                text: '内容1',
                type: 1,
              },
            ],
            range: {
              end: 13,
              start: 8,
            },
            type: 3,
          },
          CodeBlock {
            _kind: 'CodeBlock',
            attrs: {
              filename: '代码1',
            },
            lang: 'ts',
            range: {
              end: 54,
              start: 15,
            },
            text: 'const abc = 1;',
            type: 4,
          },
          CodeBlock {
            _kind: 'CodeBlock',
            attrs: {
              lsp: true,
            },
            lang: 'jsx',
            range: {
              end: 137,
              start: 58,
            },
            text: `import React from 'react';␍␊
            export const Div = <div>123</div>;`,
            type: 4,
          },
        ],
        code: `# 标题␍␊
        ␍␊
        内容1␍␊
        ␍␊
        \`\`\`ts filename=代码1␍␊
        const abc = 1;␍␊
        \`\`\`␍␊
        ␍␊
        \`\`\`jsx lsp␍␊
        import React from 'react';␍␊
        export const Div = <div>123</div>;␍␊
        \`\`\`␍␊
        `,
        options: {
          isMdx: true,
        },
        range: {
          end: 139,
          start: 0,
        },
        type: 0,
      },
    }

## comment

> Snapshot 1

    {
      errors: [],
      root: Root {
        _kind: 'Root',
        children: [
          Comment {
            _kind: 'Comment',
            range: {
              end: 12,
              start: 0,
            },
            text: ' 块注释 ',
            type: 2,
          },
          Paragraph {
            _kind: 'Paragraph',
            children: [
              Text {
                _kind: 'Text',
                range: {
                  end: 21,
                  start: 16,
                },
                text: '文本内容1',
                type: 1,
              },
              Comment {
                _kind: 'Comment',
                range: {
                  end: 34,
                  start: 21,
                },
                text: ' 行内注释 ',
                type: 2,
              },
              Text {
                _kind: 'Text',
                range: {
                  end: 39,
                  start: 34,
                },
                text: '文本内容2',
                type: 1,
              },
            ],
            range: {
              end: 41,
              start: 16,
            },
            type: 3,
          },
        ],
        code: `<!-- 块注释 -->␍␊
        ␍␊
        文本内容1<!-- 行内注释 -->文本内容2␍␊
        `,
        options: {
          isMdx: true,
        },
        range: {
          end: 41,
          start: 0,
        },
        type: 0,
      },
    }
