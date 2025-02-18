import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    const options = JSON.parse(formData.get('options') as string);

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const imageBuffer = Buffer.from(await file.arrayBuffer());
    const base64Image = `data:${file.type};base64,${imageBuffer.toString('base64')}`;

    let output;
    switch (options.mode) {
      case 'background':
        output = await replicate.run(
          "ilkerc/rembg:7f5cc3cd27573ab522e05738a8b8a02c3208c0a4abc105522719e0cd142d102e",
          { input: { image: base64Image } }
        );
        break;

      case 'retouch':
        output = await replicate.run(
          "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
          { input: { image: base64Image, face_enhance: true, strength: options.retouchStrength } }
        );
        break;

      case 'style':
        output = await replicate.run(
          "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
          { input: { image: base64Image, prompt: `Style of ${options.stylePreset}` } }
        );
        break;

      case 'remove':
        // For object removal, you might want to also send mask coordinates
        output = await replicate.run(
          "stability-ai/stable-diffusion-inpainting:c28b92a7ecd66eee4aefcd8a94eb9e7f6c3805d5f06038165407fb5cb355ba67",
          { input: { image: base64Image } }
        );
        break;
    }

    return NextResponse.json({ enhancedImage: output });

  } catch (error) {
    console.error('AI processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
} 