const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure build directory exists
const buildDir = path.join(__dirname, 'dist');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Files to copy
const filesToCopy = [
  'manifest.json',
  'popup.html',
  'styles.css',
  'icon48.png',
  'icon128.png'
];

// Copy files to dist directory
filesToCopy.forEach(file => {
  const source = path.join(__dirname, file);
  const dest = path.join(buildDir, file);
  
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, dest);
    console.log(`Copied ${file} to dist/`);
  } else {
    console.warn(`Warning: ${file} not found, skipping...`);
  }
});

// Create a simple HTML file that loads all JS files in the correct order
const jsFiles = [
  'shared-constants.js',
  'error-handler.js',
  'message-bus.js',
  'parsing-utils.js',
  'progressive-loader.js',
  'content.js',
  'background.js',
  'popup.js'
];

// Create a bundled version of popup.js
const popupContent = jsFiles
  .filter(file => file !== 'popup.js') // We'll process popup.js separately
  .map(file => `// ${file}\n${fs.readFileSync(path.join(__dirname, file), 'utf8')}\n`)
  .join('\n') + 
  '\n// popup.js\n' + 
  fs.readFileSync(path.join(__dirname, 'popup.js'), 'utf8');

// Write the bundled popup.js
fs.writeFileSync(path.join(buildDir, 'popup.js'), popupContent);
console.log('Created bundled popup.js');

// Update manifest.json to use the correct paths
const manifest = JSON.parse(fs.readFileSync(path.join(buildDir, 'manifest.json'), 'utf8'));
manifest.content_scripts[0].js = ['content.js'];
manifest.background.service_worker = 'background.js';
manifest.action.default_popup = 'popup.html';

fs.writeFileSync(
  path.join(buildDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log('Build complete!');
console.log(`Extension files are in: ${buildDir}`);
