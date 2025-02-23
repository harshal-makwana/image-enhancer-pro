import { NextResponse } from 'next/server';
import sharp from 'sharp';

// Add this interface at the top of the file
interface ModulateOptions {
  brightness?: number;
  saturation?: number;
  hue?: number;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;
    const optionsStr = formData.get('options') as string;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const options = JSON.parse(optionsStr);
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let processedBuffer;
    switch (options.mode) {
      case 'enhance':
        // Auto enhance with balanced adjustments
        processedBuffer = await sharp(buffer)
          .modulate({
            brightness: 1.1,
            saturation: 1.2,
            hue: 5
          })
          .sharpen({
            sigma: 1.5,
            m1: 0.5,
            m2: 0.5
          })
          .normalize() // Improve contrast
          .toBuffer();
        break;

      case 'portrait':
        // Portrait optimization
        processedBuffer = await sharp(buffer)
          .modulate({
            brightness: 1.1,
            saturation: 1.15
          })
          .sharpen({
            sigma: 1.2,
            m1: 0.3,
            m2: 0.3
          })
          .gamma(0.9) // Slightly soften
          .toBuffer();
        break;

      case 'color':
        // Color effects based on preset
        const colorPresets: Record<string, ModulateOptions> = {
          warm: { brightness: 1.1, saturation: 1.2, hue: 15 },
          cool: { brightness: 1.0, saturation: 1.1, hue: -15 },
          vibrant: { brightness: 1.2, saturation: 1.4, hue: 0 },
          muted: { brightness: 0.9, saturation: 0.8, hue: 0 },
          dramatic: { brightness: 1.3, saturation: 1.3, hue: -5 }
        };
        const preset = colorPresets[options.stylePreset] || colorPresets.warm;
        
        processedBuffer = await sharp(buffer)
          .modulate(preset)
          .sharpen()
          .toBuffer();
        break;

      case 'hdr':
        // HDR-like effect
        processedBuffer = await sharp(buffer)
          .modulate({ brightness: 1.2, saturation: 1.3 })
          .gamma(0.8)
          .sharpen({ sigma: 1.5 })
          .normalize()
          .toBuffer();
        break;

      case 'blur':
        // Selective blur (keep center sharp)
        const metadata = await sharp(buffer).metadata();
        const centerWidth = Math.round(metadata.width! * 0.5);
        const centerHeight = Math.round(metadata.height! * 0.5);
        
        processedBuffer = await sharp(buffer)
          .blur(8)
          .composite([{
            input: await sharp(buffer)
              .extract({
                left: Math.round((metadata.width! - centerWidth) / 2),
                top: Math.round((metadata.height! - centerHeight) / 2),
                width: centerWidth,
                height: centerHeight
              })
              .sharpen()
              .toBuffer(),
            left: Math.round((metadata.width! - centerWidth) / 2),
            top: Math.round((metadata.height! - centerHeight) / 2)
          }])
          .toBuffer();
        break;

      case 'vintage':
        // Vintage/retro effect
        processedBuffer = await sharp(buffer)
          .modulate({ brightness: 1.1, saturation: 0.8, hue: 15 })
          .gamma(1.1)
          .tint({ r: 243, g: 235, b: 205 })
          .sharpen({ sigma: 0.8 })
          .toBuffer();
        break;

      case 'blackwhite':
        // Professional B&W conversion
        processedBuffer = await sharp(buffer)
          .grayscale()
          .modulate({ brightness: 1.1 })
          .normalize()
          .gamma(1.1)
          .sharpen({ sigma: 1.2 })
          .toBuffer();
        break;

      case 'sharpen':
        // Advanced sharpening
        processedBuffer = await sharp(buffer)
          .sharpen({
            sigma: 2,
            m1: 2,
            m2: 0.5,
            x1: 2,
            y2: 10,
            y3: 20
          })
          .normalize()
          .toBuffer();
        break;

      default:
        processedBuffer = await sharp(buffer)
          .modulate({
            brightness: 1.1,
            saturation: 1.1
          })
          .sharpen()
          .toBuffer();
    }

    const base64Image = `data:${imageFile.type};base64,${processedBuffer.toString('base64')}`;
    return NextResponse.json({ enhancedImage: base64Image });

  } catch (error) {
    console.error('Image processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
} 