const test = require('node:test');
const assert = require('node:assert/strict');
const { Readable } = require('node:stream');
const nodemailer = require('nodemailer');
const { simpleParser } = require('mailparser');
const { createHandler } = require('./index');

const event = { Records: [{ eventSource: 'aws:s3', s3: {
  bucket: { name: 'test-bucket' }, object: { key: 'emails/test+message%2Beml', versionId: 'version-1' },
} }] };
const logger = { log() {}, error() {} };
async function original(overrides = {}) {
  const { message } = await nodemailer.createTransport({ streamTransport: true, buffer: true }).sendMail({
    from: 'Original Sender <sender@example.com>', to: 'mail@raj.kr',
    replyTo: 'reply@example.com', subject: 'Original subject', text: 'Original message',
    html: '<p>Original message<img src="cid:logo"></p>',
    attachments: [
      { filename: 'document.pdf', contentType: 'application/pdf', content: Buffer.from('PDF test bytes') },
      { filename: 'logo.png', contentType: 'image/png', content: Buffer.from('image test bytes'), cid: 'logo' },
    ],
    ...overrides,
  });
  return message;
}

test('forwards real MIME attachments and inline images, retaining original Reply-To', async () => {
  const raw = await original(), reads = [], sends = [], logs = [];
  const handler = createHandler({
    env: { FROM_EMAIL: 'mail@raj.kr', TO_EMAIL: 'owner@example.com' },
    storage: { send: async command => { reads.push(command.input); return { Body: Readable.from([raw]) }; } },
    sender: { send: async command => { sends.push(command.input); return { MessageId: 'mock' }; } },
    logger: { log: (...args) => logs.push(args), error: (...args) => logs.push(args) },
  });
  await handler(event);
  assert.deepEqual(reads[0], { Bucket: 'test-bucket', Key: 'emails/test message+eml', VersionId: 'version-1' });
  assert.equal(sends[0].Source, 'mail@raj.kr');
  assert.deepEqual(sends[0].Destinations, ['owner@example.com']);
  const forwarded = await simpleParser(sends[0].RawMessage.Data, { skipImageLinks: true });
  assert.equal(forwarded.replyTo.value[0].address, 'reply@example.com');
  assert.equal(forwarded.subject, '[FWD: Original subject]');
  assert.equal(forwarded.attachments.length, 2);
  assert.equal(forwarded.attachments.find(a => a.filename === 'document.pdf').content.toString(), 'PDF test bytes');
  assert.equal(forwarded.attachments.find(a => a.filename === 'logo.png').contentId, '<logo>');
  assert.ok(forwarded.html.includes('cid:logo'));
  assert.ok(!JSON.stringify(logs).includes('sender@example.com'));
  assert.ok(!JSON.stringify(logs).includes('Original message'));
});

test('uses original From when the received email has no Reply-To', async () => {
  const raw = await original({ replyTo: undefined, attachments: [] });
  let forwarded;
  const handler = createHandler({ logger,
    storage: { send: async () => ({ Body: raw }) },
    sender: { send: async command => { forwarded = await simpleParser(command.input.RawMessage.Data); return {}; } },
  });
  await handler(event);
  assert.equal(forwarded.replyTo.value[0].address, 'sender@example.com');
});

test('rejects on S3 failures so Lambda can retry', async () => {
  const handler = createHandler({ logger,
    storage: { send: async () => { throw new Error('S3 unavailable'); } },
    sender: { send: async () => assert.fail('Must not send') },
  });
  await assert.rejects(handler(event), /Email forwarding failed/);
});

test('rejects SES failures and a subsequent invocation can retry successfully', async () => {
  const raw = await original({ attachments: [] });
  let attempts = 0;
  const handler = createHandler({ logger,
    storage: { send: async () => ({ Body: raw }) },
    sender: { send: async () => { if (++attempts === 1) throw new Error('SES unavailable'); return {}; } },
  });
  await assert.rejects(handler(event), /Email forwarding failed/);
  assert.deepEqual(await handler(event), { success: true });
  assert.equal(attempts, 2);
});

test('oversized MIME messages fail explicitly instead of silently dropping attachments', async () => {
  const raw = await original({ attachments: [{ filename: 'large.bin', content: Buffer.alloc(8 * 1024 * 1024) }] });
  const handler = createHandler({ logger,
    storage: { send: async () => ({ Body: raw }) },
    sender: { send: async () => assert.fail('Oversized messages must not be sent') },
  });
  await assert.rejects(handler(event), /Email forwarding failed/);
});
