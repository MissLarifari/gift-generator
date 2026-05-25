#!/usr/bin/env node
// Deploy script — pushes to git and pings the sophey.vodka deploy webhook.
// Token is read from .env (gitignored). Never commit the real token.

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

function loadToken() {
  if (process.env.DEPLOY_TOKEN) return process.env.DEPLOY_TOKEN;
  if (!existsSync('.env')) return null;
  const content = readFileSync('.env', 'utf-8');
  const match = content.match(/^\s*DEPLOY_TOKEN\s*=\s*(.+?)\s*$/m);
  return match ? match[1].replace(/^["']|["']$/g, '') : null;
}

const token = loadToken();
if (!token || token === 'your_deploy_token_here') {
  console.error('\n❌ DEPLOY_TOKEN missing.');
  console.error('   1. Copy .env.example to .env');
  console.error('   2. Put your real token in .env');
  console.error('   3. Re-run `npm run deploy`\n');
  process.exit(1);
}

function run(cmd, label) {
  console.log(`\n▶ ${label}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.error(`\n❌ ${label} failed.`);
    process.exit(1);
  }
}

run('git push', 'Pushing to GitHub…');

const apiUrl = 'https://sophey.vodka/api/deploy/gift-generator';
console.log(`\n▶ Triggering deploy at ${apiUrl}`);
try {
  const out = execSync(
    `curl -sS -X POST ${apiUrl} -H "Authorization: Bearer ${token}"`,
    { encoding: 'utf-8' }
  );
  if (out.trim()) console.log(out);
  console.log('\n✅ Deploy triggered. Check https://sophey.vodka/gift-generator/ in a moment.\n');
} catch (err) {
  console.error('\n❌ Deploy webhook failed:', err.message, '\n');
  process.exit(1);
}
