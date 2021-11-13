import test from 'ava';

import { isMdxFile, getMdxFileName, getMdxFileType, MdxFileType } from '../src';

test('mdx-type', ({ is }) => {
  const fileName = '/User/xxx/test.mdx';

  // 文件名称不变
  is(getMdxFileName(fileName, MdxFileType.None), fileName);

  // 类型和路径的相互转换
  const checkType = (type: MdxFileType) => {
    is(getMdxFileType(getMdxFileName(fileName, type as any, 1, 'ts')), type);
  };

  checkType(MdxFileType.Mdx);
  checkType(MdxFileType.Md);
  checkType(MdxFileType.MainJsx);
  checkType(MdxFileType.MainMd);
  checkType(MdxFileType.Index);
  checkType(MdxFileType.CodeBlock);
});

test('is-mdx', ({ true: isTrue, false: isFalse }) => {
  isFalse(isMdxFile('/User/xxx/test.js'));
  isFalse(isMdxFile('/User/xxx/test.mdmdmd'));
  isFalse(isMdxFile('/User/xxx/test._mdx.md'));
  isTrue(isMdxFile('/User/xxx/test.md'));
  isTrue(isMdxFile('/User/xxx/test.mdx'));
});
