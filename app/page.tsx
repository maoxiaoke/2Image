'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import * as htmlToImage from 'html-to-image';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useThrottle } from 'react-use';

// Define interface for html-to-image options
interface HtmlToImageOptions {
  quality?: number;
  pixelRatio?: number;
  backgroundColor?: string;
  width?: number;
  height?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  style?: Record<string, string>;
  filter?: (node: HTMLElement) => boolean;
}

export default function HtmlToImageDemo() {
  const contentRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const [htmlContent, setHtmlContent] = useState('<h1>Hello, World!</h1>');
  const [bgColor, setBgColor] = useState('#f3f4f6');
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('html');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageFormat, setImageFormat] = useState<'png' | 'jpeg' | 'svg'>('png');
  const [imageQuality, setImageQuality] = useState<number>(1.0);
  const [pixelRatio, setPixelRatio] = useState<number>(2);
  const [imageWidth, setImageWidth] = useState<string>('');
  const [imageHeight, setImageHeight] = useState<string>('');
  const [contentWidth, setContentWidth] = useState<number>(0);

  const throttledHtmlContent = useThrottle(htmlContent, 2000);

  // Measure content width after render
  useEffect(() => {
    if (contentRef.current && contentWrapperRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          // Get the width of the content
          const contentWidth = entry.contentRect.width;
          setContentWidth(contentWidth);
          
          // Adjust the wrapper width based on content width
          if (contentWrapperRef.current) {
            if (contentWidth <= 1) {
              contentWrapperRef.current.style.width = '100%';
            } else {
              contentWrapperRef.current.style.width = 'auto';
            }
          }
        }
      });
      
      resizeObserver.observe(contentRef.current);
      
      return () => {
        if (contentRef.current) {
          resizeObserver.unobserve(contentRef.current);
        }
      };
    }
  }, [throttledHtmlContent]);

  // Load saved settings from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Load HTML content
        const savedContent = localStorage.getItem('htmlToImage_content');
        if (savedContent) setHtmlContent(savedContent);
        
        // Load settings
        const savedSettings = localStorage.getItem('htmlToImage_settings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          if (settings.bgColor) setBgColor(settings.bgColor);
          if (settings.imageFormat) setImageFormat(settings.imageFormat);
          if (settings.imageQuality) setImageQuality(parseFloat(settings.imageQuality));
          if (settings.pixelRatio) setPixelRatio(parseFloat(settings.pixelRatio));
          if (settings.imageWidth) setImageWidth(settings.imageWidth);
          if (settings.imageHeight) setImageHeight(settings.imageHeight);
        }
      } catch (err) {
        console.error('Error loading saved settings:', err);
      }
    }
  }, []);

  // Save HTML content to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('htmlToImage_content', htmlContent);
    }
  }, [htmlContent]);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const settings = {
        bgColor,
        imageFormat,
        imageQuality,
        pixelRatio,
        imageWidth,
        imageHeight,
      };
      localStorage.setItem('htmlToImage_settings', JSON.stringify(settings));
    }
  }, [bgColor, imageFormat, imageQuality, pixelRatio, imageWidth, imageHeight]);

  // Generate image from HTML content
  const generateImage = useCallback(async () => {
    if (!contentRef.current) return null;

    try {
      setIsGenerating(true);
      // Wait for any images to load
      const images = contentRef.current.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) resolve(true);
              img.onload = () => resolve(true);
              img.onerror = () => resolve(false);
            })
        )
      );

      // Set options for image generation
      const options: HtmlToImageOptions = {
        quality: imageQuality,
        pixelRatio: pixelRatio,
        backgroundColor: bgColor,
      };

      // Add optional width/height if specified
      if (imageWidth) options.width = parseInt(imageWidth);
      if (imageHeight) options.height = parseInt(imageHeight);

      // Generate image based on selected format
      let result;
      switch (imageFormat) {
        case 'jpeg':
          result = await htmlToImage.toJpeg(contentRef.current, options);
          break;
        case 'svg':
          result = await htmlToImage.toSvg(contentRef.current, options);
          break;
        case 'png':
        default:
          result = await htmlToImage.toPng(contentRef.current, options);
          break;
      }
      
      setIsGenerating(false);
      return result;
    } catch (err) {
      console.error('Error generating image:', err);
      setError('Error generating image. Make sure your HTML is valid and all resources are accessible.');
      setIsGenerating(false);
      return null;
    }
  }, [bgColor, imageFormat, imageHeight, imageQuality, imageWidth, pixelRatio]);

  // Update preview when content or background color changes
  useEffect(() => {
    const updatePreview = async () => {
      const dataUrl = await generateImage();

      if (dataUrl === 'data:,' || dataUrl === null) {
        setError('Error generating image. Make sure your HTML is valid and all resources are accessible.');
        setIsGenerating(false);
        return;
      }

      if (dataUrl) {
        setPreviewUrl(dataUrl);
        setError('');
      }
    };

    if (throttledHtmlContent?.trim() !== '') {
      updatePreview();
    } else {
      setPreviewUrl(null);
      setError('');
    }

    console.log('a', throttledHtmlContent, bgColor, imageFormat, imageQuality, pixelRatio, imageWidth, imageHeight);

  }, [throttledHtmlContent, bgColor, imageFormat, imageQuality, pixelRatio, imageWidth, imageHeight, generateImage]);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'html' && extension !== 'svg') {
      setError('Only .html and .svg files are supported');
      return;
    }

    try {
      const text = await file.text();
      setHtmlContent(text);
      setError('');
    } catch (err) {
      setError('Error reading file');
      console.error('Error reading file:', err);
    }
  };

  // Handle download
  const handleDownload = async () => {
    setDownloading(true);
    
    try {
      // Use existing preview image if available, otherwise generate a new one
      const dataUrl = previewUrl || await generateImage();
      
      if (dataUrl) {
        const link = document.createElement('a');
        link.download = `converted-content.${imageFormat}`;
        link.href = dataUrl;
        link.click();
        toast.success('Image downloaded');
      } else {
        toast.error('Failed to generate image');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download image');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden content for image generation */}
      <div style={{
        position: 'fixed',
        left: '-9999px',
        top: '-9999px',
        width: contentWidth <= 1 ? '100%' : 'auto'
      }}
      
      // style={{ width: contentWidth <= 1 ? '100%' : 'auto' }}
      >
        <div 
          ref={contentWrapperRef}
        >
          <div 
            ref={contentRef}
            dangerouslySetInnerHTML={{ __html: htmlContent }} 
          />
        </div>
      </div>

      {/* Header */}
      <header className="w-full pt-10 pb-8 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-3 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            XML2Image
          </h1>
          <p className="text-base text-muted-foreground">
            Convert XML, HTML, and SVG code to beautiful images
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-4 pb-8 flex justify-center w-full">
        <div className="max-w-7xl w-full max-h-screen">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            
            {/* Left Column - Controls */}
            <Card className="h-full overflow-scroll max-h-[700px]">
              <CardContent className="p-6 flex flex-col">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="html">HTML Content</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="html" className="flex-1 flex flex-col space-y-4 data-[state=inactive]:hidden">
                    <div className="flex-1 relative flex flex-col">
                      {isGenerating && <div className="absolute top-0 right-0 bg-muted p-1 rounded-bl text-xs text-muted-foreground">
                        <span className="text-amber-500 flex items-center"><Loader2 className="h-3 w-3 animate-spin mr-1" /> Generating preview...</span>
                      </div>}
                      <Textarea
                        id="html-content"
                        value={htmlContent}
                        onChange={(e) => setHtmlContent(e.target.value)}
                        placeholder="Enter your HTML content here..."
                        className="w-full h-80 font-mono text-sm resize-none"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".html,.svg"
                        onChange={handleFileUpload}
                      />
                      <p className="text-xs text-muted-foreground">
                        Supported: .html, .svg
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="settings" className="space-y-4 data-[state=inactive]:hidden">
                    <div className="space-y-2">
                      <label htmlFor="bgcolor" className="block text-sm font-medium">
                        Background Color
                      </label>
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-md border" 
                          style={{ backgroundColor: bgColor }}
                        />
                        <Input
                          id="bgcolor"
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-full h-10 cursor-pointer"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="imageFormat" className="block text-sm font-medium">
                        Image Format
                      </label>
                      <select
                        id="imageFormat"
                        value={imageFormat}
                        onChange={(e) => setImageFormat(e.target.value as 'png' | 'jpeg' | 'svg')}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="png">PNG</option>
                        <option value="jpeg">JPEG</option>
                        <option value="svg">SVG</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="imageQuality" className="block text-sm font-medium">
                        Quality: {imageQuality.toFixed(1)}
                      </label>
                      <input
                        id="imageQuality"
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.1"
                        value={imageQuality}
                        onChange={(e) => setImageQuality(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="pixelRatio" className="block text-sm font-medium">
                        Pixel Ratio: {pixelRatio}x
                      </label>
                      <input
                        id="pixelRatio"
                        type="range"
                        min="1"
                        max="4"
                        step="0.5"
                        value={pixelRatio}
                        onChange={(e) => setPixelRatio(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="imageWidth" className="block text-sm font-medium">
                          Width (optional)
                        </label>
                        <Input
                          id="imageWidth"
                          type="number"
                          placeholder="Auto"
                          value={imageWidth}
                          onChange={(e) => setImageWidth(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="imageHeight" className="block text-sm font-medium">
                          Height (optional)
                        </label>
                        <Input
                          id="imageHeight"
                          type="number"
                          placeholder="Auto"
                          value={imageHeight}
                          onChange={(e) => setImageHeight(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                {error && (
                  <div className="mt-4 rounded-md bg-destructive/10 p-3 text-destructive text-sm flex items-start">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="h-5 w-5 mr-2 flex-shrink-0"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="mt-4">
                  <Button 
                    onClick={handleDownload}
                    disabled={downloading || isGenerating || !throttledHtmlContent?.trim()}
                    className="w-full"
                  >
                    {downloading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </span>
                    ) : (
                      "Download Image"
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('htmlToImage_content');
                        localStorage.removeItem('htmlToImage_settings');
                        
                        // Reset state to defaults
                        setHtmlContent('<h1>Hello, World!</h1>');
                        setBgColor('#f3f4f6');
                        setImageFormat('png');
                        setImageQuality(1.0);
                        setPixelRatio(2);
                        setImageWidth('');
                        setImageHeight('');
                        
                        toast.success('Settings reset to defaults');
                      }
                    }}
                    variant="outline"
                    className="w-full mt-2"
                  >
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Right Column - Preview */}
                <div className="flex-1 relative rounded-md overflow-hidden border border-border bg-muted h-full max-h-[700px]">
                  <div 
                    className="absolute inset-0"
                    style={{ 
                      backgroundColor: bgColor,
                      backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.03) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.03) 75%), linear-gradient(45deg, rgba(0,0,0,0.03) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.03) 75%)',
                      backgroundSize: '20px 20px',
                      backgroundPosition: '0 0, 10px 10px'
                    }}
                  />
                  <div className="relative h-full flex items-center justify-center p-6">
                    { isGenerating ? (
                      <div className="text-center p-8">
                        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Generating preview...</p>
                      </div>
                    ) : previewUrl ? (
                      <Image 
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full max-h-full w-auto h-auto rounded-md shadow-sm"
                        style={{ objectFit: 'contain' }}
                        width={500}
                        height={300}
                        unoptimized
                      />
                    ) : (
                      <div className="text-center p-8">
                        {error ? (
                          <div className="flex flex-col items-center justify-center text-destructive">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                              className="h-10 w-10 mb-4"
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="8" x2="12" y2="12"></line>
                              <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <p>Error generating preview</p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Enter HTML content to see preview</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
} 