import test from 'ava';

import { toFsPath, toURI, normalize, isSubpath, dirnames } from '../src';

test('normalize', ({ is }) => {
  const path1 = '/user\\/xiao/\\//file.txt';
  const path2 = 'user\\/xiao/\\//file.txt';
  const path3 = 'd:\\/test/file2.txt';
  const path4 = 'd:\\/test/file2.txt//\\/\\';
  const path5 = 'e:\\/';

  is(normalize(path1), '/user/xiao/file.txt');
  is(normalize(path2), 'user/xiao/file.txt');
  is(normalize(path3), 'D:/test/file2.txt');
  is(normalize(path4), 'D:/test/file2.txt');
  is(normalize(path5), 'E:/');
});

test('fsPath-uri', ({ is }) => {
  const path1 = '/user/xiao/file.txt';
  const uri1 = `file://${path1}`;

  is(toURI(path1), uri1);
  is(toFsPath(uri1), path1);
});

test('isSubpath', ({ true: isTrue, false: isFalse }) => {
  isTrue(isSubpath('/user/xiao/test', '/user/xiao/test/file1'));
  isFalse(isSubpath('/user/xiao/test', '/user/xiao/test2/file1'));
  isTrue(isSubpath('c:/user/xiao/test', 'C:/user\\/xiao///test/file1'));
  isFalse(isSubpath('d:/user/xiao/test', 'e:/user/xiao/test2/file1'));
});

test('dirnames', ({ deepEqual }) => {
  deepEqual(dirnames('/user/xiao/test'), [
    '/user/xiao/test',
    '/user/xiao',
    '/user',
    '/',
  ]);

  deepEqual(dirnames('c:/user/xiao/test.txt'), [
    'C:/user/xiao/test.txt',
    'C:/user/xiao',
    'C:/user',
    'C:/',
  ]);
});
