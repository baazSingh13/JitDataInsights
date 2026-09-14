const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const flush = () => new Promise(resolve => setImmediate(resolve));

function setup(t, options = {}) {
  // No resource loader: tests cannot load the SDK or reach the real Firebase project.
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
  const calls = [];
  if (!options.noSDK) {
    const firestore = () => ({ collection: name => ({ add: values => {
      calls.push({ name, values });
      return options.write ? options.write(values) : Promise.resolve({ id: 'mock-only' });
    } }) });
    firestore.FieldValue = { serverTimestamp: () => 'SERVER_TIMESTAMP' };
    window.firebase = { apps: [], initializeApp: () => window.firebase.apps.push({}), firestore };
  }
  if (options.offline) Object.defineProperty(window.navigator, 'onLine', { value: false });
  const delays = new Map();
  if (options.captureTimers) {
    window.setTimeout = (fn, delay) => { delays.set(delay, fn); return delay; };
    window.clearTimeout = delay => delays.delete(delay);
  }
  window.eval(script);
  const document = window.document;
  const get = id => document.getElementById(id);
  function fill(name = ' Test User ', email = 'test@example.com', message = ' Please discuss FPGA integration. ') {
    get('contact-name').value = name;
    get('contact-email').value = email;
    get('contact-message').value = message;
  }
  function submit() {
    const event = new window.Event('submit', { bubbles: true, cancelable: true });
    get('contact-form').dispatchEvent(event);
    return event;
  }
  return { window, document, get, calls, fill, submit, media, delays };
}

test('all local links/assets resolve and controls have labels', t => {
  const { document } = setup(t);
  const ids = [...document.querySelectorAll('[id]')].map(element => element.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate IDs');
  assert.equal(document.querySelectorAll('h1').length, 1);
  for (const anchor of document.querySelectorAll('a[href^="#"]')) assert.ok(document.getElementById(anchor.hash.slice(1)), anchor.href);
  for (const element of document.querySelectorAll('[src],link[href]')) {
    const target = element.getAttribute('src') || element.getAttribute('href');
    if (!target.startsWith('https:')) assert.ok(fs.existsSync(path.join(root, target)), target);
  }
  for (const input of document.querySelectorAll('input,textarea')) assert.ok(input.labels.length > 0, input.id);
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

test('without IntersectionObserver, content stays visible and the contact form initializes', t => {
  const { document, get } = setup(t, { reducedMotion: false });
  assert.equal(document.querySelectorAll('.reveal-pending').length, 0);
  assert.equal(get('contact-fields').disabled, false);
});

test('no-JavaScript markup disables submission and retains every navigation destination', () => {
  const dom = new JSDOM(html);
  assert.equal(dom.window.document.getElementById('contact-fields').disabled, true);
  assert.equal(dom.window.document.querySelector('.mobile-menu-btn').hidden, true);
  assert.equal(dom.window.document.querySelectorAll('#primary-navigation a').length, 6);
  assert.ok(dom.window.document.querySelector('noscript').textContent.includes('JavaScript'));
  dom.window.close();
});

test('successful contact submission trims values, preserves the server schema and resets after acknowledgement', async t => {
  const { fill, submit, get, calls } = setup(t);
  fill();
  assert.ok(submit().defaultPrevented);
  assert.equal(get('contact-fields').disabled, true);
  await flush();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].name, 'contacts');
  assert.deepEqual(JSON.parse(JSON.stringify(calls[0].values)), {
    name: 'Test User', email: 'test@example.com', message: 'Please discuss FPGA integration.', timestamp: 'SERVER_TIMESTAMP'
  });
  assert.equal(get('contact-name').value, '');
  assert.equal(get('form-status').dataset.state, 'success');
  assert.equal(get('contact-fields').disabled, false);
});

test('whitespace, short messages and invalid email addresses never write', async t => {
  const { fill, submit, calls } = setup(t);
  for (const values of [[' ', 'test@example.com', 'Valid message here'], ['Name', 'invalid', 'Valid message here'], ['Name', 'test@example.com', '     short     ']]) {
    fill(...values); submit(); await flush();
  }
  assert.equal(calls.length, 0);
});

test('overlong input is rejected even when assigned programmatically', async t => {
  const { fill, submit, calls } = setup(t);
  fill('Name', 'test@example.com', 'x'.repeat(5001)); submit(); await flush();
  assert.equal(calls.length, 0);
});

test('offline submission preserves text and does not enqueue a write', async t => {
  const { fill, submit, get, calls } = setup(t, { offline: true });
  fill(); submit(); await flush();
  assert.equal(calls.length, 0);
  assert.match(get('form-status').textContent, /offline/);
  assert.ok(get('contact-message').value.length > 0);
});

test('write failure preserves input, permits retry and does not expose backend error details', async t => {
  const { fill, submit, get, calls } = setup(t, { write: () => Promise.reject(new Error('private backend detail')) });
  fill(); submit(); await flush();
  assert.equal(calls.length, 1);
  assert.equal(get('form-status').dataset.state, 'error');
  assert.ok(!get('form-status').textContent.includes('private backend detail'));
  assert.ok(get('contact-name').value.includes('Test User'));
  assert.equal(get('contact-fields').disabled, false);
});

test('pending acknowledgement prevents duplicate submissions, including after the slow-network notice', async t => {
  let acknowledge;
  const { fill, submit, get, calls, delays } = setup(t, { captureTimers: true, write: () => new Promise(resolve => { acknowledge = resolve; }) });
  fill(); submit(); submit();
  delays.get(15000)();
  assert.match(get('form-status').textContent, /waiting for confirmation/);
  assert.equal(get('contact-fields').disabled, true);
  submit();
  assert.equal(calls.length, 1);
  acknowledge(); await flush();
  assert.equal(get('form-status').dataset.state, 'success');
  assert.equal(get('contact-fields').disabled, false);
});

test('failed SDK load is visible, leaves the form disabled and prevents native form navigation', async t => {
  const { document, window, get, submit, calls } = setup(t, { noSDK: true });
  const sdkScript = document.querySelector('script[src^="https://www.gstatic.com/firebasejs/"]');
  assert.ok(sdkScript);
  sdkScript.dispatchEvent(new window.Event('error'));
  await flush();
  assert.equal(get('contact-fields').disabled, true);
  assert.match(get('form-status').textContent, /could not load/);
  assert.ok(submit().defaultPrevented);
  assert.equal(calls.length, 0);
});
