import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { managerInitials, isManagerDefaultAvatar } from '../src/GUIs/utils/centerManagerAvatar.ts';

test('initials use the final two Vietnamese name components', () => {
  for (const [name, expected] of [['Nguyễn Văn Quản Lý', 'QL'], ['Nguyễn Văn An', 'VA'], ['Trần Minh Anh', 'MA'], ['  trần\t minh\n anh  ', 'MA']]) {
    assert.equal(managerInitials(name), expected);
  }
});

test('initials handle decomposed accents, one word and missing names', () => {
  assert.equal(managerInitials('Trần Ánh'.normalize('NFD')), 'TÁ');
  assert.equal(managerInitials('Đức'), 'Đ');
  for (const name of ['', ' \t\n ', null, undefined]) assert.equal(managerInitials(name), '?');
});

test('known system artwork is detected by provider and exact asset path', () => {
  for (const url of [null, '', ' ', 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager', '//api.dicebear.com/9.x/avataaars/png?seed=other', '/assets/img/profiles/avatar-27.jpg?version=1']) {
    assert.equal(isManagerDefaultAvatar(url), true, String(url));
  }
});

test('personal image URLs are retained without broad avatar-name or host matching', () => {
  for (const url of ['/uploads/manager.jpg', 'https://photos.example/avatar-27.jpg', 'https://api.dicebear.com.example/7.x/avataaars/svg', 'data:image/png;base64,abcd', 'blob:https://example.test/photo']) {
    assert.equal(isManagerDefaultAvatar(url), false, url);
  }
});

const componentUrl = new URL('../src/GUIs/components/admin/CenterManager/CenterManagerTopbarAvatar.tsx', import.meta.url);
let compiled = ts.transpileModule(fs.readFileSync(componentUrl, 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext } }).outputText;
for (const specifier of ['react', 'react/jsx-runtime']) {
  for (const quote of ['"', "'"]) compiled = compiled.replaceAll(`${quote}${specifier}${quote}`, JSON.stringify(import.meta.resolve(specifier)));
}
compiled = compiled.replace("'../../../utils/centerManagerAvatar'", JSON.stringify(new URL('../src/GUIs/utils/centerManagerAvatar.ts', import.meta.url).href));
const { default: Avatar } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const render = props => renderToStaticMarkup(React.createElement(Avatar, props));

test('Manager avatar renders initials for missing or system default artwork', () => {
  for (const url of [null, 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager']) {
    const html = render({ name: 'Nguyễn Văn Quản Lý', url });
    assert.match(html, />QL<\/span>/);
    assert.doesNotMatch(html, /<img/);
  }
  assert.match(render({}), />\?<\/span>/);
});

test('Manager avatar keeps a personal image source and decorative alt text', () => {
  const html = render({ name: 'Nguyễn Văn An', url: '/uploads/personal-photo.png' });
  assert.match(html, /src="\/uploads\/personal-photo.png" alt=""/);
  assert.doesNotMatch(html, /ntf-avatar/);
});
