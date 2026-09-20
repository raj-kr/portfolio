import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function emailEnvironment(existing = {}, from, to) {
  const variables = { ...existing };
  delete variables.AWS_REGION; // Lambda supplies this reserved variable.
  delete variables.REPLY_TO_EMAIL; // Contact replies must go to the visitor.
  variables.FROM_EMAIL = from || variables.FROM_EMAIL || 'mail@raj.kr';
  variables.TO_EMAIL = to || variables.TO_EMAIL || 'rkgt76@gmail.com';
  return { Variables: variables };
}

function main() {
  const [name, region, ...options] = process.argv.slice(2);
  if (!name || !region || options.some(option => !/^--(from|to)=/.test(option))) {
    throw new Error('Usage: node configure-function.mjs FUNCTION REGION [--from=EMAIL] [--to=EMAIL]');
  }
  const from = options.find(option => option.startsWith('--from='))?.slice(7);
  const to = options.find(option => option.startsWith('--to='))?.slice(5);
  const aws = args => execFileSync('aws', [...args, '--region', region, '--no-cli-pager'], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'],
  });
  // Code updates and creation complete asynchronously. Wait before changing configuration.
  aws(['lambda', 'wait', 'function-active-v2', '--function-name', name]);
  aws(['lambda', 'wait', 'function-updated-v2', '--function-name', name]);
  const existing = JSON.parse(aws([
    'lambda', 'get-function-configuration', '--function-name', name,
    '--query', 'Environment.Variables', '--output', 'json',
  ])) || {};
  const tempRoot = path.resolve(tmpdir());
  const directory = mkdtempSync(path.join(tempRoot, 'raj-email-config-'));
  try {
    const file = path.join(directory, 'environment.json');
    writeFileSync(file, JSON.stringify(emailEnvironment(existing, from, to)), { mode: 0o600 });
    aws(['lambda', 'update-function-configuration', '--function-name', name,
      '--runtime', 'nodejs22.x', '--environment', `file://${file}`]);
    aws(['lambda', 'wait', 'function-updated-v2', '--function-name', name]);
    console.log('Email function runtime and configuration updated.');
  } finally {
    // Delete only the unique temporary directory created above.
    if (path.dirname(path.resolve(directory)) !== tempRoot || !path.basename(directory).startsWith('raj-email-config-')) {
      throw new Error('Unexpected temporary directory');
    }
    rmSync(directory, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { main(); } catch (error) {
    console.error('Email configuration failed:', error.message);
    process.exitCode = 1;
  }
}
