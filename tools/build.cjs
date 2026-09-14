const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
if (path.dirname(path.resolve(output)) !== root || path.basename(output) !== 'dist') throw new Error('Unsafe build target');
// Regenerate this exact build directory only; no caller-supplied deletion paths.
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(path.join(output, 'assets'), { recursive: true });
const files = ['index.html', 'thanks.html', 'style.css', 'neural_tech.css', 'script.js', 'neural_sync.js',
  'assets/favicon.svg', 'assets/brain_anatomy.png', 'assets/neural_interface.jpg', 'assets/gurjit.jpg', 'assets/harpreet.jpg'];
for (const name of files) fs.copyFileSync(path.join(root, name), path.join(output, name));
console.log(`Built ${files.length} public files in ${output}`);
