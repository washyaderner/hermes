#!/usr/bin/env node

/**
 * Build script for Hermes Browser Extension
 * Packages extension for Chrome and Firefox
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const archiver = require('archiver');

const EXTENSION_DIR = path.join(__dirname, '..', 'extension');
const DIST_DIR = path.join(__dirname, '..', 'dist-extension');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Create dist directory
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

log('🚀 Building Hermes Browser Extension...', 'blue');

// Copy extension files to dist
log('📦 Copying extension files...', 'yellow');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    log(`⚠️  Source not found: ${src}`, 'yellow');
    return;
  }

  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(src);
    files.forEach(file => {
      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

copyRecursive(EXTENSION_DIR, DIST_DIR);

log('✓ Files copied to dist-extension/', 'green');

// Create Chrome package
log('📦 Creating Chrome package...', 'yellow');

const chromeOutput = fs.createWriteStream(path.join(DIST_DIR, '..', 'hermes-chrome.zip'));
const chromeArchive = archiver('zip', { zlib: { level: 9 } });

chromeArchive.pipe(chromeOutput);
chromeArchive.directory(DIST_DIR, false);
chromeArchive.finalize();

chromeOutput.on('close', () => {
  log(`✓ Chrome package created: hermes-chrome.zip (${chromeArchive.pointer()} bytes)`, 'green');
});

// Create Firefox package (uses same manifest v3)
log('📦 Creating Firefox package...', 'yellow');

const firefoxOutput = fs.createWriteStream(path.join(DIST_DIR, '..', 'hermes-firefox.zip'));
const firefoxArchive = archiver('zip', { zlib: { level: 9 } });

firefoxArchive.pipe(firefoxOutput);
firefoxArchive.directory(DIST_DIR, false);
firefoxArchive.finalize();

firefoxOutput.on('close', () => {
  log(`✓ Firefox package created: hermes-firefox.zip (${firefoxArchive.pointer()} bytes)`, 'green');
});

// Wait for both archives to complete
Promise.all([
  new Promise(resolve => chromeOutput.on('close', resolve)),
  new Promise(resolve => firefoxOutput.on('close', resolve)),
]).then(() => {
  log('\n✅ Extension build complete!', 'green');
  log('\n📦 Packages created:', 'blue');
  log('  - hermes-chrome.zip (for Chrome/Edge)', 'reset');
  log('  - hermes-firefox.zip (for Firefox)', 'reset');
  log('\n📖 To install:', 'blue');
  log('  Chrome: chrome://extensions > Load unpacked > dist-extension/', 'reset');
  log('  Firefox: about:debugging > This Firefox > Load Temporary Add-on', 'reset');
});
