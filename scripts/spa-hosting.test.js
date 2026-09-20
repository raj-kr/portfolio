import assert from 'node:assert/strict';
import test from 'node:test';
import { withSpaFallback } from './configure-spa-hosting.js';

test('missing paths return the app document for both S3 error codes', () => {
  const config = withSpaFallback({ CustomErrorResponses: { Quantity: 0 } });
  assert.equal(config.DefaultRootObject, 'index.html');
  assert.equal(config.CustomErrorResponses.Quantity, 2);
  for (const code of [403, 404]) {
    assert.deepEqual(config.CustomErrorResponses.Items.find(item => item.ErrorCode === code), {
      ErrorCode: code, ResponsePagePath: '/index.html', ResponseCode: '200', ErrorCachingMinTTL: 0,
    });
  }
});

test('updates preserve unrelated hosting settings and error responses', () => {
  const serverError = { ErrorCode: 500, ErrorCachingMinTTL: 30 };
  const original = {
    CallerReference: 'keep-existing',
    Origins: { Quantity: 1, Items: [{ Id: 'private-s3', DomainName: 'example.s3.amazonaws.com' }] },
    DefaultCacheBehavior: { TargetOriginId: 'private-s3', ViewerProtocolPolicy: 'redirect-to-https' },
    ViewerCertificate: { ACMCertificateArn: 'existing-certificate' },
    CustomErrorResponses: {
      Quantity: 2,
      Items: [serverError, { ErrorCode: 403, ResponsePagePath: '/error.html', ResponseCode: '403' }],
    },
  };
  const snapshot = structuredClone(original);
  const updated = withSpaFallback(original);
  assert.deepEqual(original, snapshot);
  for (const key of ['CallerReference', 'Origins', 'DefaultCacheBehavior', 'ViewerCertificate']) {
    assert.deepEqual(updated[key], original[key]);
  }
  assert.deepEqual(updated.CustomErrorResponses.Items[0], serverError);
  assert.equal(updated.CustomErrorResponses.Quantity, 3);
  assert.equal(updated.CustomErrorResponses.Items.filter(item => item.ErrorCode === 403).length, 1);
});

test('repeated deployments do not change an already configured distribution', () => {
  const configured = withSpaFallback({});
  assert.deepEqual(withSpaFallback(configured), configured);
});
