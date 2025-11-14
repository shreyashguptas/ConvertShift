const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Icon sizes for PWA and favicons
const ICON_SIZES = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 72, name: 'icons/icon-72x72.png' },
  { size: 96, name: 'icons/icon-96x96.png' },
  { size: 128, name: 'icons/icon-128x128.png' },
  { size: 144, name: 'icons/icon-144x144.png', msAlias: 'mstile-144x144.png' },
  { size: 152, name: 'icons/icon-152x152.png' },
  { size: 192, name: 'icons/icon-192x192.png' },
  { size: 384, name: 'icons/icon-384x384.png' },
  { size: 512, name: 'icons/icon-512x512.png' },
];

// Apple splash screen sizes
const SPLASH_SCREENS = [
  { width: 2048, height: 2732, name: 'apple-splash-2048-2732.png' }, // 12.9" iPad Pro
  { width: 1668, height: 2388, name: 'apple-splash-1668-2388.png' }, // 11" iPad Pro
  { width: 1536, height: 2048, name: 'apple-splash-1536-2048.png' }, // 9.7" iPad
  { width: 1125, height: 2436, name: 'apple-splash-1125-2436.png' }, // iPhone X/XS
  { width: 1242, height: 2688, name: 'apple-splash-1242-2688.png' }, // iPhone XS Max
];

// Social media images
const SOCIAL_IMAGES = [
  { width: 1200, height: 630, name: 'og-image.png' }, // OpenGraph
  { width: 1200, height: 600, name: 'twitter-image.png' }, // Twitter
];

async function generateIcons() {
  const inputFile = path.join(__dirname, '../public/images/Logo.webp');
  const publicDir = path.join(__dirname, '../public');

  // Create necessary directories
  await fs.mkdir(path.join(publicDir, 'icons'), { recursive: true });

  // Generate PNG icons
  for (const { size, name, msAlias } of ICON_SIZES) {
    const buffer = await sharp(inputFile)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toBuffer();

    await fs.writeFile(path.join(publicDir, name), buffer);
    console.log(`Generated ${name}`);

    // Generate Microsoft tile version if needed
    if (msAlias) {
      await fs.writeFile(path.join(publicDir, 'icons', msAlias), buffer);
      console.log(`Generated ${msAlias}`);
    }
  }

  // Generate ICO file with multiple sizes
  const sizes = [16, 32, 48];
  const icoBuffers = await Promise.all(
    sizes.map(size =>
      sharp(inputFile)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toBuffer()
    )
  );

  // Use the 32x32 version for favicon.ico
  await fs.writeFile(path.join(publicDir, 'favicon.ico'), icoBuffers[1]);
  console.log('Generated favicon.ico');

  // Generate Apple splash screens
  for (const { width, height, name } of SPLASH_SCREENS) {
    await sharp(inputFile)
      .resize(width, height, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(path.join(publicDir, 'icons', name));
    console.log(`Generated ${name}`);
  }

  // Generate social media images
  for (const { width, height, name } of SOCIAL_IMAGES) {
    await sharp(inputFile)
      .resize(width, height, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(path.join(publicDir, 'icons', name));
    console.log(`Generated ${name}`);
  }

  // Generate Safari pinned tab icon (SVG)
  await sharp(inputFile)
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png() // Convert to PNG first for better SVG conversion
    .toFile(path.join(publicDir, 'safari-pinned-tab.svg'));
  console.log('Generated safari-pinned-tab.svg');

  console.log('Generated all icons successfully!');
}

// Generate web manifest
async function generateWebManifest() {
  const manifest = {
    name: 'ConvertShift',
    short_name: 'ConvertShift',
    description: 'Convert your files between different formats easily and securely in your browser',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'any',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '64x64 32x32 24x24 16x16',
        type: 'image/x-icon'
      },
      {
        src: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png'
      },
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png'
      },
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ],
    shortcuts: [
      {
        name: 'Image Modifier',
        short_name: 'Modify',
        description: 'All-in-one image tool: Crop, Resize, Remove Background, Compress & Convert',
        url: '/image-modifier',
        icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }]
      }
    ]
  };

  await fs.writeFile(
    path.join(publicDir, 'site.webmanifest'),
    JSON.stringify(manifest, null, 2)
  );
  console.log('Generated site.webmanifest');
}

async function main() {
  try {
    await generateIcons();
    await generateWebManifest();
    console.log('All assets generated successfully!');
  } catch (error) {
    console.error('Error generating assets:', error);
    process.exit(1);
  }
}

main(); 