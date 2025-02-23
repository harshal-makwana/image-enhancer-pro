"use client";

import { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import Cropper from 'react-easy-crop';
import { useDropzone } from 'react-dropzone';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { useTheme } from 'next-themes';
import { PhotoIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Lazy load components
const CropperLazy = lazy(() => import('react-easy-crop'));

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [resizeDimensions, setResizeDimensions] = useState({ width: 800, height: 600 });
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState({
    brightness: 1.0,
    contrast: 1.0,
    saturation: 1.0,
    blur: 0,
    sharpness: 0,
    filter: 'none',
    enhanceMode: 'standard',
    temperature: 0
  });

  const [activeTab, setActiveTab] = useState('crop');

  const [cropSize, setCropSize] = useState({ width: 16, height: 9 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const tabs = [
    { id: 'crop', label: 'Crop & Resize' },
    { id: 'enhance', label: 'Enhancement' },
    { id: 'filters', label: 'Filters & Effects' },
    { id: 'compress', label: 'Format & Compress' },
    { id: 'ai', label: 'AI Features' }
  ];

  const [processing, setProcessing] = useState(false);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);

  const [aspectRatio, setAspectRatio] = useState<number | undefined>(16/9);

  const [compressionSettings, setCompressionSettings] = useState({
    quality: 80,
    format: 'jpeg',
    maxWidth: 1920
  });

  const formats = [
    { label: 'JPEG', value: 'jpeg' },
    { label: 'PNG', value: 'png' },
    { label: 'WebP', value: 'webp' },
    { label: 'AVIF', value: 'avif' }
  ];

  const [showCroppedResult, setShowCroppedResult] = useState(false);

  const [aiSettings, setAiSettings] = useState({
    mode: 'background',
    stylePreset: 'vangogh',
    retouchStrength: 0.5
  });

  const aiFeatures = [
    { name: 'Auto Enhance', value: 'enhance', icon: '✨' },
    { name: 'Portrait Mode', value: 'portrait', icon: '👤' },
    { name: 'Color Effects', value: 'color', icon: '🎨' },
    { name: 'HDR Effect', value: 'hdr', icon: '🌈' },
    { name: 'Blur Background', value: 'blur', icon: '🔍' },
    { name: 'Vintage Look', value: 'vintage', icon: '📷' },
    { name: 'B&W Pro', value: 'blackwhite', icon: '◾' },
    { name: 'Sharpen', value: 'sharpen', icon: '⚡' }
  ];

  const stylePresets = [
    { name: 'Warm', value: 'warm' },
    { name: 'Cool', value: 'cool' },
    { name: 'Vibrant', value: 'vibrant' },
    { name: 'Muted', value: 'muted' },
    { name: 'Sepia', value: 'sepia' },
    { name: 'Dramatic', value: 'dramatic' }
  ];

  useEffect(() => {
    setMounted(true);
    setTheme('dark'); // Set default theme to dark
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  });

  const handleDownload = () => {
    const imageUrl = enhancedImage || image;
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.download = 'processed-image.png';
    link.href = imageUrl;  // Now imageUrl is guaranteed to be string
    link.click();
  };

  // Add this section after your existing state declarations
  const filters = [
    { name: 'None', value: 'none' },
    { name: 'Enhanced', value: 'enhanced' },
    { name: 'HDR', value: 'hdr' },
    { name: 'Portrait Pro', value: 'portraitPro' },
    { name: 'Vintage', value: 'vintage' },
    { name: 'B&W', value: 'blackAndWhite' },
    { name: 'Sepia', value: 'sepia' },
    { name: 'Vivid', value: 'vivid' },
    { name: 'Dramatic', value: 'dramatic' }
  ];

  const enhanceModes = [
    { name: 'Standard', value: 'standard' },
    { name: 'AI Portrait', value: 'aiPortrait' },
    { name: 'AI Landscape', value: 'aiLandscape' },
    { name: 'AI HDR', value: 'aiHdr' }
  ];

  const processImage = useCallback(async () => {
    if (!image) return;
    setProcessing(true);
    
    try {
      const formData = new FormData();
      const response = await fetch(image);
      const blob = await response.blob();
      formData.append('image', blob);
      
      if (activeTab === 'ai') {
        formData.append('options', JSON.stringify(aiSettings));
        const result = await fetch('/api/ai', {
          method: 'POST',
          body: formData
        });
        if (!result.ok) {
          const error = await result.text();
          throw new Error(error);
        }
        
        const data = await result.json();
        setEnhancedImage(data.enhancedImage);
      } else {
        const options = {
          mode: settings.filter,
          adjustments: {
            brightness: settings.brightness,
            contrast: settings.contrast,
            saturation: settings.saturation,
            blur: settings.blur,
            sharpness: settings.sharpness,
            temperature: settings.temperature || 0
          },
          compression: {
            quality: compressionSettings.quality,
            format: compressionSettings.format,
            maxWidth: compressionSettings.maxWidth
          },
          crop: croppedAreaPixels
        };

        formData.append('options', JSON.stringify(options));

        const result = await fetch('/api/enhance', {
          method: 'POST',
          body: formData
        });

        if (!result.ok) {
          const error = await result.text();
          throw new Error(error);
        }
        
        const data = await result.json();
        setEnhancedImage(data.enhancedImage);
      }
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setProcessing(false);
    }
  }, [image, settings, compressionSettings, croppedAreaPixels, activeTab, aiSettings]);

  useEffect(() => {
    if (image) {
      processImage();
    }
  }, [image, settings, processImage]);

  const onImageLoad = useCallback((imageSize: { width: number; height: number }) => {
    // Set initial crop area to match image dimensions
    setCroppedAreaPixels({
      x: 0,
      y: 0,
      width: imageSize.width,
      height: imageSize.height
    });
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700"
      >
        {theme === 'dark' ? (
          <SunIcon className="w-5 h-5 text-yellow-500" />
        ) : (
          <MoonIcon className="w-5 h-5 text-gray-900" />
        )}
      </button>

      <main className="container mx-auto py-6 md:py-12 px-4">
        <div className="text-center space-y-4 md:space-y-6 mb-8 md:mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            AI Image Processor
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transform your images with advanced AI-powered enhancement tools
          </p>
        </div>

        {!image ? (
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg 
              p-4 md:p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 
              transition-colors bg-white dark:bg-gray-800"
          >
            <input {...getInputProps()} />
            <PhotoIcon className="w-12 h-12 mx-auto text-gray-400" />
            <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
              Tap to upload or drag & drop an image
            </p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {/* Tabs Navigation - Make scrollable on mobile */}
            <div className="overflow-x-auto">
              <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 min-w-max">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 md:px-4 py-2 text-sm md:text-base font-medium rounded-t-lg transition-colors whitespace-nowrap
                      ${activeTab === tab.id 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content Area - Stack on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Original Image */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
                  Original Image
                </h3>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  <img
                    src={image}
                    alt="Original"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Enhanced Image */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
                  Enhanced Image
                </h3>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  {activeTab === 'crop' ? (
                    !showCroppedResult ? (
                      <Suspense fallback={<div>Loading...</div>}>
                        <CropperLazy
                          image={image}
                          crop={crop}
                          zoom={zoom}
                          aspect={aspectRatio}
                          onCropChange={setCrop}
                          onZoomChange={setZoom}
                          onCropComplete={(croppedArea, croppedAreaPixels) => {
                            if (croppedAreaPixels) {
                              setCroppedAreaPixels({
                                x: Math.round(croppedAreaPixels.x),
                                y: Math.round(croppedAreaPixels.y),
                                width: Math.round(croppedAreaPixels.width),
                                height: Math.round(croppedAreaPixels.height)
                              });
                            }
                          }}
                          onMediaLoaded={onImageLoad}
                          showGrid={true}
                          cropShape="rect"
                          restrictPosition={true}
                          cropSize={!aspectRatio ? { 
                            width: croppedAreaPixels?.width || 0, 
                            height: croppedAreaPixels?.height || 0 
                          } : undefined}
                          style={{
                            containerStyle: {
                              width: '100%',
                              height: '100%',
                              backgroundColor: 'rgba(0, 0, 0, 0.5)'
                            },
                            cropAreaStyle: {
                              border: '2px solid #fff',
                              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                            },
                            mediaStyle: {
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain'
                            }
                          }}
                        />
                      </Suspense>
                    ) : (
                      <Image
                        src={enhancedImage || image || ''}
                        alt="Enhanced"
                        width={800}
                        height={600}
                        className="w-full h-full object-contain"
                        priority={true}
                      />
                    )
                  ) : (
                    <Image
                      src={enhancedImage || image || ''}
                      alt="Enhanced"
                      width={800}
                      height={600}
                      className="w-full h-full object-contain"
                      priority={true}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Controls Section - Better spacing on mobile */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 md:p-6">
              {activeTab === 'crop' && (
                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Crop Settings
                  </h3>
                  <div className="space-y-4">
                    {/* Aspect Ratio Controls */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAspectRatio(16/9)}
                        className={`px-3 py-1 rounded ${
                          aspectRatio === 16/9 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        16:9
                      </button>
                      <button
                        onClick={() => setAspectRatio(4/3)}
                        className={`px-3 py-1 rounded ${
                          aspectRatio === 4/3 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        4:3
                      </button>
                      <button
                        onClick={() => setAspectRatio(1)}
                        className={`px-3 py-1 rounded ${
                          aspectRatio === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        1:1
                      </button>
                      <button
                        onClick={() => setAspectRatio(undefined)}
                        className={`px-3 py-1 rounded ${
                          aspectRatio === undefined ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        Free
                      </button>
                    </div>

                    {/* Manual Crop Controls - Show only when aspect ratio is undefined (free) */}
                    {!aspectRatio && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm text-gray-600 dark:text-gray-400">Width (px)</label>
                          <input
                            type="number"
                            value={Math.round(croppedAreaPixels?.width || 0)}
                            onChange={(e) => {
                              const width = parseInt(e.target.value);
                              if (width > 0 && croppedAreaPixels) {
                                const newCrop = {
                                  ...croppedAreaPixels,
                                  width
                                };
                                setCroppedAreaPixels(newCrop);
                                setCrop(prev => ({
                                  ...prev,
                                  x: newCrop.x,
                                  y: newCrop.y
                                }));
                                setShowCroppedResult(false);
                              }
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                              bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-gray-600 dark:text-gray-400">Height (px)</label>
                          <input
                            type="number"
                            value={Math.round(croppedAreaPixels?.height || 0)}
                            onChange={(e) => {
                              const height = parseInt(e.target.value);
                              if (height > 0 && croppedAreaPixels) {
                                const newCrop = {
                                  ...croppedAreaPixels,
                                  height
                                };
                                setCroppedAreaPixels(newCrop);
                                setCrop(prev => ({
                                  ...prev,
                                  x: newCrop.x,
                                  y: newCrop.y
                                }));
                                setShowCroppedResult(false);
                              }
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                              bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                          />
                        </div>
                      </div>
                    )}

                    {/* Apply Changes Button */}
                    <button
                      onClick={() => {
                        processImage();
                        setShowCroppedResult(true);
                      }}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                        transition-colors font-medium"
                    >
                      Apply Crop
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'enhance' && (
                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Enhancement Settings
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Image adjustment controls */}
                    <div className="space-y-4">
                      {Object.entries({
                        brightness: { min: 0, max: 2, step: 0.1 },
                        contrast: { min: 0, max: 2, step: 0.1 },
                        saturation: { min: 0, max: 2, step: 0.1 },
                        blur: { min: 0, max: 10, step: 0.5 },
                        sharpness: { min: 0, max: 10, step: 0.5 }
                      }).map(([key, { min, max, step }]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between">
                            <label className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {key}
                            </label>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {settings[key as keyof typeof settings]}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={min}
                            max={max}
                            step={step}
                            value={settings[key as keyof typeof settings]}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              [key]: parseFloat(e.target.value)
                            }))}
                            className="w-full accent-blue-500"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Enhancement mode selection */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm text-gray-600 dark:text-gray-400">
                          Enhancement Mode
                        </label>
                        <select
                          value={settings.enhanceMode}
                          onChange={(e) => setSettings(prev => ({ ...prev, enhanceMode: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                            bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                        >
                          {enhanceModes.map(mode => (
                            <option key={mode.value} value={mode.value}>
                              {mode.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'filters' && (
                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Filters & Effects
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {filters.map(filter => (
                      <button
                        key={filter.value}
                        onClick={() => setSettings(prev => ({ ...prev, filter: filter.value }))}
                        className={`p-3 rounded-lg transition-colors
                          ${settings.filter === filter.value
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                      >
                        {filter.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'compress' && (
                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Format & Compression
                  </h3>
                  <div className="space-y-6">
                    {/* Format Selection */}
                    <div className="space-y-2">
                      <label className="block text-sm text-gray-600 dark:text-gray-400">
                        Output Format
                      </label>
                      <select
                        value={compressionSettings.format}
                        onChange={(e) => setCompressionSettings(prev => ({ ...prev, format: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                          bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                      >
                        {formats.map(format => (
                          <option key={format.value} value={format.value}>
                            {format.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quality Control */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm text-gray-600 dark:text-gray-400">Quality</label>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {compressionSettings.quality}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={100}
                        value={compressionSettings.quality}
                        onChange={(e) => setCompressionSettings(prev => ({ 
                          ...prev, 
                          quality: parseInt(e.target.value) 
                        }))}
                        className="w-full accent-blue-500"
                      />
                    </div>

                    {/* Max Width Control */}
                    <div className="space-y-2">
                      <label className="block text-sm text-gray-600 dark:text-gray-400">
                        Max Width (px)
                      </label>
                      <input
                        type="number"
                        value={compressionSettings.maxWidth}
                        onChange={(e) => setCompressionSettings(prev => ({ 
                          ...prev, 
                          maxWidth: parseInt(e.target.value) 
                        }))}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                          bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="space-y-6">
                  <h3 className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-200">
                    AI Features
                  </h3>
                  
                  {/* AI Mode Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    {aiFeatures.map(feature => (
                      <button
                        key={feature.value}
                        onClick={() => setAiSettings(prev => ({ ...prev, mode: feature.value }))}
                        className={`p-4 rounded-lg flex items-center space-x-3 transition-colors
                          ${aiSettings.mode === feature.value
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                      >
                        <span className="text-2xl">{feature.icon}</span>
                        <span>{feature.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Mode-specific controls */}
                  {aiSettings.mode === 'style' && (
                    <div className="space-y-4">
                      <label className="block text-sm text-gray-600 dark:text-gray-400">
                        Style Preset
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {stylePresets.map(style => (
                          <button
                            key={style.value}
                            onClick={() => setAiSettings(prev => ({ ...prev, stylePreset: style.value }))}
                            className={`p-3 rounded-lg transition-colors
                              ${aiSettings.stylePreset === style.value
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                          >
                            {style.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiSettings.mode === 'retouch' && (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <label className="text-sm text-gray-600 dark:text-gray-400">Retouch Strength</label>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {(aiSettings.retouchStrength * 100).toFixed(0)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.1}
                        value={aiSettings.retouchStrength}
                        onChange={(e) => setAiSettings(prev => ({ 
                          ...prev, 
                          retouchStrength: parseFloat(e.target.value) 
                        }))}
                        className="w-full accent-blue-500"
                      />
                    </div>
                  )}

                  {/* Apply AI Button */}
                  <button
                    onClick={() => processImage()}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                      transition-colors font-medium"
                  >
                    Apply AI Effect
                  </button>
                </div>
              )}

              {/* Download Button */}
              <div className="mt-6">
                <button
                  onClick={handleDownload}
                  disabled={!enhancedImage && !image}
                  className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg
                    transition-all transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Download Processed Image
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator - Center on screen */}
        {processing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4 mx-4">
              <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
              <p className="text-center text-gray-700 dark:text-gray-200">Processing image...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
