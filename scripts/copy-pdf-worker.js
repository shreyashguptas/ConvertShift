/*
 Copies the pdf.js worker file from node_modules to public so it can be served
 locally. This avoids CDN failures and works well with Next.js in the browser.
*/
const fs = require('fs');
const path = require('path');

const candidates = [
  'node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
  'node_modules/pdfjs-dist/build/pdf.worker.mjs',
  'node_modules/pdfjs-dist/build/pdf.worker.min.js',
  'node_modules/pdfjs-dist/build/pdf.worker.js',
];

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

let found = null;
for (const rel of candidates) {
  const abs = path.resolve(process.cwd(), rel);
  if (fs.existsSync(abs)) {
    found = abs;
    break;
  }
}

if (!found) {
  console.warn('[copy-pdf-worker] No pdf.worker file found in node_modules/pdfjs-dist/build.');
  process.exit(0);
}

const ext = path.extname(found);
const outName = ext === '.mjs' ? 'pdf.worker.min.mjs' : 'pdf.worker.min.js';
const outPath = path.join(publicDir, outName);

fs.copyFileSync(found, outPath);
console.log(`[copy-pdf-worker] Copied ${found} -> ${outPath}`);


