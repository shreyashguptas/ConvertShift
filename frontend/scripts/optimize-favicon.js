const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function optimizeFavicon() {
  const inputPath = path.join(__dirname, '../public/images/Favicon.jpg');
  const outputDir = path.join(__dirname, '../public/images');

  try {
    // Create output directory if it doesn't exist
    await fs.mkdir(outputDir, { recursive: true });

    // Read the source image
    const sourceBuffer = await fs.readFile(inputPath);

    // Generate ICO file (32x32)
    await sharp(sourceBuffer)
      .resize(32, 32)
      .toFormat('png')
      .toFile(path.join(outputDir, 'favicon.ico'));

    // Generate 16x16 PNG
    await sharp(sourceBuffer)
      .resize(16, 16)
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(path.join(outputDir, 'favicon-16x16.png'));

    // Generate 32x32 PNG
    await sharp(sourceBuffer)
      .resize(32, 32)
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(path.join(outputDir, 'favicon-32x32.png'));

    // Generate Apple Touch Icon (180x180)
    await sharp(sourceBuffer)
      .resize(180, 180)
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));

    console.log('Favicon optimization complete!');
  } catch (error) {
    console.error('Error optimizing favicon:', error);
  }
}

// Create web manifest
async function createWebManifest() {
  const manifest = {
    name: 'File Converter',
    short_name: 'FileConv',
    icons: [
      {
        src: '/images/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png'
      },
      {
        src: '/images/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png'
      },
      {
        src: '/images/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png'
      }
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone'
  };

  await fs.writeFile(
    path.join(__dirname, '../public/site.webmanifest'),
    JSON.stringify(manifest, null, 2)
  );
}

// Run both functions
async function main() {
  await optimizeFavicon();
  await createWebManifest();
}

main(); 