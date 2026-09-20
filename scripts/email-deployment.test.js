import assert from 'node:assert/strict';
import test from 'node:test';
import { emailEnvironment } from '../lambda/configure-function.mjs';

test('email configuration preserves unrelated settings and removes reserved/legacy overrides', () => {
  const original = { AWS_REGION: 'ap-south-1', REPLY_TO_EMAIL: 'mail@raj.kr', OTHER_SETTING: 'keep', FROM_EMAIL: 'custom@raj.kr' };
  assert.deepEqual(emailEnvironment(original), { Variables: {
    OTHER_SETTING: 'keep', FROM_EMAIL: 'custom@raj.kr', TO_EMAIL: 'rkgt76@gmail.com',
  } });
  assert.equal(original.REPLY_TO_EMAIL, 'mail@raj.kr');
  assert.equal(emailEnvironment(original, 'new@raj.kr', 'owner@example.com').Variables.FROM_EMAIL, 'new@raj.kr');
});
