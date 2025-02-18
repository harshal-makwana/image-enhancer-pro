import sharp from 'sharp';

interface ProcessingOptions {
  mode: string;
  adjustments: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
    sharpness: number;
    temperature: number;
  };
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export async function processImage(imageData: string, inputOptions: ProcessingOptions) {
  try {
    // Convert base64 to buffer
    const buffer = Buffer.from(imageData.split(',')[1], 'base64');
    
    let processedBuffer = sharp(buffer);

    // Apply base optimizations
    processedBuffer = processedBuffer
      .rotate()
      .normalize();

    // Apply crop if specified
    if (inputOptions.crop) {
      try {
        const cropOptions = {
          left: Math.round(inputOptions.crop.x),
          top: Math.round(inputOptions.crop.y),
          width: Math.round(inputOptions.crop.width),
          height: Math.round(inputOptions.crop.height)
        };

        if (cropOptions.width > 0 && cropOptions.height > 0) {
          processedBuffer = processedBuffer.extract(cropOptions);
        }
      } catch (error) {
        console.error('Crop error:', error);
      }
    }

    // Apply adjustments
    if (inputOptions.adjustments) {
      processedBuffer = processedBuffer.modulate({
        brightness: inputOptions.adjustments.brightness,
        saturation: inputOptions.adjustments.saturation
      });
    }

    const finalBuffer = await processedBuffer
      .jpeg({
        quality: 95,
        chromaSubsampling: '4:4:4',
        force: true
      })
      .toBuffer();

    return `data:image/jpeg;base64,${finalBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process image');
  }
} 