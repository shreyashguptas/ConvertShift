import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use sharp to convert RAW to PNG
    // Sharp uses libvips which has RAW support through various loaders
    const image = sharp(buffer);

    // Get metadata
    const metadata = await image.metadata();

    // Convert to PNG
    const pngBuffer = await image
      .png({ quality: 100 })
      .toBuffer();

    // Return the PNG as base64 with metadata
    const base64 = pngBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({
      success: true,
      dataUrl,
      width: metadata.width,
      height: metadata.height,
      metadata: {
        format: metadata.format,
        space: metadata.space,
        channels: metadata.channels,
        depth: metadata.depth,
        density: metadata.density,
      },
    });
  } catch (error) {
    console.error('RAW conversion error:', error);

    // Check for specific errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('unsupported image format')) {
      return NextResponse.json(
        { error: 'Unsupported RAW format. Try a different file.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Failed to convert RAW image: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
