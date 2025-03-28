'use client';

import { useRef, useState } from 'react';
import * as htmlToImage from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function HtmlToImageDemo() {
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [htmlContent, setHtmlContent] = useState('<h1>Hello, World!</h1>');
  const [bgColor, setBgColor] = useState('#f3f4f6');
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file extension
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

  const handleDownload = async () => {
    if (!contentRef.current) return;

    try {
      setDownloading(true);
      setError('');

      // Find all images in the content
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

      const dataUrl = await htmlToImage.toPng(contentRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: bgColor,
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = 'converted-content.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      setError('Error generating image. Make sure your HTML is valid and all resources are accessible.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">HTML to Image Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="html-content" className="text-sm font-medium">HTML Content</label>
              <Textarea
                id="html-content"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="Enter HTML content"
                className="font-mono h-[400px] resize-none overflow-auto"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="file-upload" className="text-sm font-medium">Upload HTML/SVG File</label>
              <Input
                id="file-upload"
                type="file"
                accept=".html,.svg"
                onChange={handleFileUpload}
                ref={fileInputRef}
              />
              <p className="text-xs text-gray-500">Supported formats: .html, .svg</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="bgcolor" className="text-sm font-medium">Background Color</label>
              <Input
                id="bgcolor"
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            
            <Button 
              onClick={handleDownload}
              disabled={downloading}
              className="w-full"
            >
              {downloading ? 'Generating...' : 'Download as PNG'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              style={{ backgroundColor: bgColor }}
              className="p-8 rounded-lg transition-colors duration-200 min-h-[400px] flex items-center justify-center"
            >
              <div 
                dangerouslySetInnerHTML={{ __html: htmlContent }} 
                ref={contentRef} 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 