'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { processImage as processImageClient } from '@/utils/imageProcessing'

interface Region {
  left: number;
  top: number;
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
    resize?: { width: number; height: number };
    rotate?: number;
    flip?: { horizontal: boolean; vertical: boolean };
  };
  crop?: Region;
}

export default function ImageProcessor() {
  const [image, setImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<ImageProcessingOptions>({
    mode: 'enhance',
    adjustments: {
      brightness: 1.0,
      contrast: 1.0,
      saturation: 1.0,
      sharpness: 1.0,
      blur: 0.3,
      temperature: 0,
      resize: { width: 800, height: 600 },
      rotate: 0,
      flip: { horizontal: false, vertical: false },
    },
  });

  const processImage = useCallback(async () => {
    if (!image) return;
    setProcessing(true);
    
    try {
      const processingOptions = {
        mode: options.mode,
        adjustments: {
          brightness: options.adjustments.brightness,
          contrast: options.adjustments.contrast,
          saturation: options.adjustments.saturation,
          blur: options.adjustments.blur,
          sharpness: options.adjustments.sharpness,
          temperature: options.adjustments.temperature || 0
        },
        crop: options.crop ? {
          x: options.crop.left,
          y: options.crop.top,
          width: options.crop.width,
          height: options.crop.height
        } : undefined
      };

      const enhancedImage = await processImageClient(image, processingOptions);
      setEnhancedImage(enhancedImage);
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setProcessing(false);
    }
  }, [image, options]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  // Effect to process the image whenever options change
  useEffect(() => {
    const processEnhancedImage = async () => {
      if (image) {
        setProcessing(true);
        const response = await fetch(image);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = async () => {
          const base64String = reader.result as string;
          const processOptions = {
            ...options,
            crop: options.crop ? {
              x: options.crop.left,
              y: options.crop.top,
              width: options.crop.width,
              height: options.crop.height
            } : undefined
          };
          const enhanced = await processImageClient(base64String, processOptions);
          setEnhancedImage(enhanced);
          setProcessing(false);
        };
        reader.readAsDataURL(blob);
      }
    };

    processEnhancedImage();
  }, [options, image]);

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div 
              {...getRootProps({
                className: "border-3 border-dashed border-blue-400 dark:border-blue-500 rounded-xl p-8 hover:border-blue-600 dark:hover:border-blue-400 transition-colors cursor-pointer bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 min-h-[300px] flex items-center justify-center"
              })}
            >
              <input {...getInputProps()} />
              {image ? (
                <div className="relative w-full h-full min-h-[300px]">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-6xl mb-4">🖼️</div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                    Drop your image here
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    or click to select from your computer
                  </p>
                  <p className="text-sm text-gray-400">
                    Supports PNG, JPG up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
                Processing Mode
              </h3>
              <select
                value={options.mode}
                onChange={(e) => setOptions({ ...options, mode: e.target.value as ImageProcessingOptions['mode'] })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                <option value="basic">Basic</option>
                <option value="enhance">AI Enhancement</option>
                <option value="portrait">Portrait Mode</option>
                <option value="landscape">Landscape Mode</option>
                <option value="art">Artistic</option>
                <option value="blackAndWhite">Black & White</option>
                <option value="vintage">Vintage</option>
                <option value="sepia">Sepia</option>
              </select>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Adjustments
              </h3>
              {Object.entries(options.adjustments).map(([key, value]) => {
                if (typeof value === 'number') {
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {key}
                        </label>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {value.toFixed(2)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={key === 'blur' ? 1 : 2}
                        step={0.1}
                        value={value}
                        onChange={(e) =>
                          setOptions({
                            ...options,
                            adjustments: {
                              ...options.adjustments,
                              [key]: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="w-full"
                      />
                    </div>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={processImage}
              disabled={processing || !image}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg
                hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105
                font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
                disabled:hover:scale-100"
            >
              {processing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                'Process Image'
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {enhancedImage && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            Processed Result
          </h3>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <img
              src={enhancedImage}
              alt="Processed"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (!enhancedImage) return;
                const link = document.createElement('a');
                link.download = 'enhanced-image.png';
                link.href = enhancedImage;
                link.click();
              }}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg
                transition-colors font-semibold shadow-lg"
            >
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}