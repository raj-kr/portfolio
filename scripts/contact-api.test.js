import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function loadModule(file, context) {
  const source = fs.readFileSync(new URL(file, import.meta.url), 'utf8').replaceAll('import.meta.env', 'testEnv');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  const scope = { exports: {}, console: { error() {} }, AbortSignal, ...context };
  vm.runInNewContext(outputText, scope);
  return scope.exports;
}

function setup(testEnv = { MODE: 'production' }, reply = { success: true }) {
  const requests = [];
  const config = loadModule('../src/config/api.ts', { testEnv });
  const api = loadModule('../src/utils/contactApi.ts', {
    testEnv,
    require: id => { assert.equal(id, '@/config/api'); return config; },
    fetch: async (url, options) => {
      requests.push({ url, options });
      return { ok: true, json: async () => reply };
    },
  });
  return { requests, api, config };
}
const form = { name: 'Visitor', email: 'visitor@example.com', message: 'Hello' };

test('local development cannot accidentally send through the production API', async () => {
  const { api, requests } = setup({ MODE: 'development' });
  assert.equal((await api.sendContactMessage(form)).success, false);
  assert.equal(await api.testApiConnection(), false);
  assert.equal(requests.length, 0);
});

test('development can explicitly opt into a test API', async () => {
  const { api, requests } = setup({ MODE: 'development', VITE_CONTACT_API_BASE_URL: 'https://test.example/stage/' });
  assert.equal((await api.sendContactMessage(form)).success, true);
  assert.equal(requests[0].url, 'https://test.example/stage/contact');
  assert.equal(requests[0].options.method, 'POST');
});

test('connectivity checks use OPTIONS without any form body', async () => {
  const { api, requests } = setup();
  assert.equal(await api.testApiConnection(), true);
  assert.equal(requests[0].options.method, 'OPTIONS');
  assert.equal(requests[0].options.body, undefined);
});

test('HTTP 200 without explicit success cannot clear the visitor message as sent', async () => {
  for (const reply of [{ success: false }, {}, null]) {
    assert.equal((await setup(undefined, reply).api.sendContactMessage(form)).success, false);
  }
});

test('production keeps the deployed endpoint and sends form data only on explicit submission', async () => {
  const { api, config, requests } = setup();
  assert.equal(config.getCurrentApiConfig().baseUrl, 'https://kxoak0t3ik.execute-api.ap-south-1.amazonaws.com/prod');
  assert.equal((await api.sendContactMessage({ ...form, website: '' })).success, true);
  assert.deepEqual(JSON.parse(requests[0].options.body), { ...form, website: '' });
});
