import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

// Exercise the real TypeScript utility with isolated browser/config globals.
const source = readFileSync(new URL('../src/utils/analytics.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});

function loadAnalytics(browserWindow, enabled = true) {
  const context = {
    exports: {},
    require(id) {
      assert.equal(id, '@/config/analytics');
      return { GA_ID: 'G-TEST123456', isGAEnabled: enabled };
    },
  };
  if (browserWindow !== undefined) context.window = browserWindow;
  vm.runInNewContext(outputText, context);
  return context.exports;
}

function trackAll(analytics) {
  analytics.trackPageView('/');
  analytics.trackEvent('test', 'test');
  analytics.trackButtonClick('Get in touch', 'maintenance');
  analytics.trackFormSubmission('contact_form');
  analytics.trackExternalLink('https://example.com');
  analytics.trackScrollDepth(25);
  analytics.trackTimeOnPage(30);
}

test('tracking before initialization or with an unavailable tag does not throw', () => {
  for (const gtag of [undefined, null, false, {}, 'blocked']) {
    assert.doesNotThrow(() => trackAll(loadAnalytics({ gtag })));
  }
});

test('tracking without a browser does not throw', () => {
  assert.doesNotThrow(() => trackAll(loadAnalytics(undefined)));
});

test('disabled analytics never calls the tag', () => {
  trackAll(loadAnalytics({ gtag() { assert.fail('Analytics is disabled'); } }, false));
});

test('tracking resumes when the tag becomes available after an early page view', () => {
  const browserWindow = {};
  const analytics = loadAnalytics(browserWindow);
  analytics.trackPageView('/');
  const calls = [];
  browserWindow.gtag = (...args) => calls.push(args);
  trackAll(analytics);
  assert.equal(calls.length, 7);
  // Normalize objects created in the VM before comparing their values.
  const actual = JSON.parse(JSON.stringify(calls));
  assert.deepEqual(actual[0], ['config', 'G-TEST123456', { page_path: '/' }]);
  assert.deepEqual(actual[2], ['event', 'click', {
    event_category: 'button', event_label: 'Get in touch - maintenance',
  }]);
  assert.deepEqual(actual[3], ['event', 'submit', {
    event_category: 'form', event_label: 'contact_form',
  }]);
  assert.deepEqual(actual[6], ['event', 'timing_complete', {
    event_category: 'engagement', event_label: 'time_on_page', value: 30,
  }]);
});

test('tracking stays safe if the tag is removed after initialization', () => {
  const browserWindow = { gtag() {} };
  const analytics = loadAnalytics(browserWindow);
  trackAll(analytics);
  delete browserWindow.gtag;
  assert.doesNotThrow(() => trackAll(analytics));
});
