import test from 'ava';

import { DiskController } from '../src';
import { toURI } from '@mdx/utils';
import { TextDocument } from 'vscode-languageserver-textdocument';

test('writeFile', ({ is, falsy, true: isTrue, false: isFalse }) => {
  const fs = new DiskController();
  const filePath = 'c:/program/test.txt';
  const content1 = '内容文本1';
  const content2 = '内容文本2';
  const content3 = '内容文本3';

  falsy(fs.readFile(filePath));

  const writeDoc = fs.writeFile(filePath, content1);
  const doc = fs.readFile(filePath)!;

  is(writeDoc, doc);

  is(doc.getText(), content1);
  is(doc.version, 1);

  fs.writeFile(filePath, content2);

  is(doc.getText(), content2);
  is(doc.version, 2);

  fs.writeFile(TextDocument.create(toURI(filePath), 'txt', 1, content3));

  is(doc.getText(), content3);
  is(doc.version, 3);

  isTrue(fs.stat('c:/')!.isDirectory());
  isTrue(fs.stat('c:/program')!.isDirectory());
  isFalse(fs.stat(filePath)!.isDirectory());
  is(fs.stat('c:/program/123'), undefined);
});

test('fillFiles', ({ is, falsy, true: isTrue, false: isFalse }) => {
  const fs = new DiskController();
  const content1 = '{ version: 1 }';
  const content2 = 'const abc = 1;';
  const files = {
    'node_modules/test/package.json': content1,
    'node_modules/test/dist/index.js': content2,
  };

  fs.fillFiles(files, 'c:/module');

  falsy(fs.stat('c:/tes2'));
  falsy(fs.stat('c:/node_modules/test'));
  isTrue(fs.stat('c:/module')!.isDirectory());
  isTrue(fs.stat('c:/module/node_modules/test/')!.isDirectory());
  isFalse(fs.stat('c:/module/node_modules/test/package.json')!.isDirectory());

  is(fs.readFile('c:/module/node_modules/test/package.json')!.getText(), content1);
  is(fs.readFile('c:/module/node_modules/test/dist/index.js')!.getText(), content2);
});

test('readdir', ({ deepEqual }) => {
  const fs = new DiskController();
  const sort = (pre: string, next: string) => {
    return pre > next ? 1 : -1;
  };

  fs.fillFiles({
    'c:/user/test/file1.txt': '内容1',
    'c:/user/test1/file2.txt': '内容2',
    'c:/user/test1/files/file3.txt': '内容3',
  });

  deepEqual(fs.readdir('c:/').sort(sort), [
    'user',
  ]);

  deepEqual(fs.readdir('c:/user').sort(sort), [
    'test',
    'test1',
  ]);

  deepEqual(fs.readdir('c:/user/test1').sort(sort), [
    'file2.txt',
    'files',
  ]);
});

test('rm directory', ({ falsy }) => {
  const fs = new DiskController();

  fs.fillFiles({
    'c:/user/test/file1.txt': '内容1',
    'c:/user/test1/file2.txt': '内容2',
    'c:/user/test2/file3.txt': '内容3',
  });

  fs.rm('c:/user');
  falsy(fs.stat('c:/'));
});

test('rm file', ({ is, truthy }) => {
  const fs = new DiskController();

  fs.fillFiles({
    'c:/user/test/file1.txt': '内容1',
    'c:/user/test1/file2.txt': '内容2',
    'c:/user/test1/folder1/folder2/folder3/file3.txt': '内容3',
  });

  fs.rm('c:/user/test1/folder1/folder2/folder3/file3.txt');

  is(fs.stat('c:/user/test1/folder1'), undefined);
  truthy(fs.stat('c:/user/test1/file2.txt'));
  truthy(fs.stat('c:/user'));
});
