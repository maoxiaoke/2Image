"use client";

import { useEffect, useRef } from "react";

interface CanvasPreviewProps {
  content: string | HTMLImageElement; // Support both image URL and Image object
  contentWidth: number;
  contentHeight: number;
  maxWidth?: number;
  maxHeight?: number;
  className?: string;
}

export function CanvasPreview({
  content,
  contentWidth,
  contentHeight,
  maxWidth = 800,
  maxHeight = 600,
  className = "",
}: CanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate scaling ratio while maintaining aspect ratio
    const contentRatio = contentWidth / contentHeight;
    const maxRatio = maxWidth / maxHeight;

    let targetWidth = maxWidth;
    let targetHeight = maxHeight;

    if (contentRatio > maxRatio) {
      // Content is wider than container
      targetHeight = targetWidth / contentRatio;
    } else {
      // Content is taller than container
      targetWidth = targetHeight * contentRatio;
    }

    // Set canvas dimensions
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, targetWidth, targetHeight);

    // Draw content
    const drawContent = () => {
      if (typeof content === "string") {
        // If content is an image URL
        const img = new Image();
        img.src = content;
        img.onload = () => {
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        };
      } else {
        // If content is already an Image object
        ctx.drawImage(content, 0, 0, targetWidth, targetHeight);
      }
    };

    drawContent();

    // Cleanup function
    return () => {
      ctx.clearRect(0, 0, targetWidth, targetHeight);
    };
  }, [content, contentWidth, contentHeight, maxWidth, maxHeight]);

  return (
    <canvas
      ref={canvasRef}
      className={`block ${className}`}
      role="img"
      aria-label="Preview canvas"
    />
  );
} 