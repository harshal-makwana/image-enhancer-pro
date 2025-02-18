import { NextResponse } from 'next/server'
import sharp from 'sharp'

const getValidBlur = (blur: number | undefined) => Math.max(0.3, Math.min(1000, blur ?? 0.3));

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageProcessingOptions {
  mode: 'basic' | 'enhance' | 'portrait' | 'landscape' | 'art' | 'blackAndWhite' | 'vintage' | 'sepia';
  adjustments: {
    brightness: number;
    contrast: number;
    saturation: number;
    sharpness: number;
    blur: number;
    temperature: number;
  };
  crop?: CropArea;
  compression?: {
    quality: number;
    format: string;
    maxWidth: number;
  };
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    const options = JSON.parse(formData.get('options') as string) as ImageProcessingOptions;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let processedBuffer = sharp(buffer);

    // Apply base optimizations
    processedBuffer = processedBuffer
      .rotate() // Auto-rotate based on EXIF
      .normalize(); // Normalize color channels

    // Apply crop if specified
    if (options.crop) {
      try {
        const cropOptions = {
          left: Math.round(options.crop.x),
          top: Math.round(options.crop.y),
          width: Math.round(options.crop.width),
          height: Math.round(options.crop.height)
        };

        if (cropOptions.width > 0 && cropOptions.height > 0) {
          processedBuffer = processedBuffer.extract(cropOptions);
        }
      } catch (error) {
        console.error('Crop error:', error);
        // Continue processing even if crop fails
      }
    }

    switch (options.mode) {
      case 'portrait':
        processedBuffer = processedBuffer
          .modulate({
            brightness: 1.2,
            saturation: 1.5,
            hue: 5
          })
          .gamma(1.1)
          .sharpen({
            sigma: 1.5,
            m1: 0.7,
            m2: 0.7
          })
          .median(3)
          .blur(getValidBlur(0.5));
        break;

      case 'landscape':
        processedBuffer = processedBuffer
          .modulate({
            brightness: 1.3,
            saturation: 1.6,
            hue: -5
          })
          .gamma(1.2)
          .sharpen({
            sigma: 1.8,
            m1: 1.0,
            m2: 0.7
          })
          .linear(1.1, -20);
        break;

      case 'art':
        processedBuffer = processedBuffer
          .modulate({
            brightness: 1.4,
            saturation: 1.8,
            hue: 15
          })
          .gamma(1.3)
          .sharpen({
            sigma: 2.0,
            m1: 1.5,
            m2: 0.8
          })
          .linear(1.2, -30);
        break;

      case 'blackAndWhite':
        processedBuffer = processedBuffer
          .grayscale()
          .modulate({
            brightness: 1.2
          })
          .gamma(1.2)
          .sharpen({
            sigma: 1.5,
            m1: 1.0,
            m2: 0.5
          })
          .linear(1.1, -10);
        break;

      case 'vintage':
        processedBuffer = processedBuffer
          .modulate({
            brightness: 1.1,
            saturation: 0.8,
            hue: -10
          })
          .gamma(1.1)
          .tint({ r: 200, g: 180, b: 150 }) // Apply a vintage tint
          .sharpen({
            sigma: 1.2,
            m1: 0.5,
            m2: 0.5
          });
        break;

      case 'sepia':
        processedBuffer = processedBuffer
          .modulate({
            brightness: 1.1,
            saturation: 0.7,
            hue: -20
          })
          .gamma(1.1)
          .tint({ r: 112, g: 66, b: 20 }) // Apply a sepia tint
          .sharpen({
            sigma: 1.2,
            m1: 0.5,
            m2: 0.5
          });
        break;

      default:
        processedBuffer = processedBuffer
          .modulate({
            brightness: options.adjustments?.brightness || 1.15,
            saturation: options.adjustments?.saturation || 1.3,
            hue: options.adjustments?.temperature || 5
          })
          .gamma(options.adjustments?.contrast || 1.2)
          .sharpen({
            sigma: options.adjustments?.sharpness || 1.5,
            m1: 1.0,
            m2: 0.5
          })
          .blur(getValidBlur(options.adjustments?.blur))
          .linear(1.1, -10);
        break;
    }

    if (options.compression) {
      processedBuffer = processedBuffer
        .resize(options.compression.maxWidth, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .toFormat(options.compression.format as keyof sharp.FormatEnum, {
          quality: options.compression.quality
        });
    }

    const finalBuffer = await processedBuffer
      .jpeg({
        quality: 95,
        chromaSubsampling: '4:4:4',
        force: true
      })
      .toBuffer();

    const base64Image = `data:image/jpeg;base64,${finalBuffer.toString('base64')}`;
    return NextResponse.json({ enhancedImage: base64Image });

  } catch (error) {
    console.error('Image processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
