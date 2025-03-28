'use client';

import { useRef, useState } from 'react';
import * as htmlToImage from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function HtmlToImageDemo() {
  const elementRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState('Hello, World!');
  const [bgColor, setBgColor] = useState('#f3f4f6');
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!elementRef.current) return;
    
    try {
      setDownloading(true);
      
      const dataUrl = await htmlToImage.toPng(elementRef.current, {
        quality: 1.0,
        pixelRatio: 2,
      });
      
      // Create a link element and trigger download
      const link = document.createElement('a');
      link.download = 'html-to-image-demo.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
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
              <label htmlFor="text" className="text-sm font-medium">Text Content</label>
              <Input
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to display"
              />
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
              ref={elementRef}
              style={{ backgroundColor: bgColor }}
              className="p-8 rounded-lg transition-colors duration-200 min-h-[200px] flex items-center justify-center"
            >
              <h2 className="text-2xl font-bold text-center break-words max-w-full">
                {text}
              </h2>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 