import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Preserve the full distribution configuration: AWS replaces it on update.
export function withSpaFallback(config) {
  const updated = structuredClone(config);
  const otherErrors = (updated.CustomErrorResponses?.Items || [])
    .filter(({ ErrorCode }) => ErrorCode !== 403 && ErrorCode !== 404);
  const items = [
    ...otherErrors,
    ...[403, 404].map(ErrorCode => ({
      ErrorCode,
      ResponsePagePath: '/index.html',
      ResponseCode: '200',
      ErrorCachingMinTTL: 0,
    })),
  ];
  updated.DefaultRootObject = 'index.html';
  updated.CustomErrorResponses = { Quantity: items.length, Items: items };
  return updated;
}

function aws(args) {
  return execFileSync('aws', [...args, '--no-cli-pager', '--output', 'json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  });
}

function main() {
  const id = process.env.DISTRIBUTION_ID;
  if (!id) throw new Error('DISTRIBUTION_ID must be set.');

  const { ETag, DistributionConfig } = JSON.parse(aws([
    'cloudfront', 'get-distribution-config', '--id', id,
  ]));
  if (!ETag || !DistributionConfig) throw new Error('Incomplete CloudFront configuration.');
  const updated = withSpaFallback(DistributionConfig);

  if (JSON.stringify(updated) !== JSON.stringify(DistributionConfig)) {
    const directory = mkdtempSync(path.join(tmpdir(), 'raj-spa-hosting-'));
    try {
      const file = path.join(directory, 'distribution.json');
      writeFileSync(file, JSON.stringify(updated), { mode: 0o600 });
      aws([
        'cloudfront', 'update-distribution', '--id', id,
        '--if-match', ETag, '--distribution-config', `file://${file}`,
      ]);
      console.log('Configured CloudFront 403/404 fallback to /index.html.');
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  } else {
    console.log('CloudFront already has the SPA fallback.');
  }

  console.log('Waiting for CloudFront configuration to finish deploying...');
  aws(['cloudfront', 'wait', 'distribution-deployed', '--id', id]);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    main();
  } catch (error) {
    console.error('Could not configure SPA hosting:', error.message);
    process.exitCode = 1;
  }
}
