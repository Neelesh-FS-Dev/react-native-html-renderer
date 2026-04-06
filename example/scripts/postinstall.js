'use strict';

const { existsSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

if (process.platform !== 'darwin') {
  console.log('Skipping CocoaPods install: non-macOS environment.');
  process.exit(0);
}

const iosDir = path.join(__dirname, '..', 'ios');

if (!existsSync(iosDir)) {
  console.log('Skipping CocoaPods install: iOS directory not found.');
  process.exit(0);
}

const result = spawnSync('pod', ['install'], {
  cwd: iosDir,
  stdio: 'inherit',
});

if (result.error) {
  console.error(`Failed to run CocoaPods install: ${result.error.message}`);
  process.exit(typeof result.status === 'number' ? result.status : 1);
}

process.exit(result.status ?? 0);
