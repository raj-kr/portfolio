import { execFileSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';

const file = process.argv[2];
if (!['contact-form-lambda.zip', 'email-processor.zip'].includes(file) || !existsSync('index.js') || !existsSync('node_modules')) {
  throw new Error('Run from the Lambda directory with its expected ZIP filename after npm ci.');
}
// Recreate the archive so removed dependencies are not retained from an old ZIP.
if (existsSync(file)) rmSync(file);
if (process.platform === 'win32') {
  execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
    `$ErrorActionPreference = 'Stop'; Compress-Archive -LiteralPath 'index.js', 'node_modules' -DestinationPath '${file}' -Force`],
  { stdio: 'inherit', windowsHide: true });
} else {
  execFileSync('zip', ['-qr', file, 'index.js', 'node_modules/'], { stdio: 'inherit' });
}
console.log('Created ' + file);
