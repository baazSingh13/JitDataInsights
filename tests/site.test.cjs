const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');

function setup(t, options = {}) {
  // No resource loader: tests do not make external requests.
  const dom = new JSDOM(html, { url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true });
  t.after(() => dom.window.close());
  const window = dom.window;
  const media = new Map();
  window.matchMedia = query => {
    if (!media.has(query)) {
      const result = new window.EventTarget();
      result.matches = query.includes('800px') ? true : options.reducedMotion !== false;
      result.media = query;
      media.set(query, result);
    }
    return media.get(query);
  };
  window.HTMLCanvasElement.prototype.getContext = () => null;
  window.eval(script);
  const document = window.document;
  const get = id => document.getElementById(id);
  return { window, document, get, media };
}

test('all local links/assets resolve and the page has unique headings and IDs', t => {
  const { document } = setup(t);
  const ids = [...document.querySelectorAll('[id]')].map(element => element.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate IDs');
  assert.equal(document.querySelectorAll('h1').length, 1);
  for (const anchor of document.querySelectorAll('a[href^="#"]')) assert.ok(document.getElementById(anchor.hash.slice(1)), anchor.href);
  for (const element of document.querySelectorAll('[src],link[href]')) {
    const target = element.getAttribute('src') || element.getAttribute('href');
    if (!target.startsWith('https:')) assert.ok(fs.existsSync(path.join(root, target)), target);
  }
});

test('mobile navigation exposes state, closes with Escape and restores focus', t => {
  const { document, window } = setup(t);
  const button = document.querySelector('.mobile-menu-btn');
  button.click();
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(document.activeElement, button);
});

test('mobile anchor closes menu and focuses the destination; desktop resize resets state', t => {
  const { document, window, media } = setup(t);
  const button = document.querySelector('.mobile-menu-btn');
  button.click();
  document.querySelector('#primary-navigation a[href="#fpga-ip"]').click();
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(document.activeElement.id, 'fpga-ip');
  button.click();
  const viewport = media.get('(max-width: 800px)');
  viewport.matches = false;
  viewport.dispatchEvent(new window.Event('change'));
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(document.getElementById('primary-navigation').style.display, '', 'no stale inline display after resizing');
});

test('reduced motion is respected and the pause control is reversible', t => {
  const { document, get } = setup(t);
  assert.ok(document.documentElement.classList.contains('motion-paused'));
  assert.equal(get('motion-toggle').textContent, 'Play animations');
  get('motion-toggle').click();
  assert.ok(!document.documentElement.classList.contains('motion-paused'));
  get('motion-toggle').click();
  assert.ok(document.documentElement.classList.contains('motion-paused'));
});

test('without IntersectionObserver, content stays visible', t => {
  const { document, get } = setup(t, { reducedMotion: false });
  assert.equal(document.querySelectorAll('.reveal-pending').length, 0);
});

test('email form validates fields and submits to the intended recipient without JavaScript', () => {
  const dom = new JSDOM(html);
  try {
    const document = dom.window.document;
    const form = document.getElementById('contact-form');
    assert.equal(form.action, 'https://formsubmit.co/workwithharpreetsingh@gmail.com');
    assert.equal(form.method, 'post');
    assert.equal(form.noValidate, false);
    assert.equal(form.checkValidity(), false, 'empty messages cannot be submitted');
    for (const input of form.querySelectorAll('input:not([type="hidden"]),textarea')) assert.ok(input.labels.length, input.id);
    form.elements.name.value = 'Website test';
    form.elements.email.value = 'invalid';
    form.elements.message.value = 'A question about FPGA integration.';
    assert.equal(form.checkValidity(), false, 'invalid email must be rejected');
    form.elements.email.value = 'test@example.com';
    assert.equal(form.checkValidity(), true);
    assert.equal(new dom.window.FormData(form).get('message'), 'A question about FPGA integration.');
    assert.equal(form.querySelector('[name="_captcha"][value="false"]'), null, 'keep the provider spam check');
    assert.equal(form.querySelector('[name="_cc"],[name="_autoresponse"]'), null, 'no extra recipients or automatic visitor replies');
    assert.equal(document.querySelector('.contact-email').getAttribute('href'), 'mailto:workwithharpreetsingh@gmail.com');
    assert.equal(document.querySelector('.mobile-menu-btn').hidden, true);
    assert.equal(document.querySelectorAll('#primary-navigation a').length, 6);
  } finally {
    dom.window.close();
  }
});
