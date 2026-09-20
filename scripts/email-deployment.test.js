import assert from 'node:assert/strict';
import test from 'node:test';
import { emailEnvironment } from '../lambda/configure-function.mjs';

test('Workspace deployment replaces the old recipient while preserving unrelated settings', () => {
  const previous = {
    FROM_EMAIL: 'mail@raj.kr', TO_EMAIL: 'rkgt76@gmail.com',
    REPLY_TO_EMAIL: 'mail@raj.kr', OTHER_SETTING: 'keep',
  };
  // All contact deployment scripts supply this destination, even for existing functions.
  const { Variables: env } = emailEnvironment(previous, '', 'mail@raj.kr');
  assert.equal(env.TO_EMAIL, 'mail@raj.kr');
  assert.equal(env.OTHER_SETTING, 'keep');
  assert.equal(env.REPLY_TO_EMAIL, undefined);
  assert.equal(previous.TO_EMAIL, 'rkgt76@gmail.com');
});

test('email configuration preserves unrelated settings and removes reserved/legacy overrides', () => {
  const original = { AWS_REGION: 'ap-south-1', REPLY_TO_EMAIL: 'mail@raj.kr', OTHER_SETTING: 'keep', FROM_EMAIL: 'custom@raj.kr' };
  assert.deepEqual(emailEnvironment(original), { Variables: {
    OTHER_SETTING: 'keep', FROM_EMAIL: 'custom@raj.kr', TO_EMAIL: 'rkgt76@gmail.com',
  } });
  assert.equal(original.REPLY_TO_EMAIL, 'mail@raj.kr');
  assert.equal(emailEnvironment(original, 'new@raj.kr', 'owner@example.com').Variables.FROM_EMAIL, 'new@raj.kr');
});
