const test = require('node:test');
const assert = require('node:assert/strict');
const { createHandler } = require('./index');

const valid = { name: 'Visitor', email: 'visitor@example.com', message: 'Hello from a visitor' };
function setup(env = {}) {
  const sent = [], logs = [];
  const handler = createHandler({
    env,
    client: { send: async command => { sent.push(command.input); return { MessageId: 'mock-id' }; } },
    logger: { log: (...args) => logs.push(args), error: (...args) => logs.push(args) },
  });
  return { handler, sent, logs };
}
const event = body => ({ httpMethod: 'POST', body: JSON.stringify(body) });

test('sends from the configured identity and replies to the visitor despite a legacy override', async () => {
  const { handler, sent, logs } = setup({ FROM_EMAIL: 'mail@raj.kr', TO_EMAIL: 'owner@example.com', REPLY_TO_EMAIL: 'mail@raj.kr' });
  assert.equal((await handler(event(valid))).statusCode, 200);
  assert.equal(sent[0].Source, 'mail@raj.kr');
  assert.deepEqual(sent[0].Destination.ToAddresses, ['owner@example.com']);
  assert.deepEqual(sent[0].ReplyToAddresses, [valid.email]);
  assert.ok(!JSON.stringify(logs).includes(valid.email));
  assert.ok(!JSON.stringify(logs).includes(valid.message));
});

test('rejects invalid JSON and non-object bodies without sending', async () => {
  for (const body of ['{', 'null', '[]', '"text"', '42']) {
    const { handler, sent } = setup();
    assert.equal((await handler({ httpMethod: 'POST', body })).statusCode, 400);
    assert.equal(sent.length, 0);
  }
});

test('rejects blank, wrongly typed, excessive and invalid field values', async () => {
  const cases = [
    { name: ' ' }, { name: 123 }, { name: null }, { message: {} }, { message: '\n ' },
    { name: 'a'.repeat(101) }, { message: 'a'.repeat(5001) }, { email: 'a'.repeat(255) },
    { email: 'invalid' }, { email: 'a"onclick=x@example.com' }, { name: 'Header\r\nInjection' },
  ];
  for (const fields of cases) {
    const { handler, sent } = setup();
    assert.equal((await handler(event({ ...valid, ...fields }))).statusCode, 400, JSON.stringify(fields));
    assert.equal(sent.length, 0);
  }
});

test('trims fields, preserves plain text, and escapes HTML instead of removing characters', async () => {
  const { handler, sent } = setup();
  await handler(event({ ...valid, name: '  A & B  ', message: '<script>alert("x")</script>\nNext line' }));
  assert.equal(sent[0].Message.Subject.Data, 'Email from A & B');
  assert.ok(sent[0].Message.Body.Text.Data.includes('<script>'));
  assert.ok(!sent[0].Message.Body.Html.Data.includes('<script>'));
  assert.ok(sent[0].Message.Body.Html.Data.includes('A &amp; B'));
  assert.ok(sent[0].Message.Body.Html.Data.includes('<br>Next line'));
});

test('preflight and honeypot submissions never send an email', async () => {
  const { handler, sent } = setup();
  assert.equal((await handler({ httpMethod: 'OPTIONS' })).statusCode, 200);
  assert.equal((await handler(event({ ...valid, website: 'https://spam.example' }))).statusCode, 200);
  assert.equal((await handler({ httpMethod: 'GET' })).statusCode, 405);
  assert.equal(sent.length, 0);
});

test('accepts base64 API Gateway bodies and enforces the request size limit', async () => {
  const { handler, sent } = setup();
  assert.equal((await handler({ httpMethod: 'POST', isBase64Encoded: true, body: Buffer.from(JSON.stringify(valid)).toString('base64') })).statusCode, 200);
  assert.equal((await handler({ httpMethod: 'POST', body: 'x'.repeat(45001) })).statusCode, 413);
  assert.equal(sent.length, 1);
});

test('SES failures return failure without exposing provider details or message contents', async () => {
  const logs = [];
  const handler = createHandler({
    client: { send: async () => { throw new Error('Rejected private@example.com'); } },
    logger: { log() {}, error: (...args) => logs.push(args) },
  });
  const result = await handler(event(valid));
  assert.equal(result.statusCode, 502);
  assert.equal(JSON.parse(result.body).success, false);
  assert.ok(!JSON.stringify([result, logs]).includes('private@example.com'));
});
