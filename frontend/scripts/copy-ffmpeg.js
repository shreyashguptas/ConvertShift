const fs = require('fs');
const path = require('path');

// Source paths
const ffmpegCorePath = path.join(__dirname, '../node_modules/@ffmpeg/core/dist/ffmpeg-core.js');
const ffmpegCoreWasmPath = path.join(__dirname, '../node_modules/@ffmpeg/core/dist/ffmpeg-core.wasm');

// Destination paths
const publicDir = path.join(__dirname, '../public');
const destCorePath = path.join(publicDir, 'ffmpeg-core.js');
const destCoreWasmPath = path.join(publicDir, 'ffmpeg-core.wasm');

// Copy files
fs.copyFileSync(ffmpegCorePath, destCorePath);
fs.copyFileSync(ffmpegCoreWasmPath, destCoreWasmPath);

console.log('FFmpeg core files copied successfully!'); 