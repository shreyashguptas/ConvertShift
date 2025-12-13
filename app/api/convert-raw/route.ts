import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

// Export runtime config for Vercel
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  console.log('[convert-raw] Request received');

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.log('[convert-raw] No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`[convert-raw] Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`);

    // Validate file size (max 50MB for serverless)
    if (file.size > 50 * 1024 * 1024) {
      console.log('[convert-raw] File too large');
      return NextResponse.json({ error: 'File too large. Max 50MB.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('[convert-raw] Buffer created, initializing Sharp');

    // Try to process with Sharp
    const image = sharp(buffer, { failOnError: false });
    const metadata = await image.metadata();

    console.log(`[convert-raw] Metadata: format=${metadata.format}, ${metadata.width}x${metadata.height}`);

    // Check if Sharp actually recognized the format
    if (!metadata.format) {
      console.log('[convert-raw] Sharp could not detect format');
      return NextResponse.json({
        error: 'Unsupported image format. Sharp cannot process this RAW file on Vercel.'
      }, { status: 400 });
    }

    const pngBuffer = await image.png({ quality: 90 }).toBuffer();

    console.log(`[convert-raw] Conversion complete, output size: ${pngBuffer.length}`);

    const base64 = pngBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({
      success: true,
      dataUrl,
      width: metadata.width,
      height: metadata.height,
    });
  } catch (error) {
    console.error('[convert-raw] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json({
      error: `RAW conversion failed: ${errorMessage}`
    }, { status: 500 });
  }
}
