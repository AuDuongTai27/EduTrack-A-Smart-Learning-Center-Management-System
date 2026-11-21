import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
after(() => vite.close());
const { TopbarNotificationContent } = await vite.ssrLoadModule('/src/GUIs/components/shared/notifications/TopbarNotificationContent.tsx');
const { TopbarNotificationPopover } = await vite.ssrLoadModule('/src/GUIs/components/shared/notifications/TopbarNotificationPopover.tsx');
const render = props => renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(TopbarNotificationContent, { items: [], loading: false, error: null, retry() {}, basePath: '/parent/notifications', close() {}, ...props })));

test('all six role empty views keep the shared compact empty state and correct View All destination', () => {
  for (const role of ['center-manager', 'admin-staff', 'teacher', 'teaching-assistant', 'student', 'parent']) {
    const html = render({ basePath: `/${role}/notifications` });
    assert.match(html, /You&#x27;re all caught up!/); assert.match(html, /No unread notifications right now/);
    assert(html.includes(`href="/${role}/notifications"`)); assert.match(html, /bi-arrow-right/);
    assert.doesNotMatch(html, /class="ntf-item/);
  }
});
test('loading, scope wait and error stay distinct from successful empty state, with View All retained', () => {
  for (const [props, message] of [[{ items: null, loading: true }, 'Loading notifications...'], [{ items: null }, 'waiting for your account context'], [{ items: null, error: 'HTTP 503 unavailable' }, 'HTTP 503 unavailable']]) {
    const html = render(props);assert(html.includes(message));assert.doesNotMatch(html, /all caught up|No unread/);assert.match(html, /ntf-view-all/);
    if (props.error) { assert.match(html, /role="alert"/);assert.match(html, /Retry/); }
  }
});
test('notification row preserves full text, timestamp, unread marker and existing navigation query', () => {
  const html = render({ items: [{ notificationId: 731, title: 'Real title', content: 'Real preview', type: 'system', isRead: false, createdAt: '2026-11-21T03:00:00Z', senderName: 'Actual sender' }] });
  for (const value of ['Real title', 'Real preview', 'Actual sender', 'aria-label="Unread"', '/parent/notifications?notificationId=731']) assert(html.includes(value), value);
  assert.match(html, /dateTime="2026-11-21T03:00:00Z"/i);
});
test('badge represents total unread and hides zero; unknown state never announces a fabricated zero', () => {
  const popover = count => renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(TopbarNotificationPopover, { unreadCount: count }, () => null)));
  assert.match(popover(12), /ntf-count">12/);
  assert.doesNotMatch(popover(0), /class="ntf-count"/);
  assert.match(popover(null), /not loaded/);assert.doesNotMatch(popover(null), /\(0 unread\)/);
});
