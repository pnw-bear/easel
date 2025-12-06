/**
 * ImageProcessor - Enhanced service for aggressively cleaning artwork images
 * Features: Auto-crop, AI background removal, stroke extraction
 */

import { AIBackgroundRemover } from './AIBackgroundRemover';

export interface ProcessingProgress {
  step: string;
  progress: number;
}

export interface CleanedVariant {
  id: string;
  name: string;
  type: 'clean' | 'bold-poster' | 'minimal-line-art';
  dataUrl: string;
}

export interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CleaningOptions {
  sensitivity: number; // 0-100, now controls post-processing refinement
  cropBox?: CropBox; // User-defined crop area (in display pixels)
  displayedImageSize?: { width: number; height: number }; // Size of image as displayed in browser
  useAI?: boolean; // Default: true, set false for legacy threshold algorithm
}

export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private onProgress?: (progress: ProcessingProgress) => void;

  constructor(onProgress?: (progress: ProcessingProgress) => void) {
    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Failed to get canvas context');
    this.onProgress = onProgress;
  }

  /**
   * Main processing pipeline with configurable sensitivity
   */
  async processImage(
    imageUrl: string,
    rotation: number,
    options: CleaningOptions = { sensitivity: 70 }
  ): Promise<CleanedVariant[]> {
    this.reportProgress('Loading image...', 10);

    // Load and rotate image
    const img = await this.loadImage(imageUrl);
    const rotatedCanvas = this.rotateImage(img, rotation);

    this.reportProgress('Cropping...', 20);
    // Use manual crop if provided, otherwise auto-detect
    const croppedCanvas = options.cropBox
      ? this.manualCrop(rotatedCanvas, options.cropBox, options.displayedImageSize)
      : this.autoCrop(rotatedCanvas);

    this.reportProgress('Removing background...', 35);
    const cleanedCanvas = options.useAI === false
      ? this.legacyBackgroundRemoval(croppedCanvas, options.sensitivity)
      : await this.aiBackgroundRemoval(croppedCanvas, options.sensitivity);

    // Generate variants
    const variants: CleanedVariant[] = [];

    this.reportProgress('Creating clean variant...', 50);
    const cleanVariant = await this.createCleanVariant(cleanedCanvas);
    variants.push(cleanVariant);

    this.reportProgress('Creating bold poster variant...', 70);
    const boldVariant = await this.createBoldPosterVariant(cleanedCanvas);
    variants.push(boldVariant);

    this.reportProgress('Creating line art variant...', 85);
    const lineArtVariant = await this.createLineArtVariant(cleanedCanvas);
    variants.push(lineArtVariant);

    this.reportProgress('Complete!', 100);

    return variants;
  }

  private async loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  private rotateImage(img: HTMLImageElement, rotation: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    if (rotation === 90 || rotation === 270) {
      canvas.width = img.height;
      canvas.height = img.width;
    } else {
      canvas.width = img.width;
      canvas.height = img.height;
    }

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    return canvas;
  }

  /**
   * Manual crop: Apply user-defined crop box
   */
  private manualCrop(
    sourceCanvas: HTMLCanvasElement,
    displayCropBox: CropBox,
    displayedImageSize?: { width: number; height: number }
  ): HTMLCanvasElement {
    const actualWidth = sourceCanvas.width;
    const actualHeight = sourceCanvas.height;

    // Use the displayed image size if provided, otherwise fall back to canvas size
    const displayWidth = displayedImageSize?.width || actualWidth;
    const displayHeight = displayedImageSize?.height || actualHeight;

    // Calculate scale from displayed size to actual canvas size
    const scaleX = actualWidth / displayWidth;
    const scaleY = actualHeight / displayHeight;

    const actualCropX = displayCropBox.x * scaleX;
    const actualCropY = displayCropBox.y * scaleY;
    const actualCropWidth = displayCropBox.width * scaleX;
    const actualCropHeight = displayCropBox.height * scaleY;

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = actualCropWidth;
    croppedCanvas.height = actualCropHeight;
    const ctx = croppedCanvas.getContext('2d')!;

    ctx.drawImage(
      sourceCanvas,
      actualCropX, actualCropY, actualCropWidth, actualCropHeight,
      0, 0, actualCropWidth, actualCropHeight
    );

    return croppedCanvas;
  }

  /**
   * Auto-crop: Aggressively zoom in on colored strokes only
   */
  private autoCrop(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = sourceCanvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    const data = imageData.data;
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;

    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;

    // Find bounds of COLORED content only (ignore gray/black sketchbook edges)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        const brightness = (r + g + b) / 3;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;

        // Only consider pixels that are:
        // 1. Not too bright (< 230 instead of 240)
        // 2. Have some color saturation (> 0.1)
        // This ignores white background AND gray sketchbook edges
        const isColoredStroke = brightness < 230 && saturation > 0.1;

        if (isColoredStroke) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    // If no colored content found, fallback to any dark content
    if (minX === width || minY === height) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const brightness = (r + g + b) / 3;

          if (brightness < 200) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }
    }

    // Very tight padding - just 10px
    const padding = 10;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(width - 1, maxX + padding);
    maxY = Math.min(height - 1, maxY + padding);

    const cropWidth = maxX - minX + 1;
    const cropHeight = maxY - minY + 1;

    // Create cropped canvas
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;
    const croppedCtx = croppedCanvas.getContext('2d')!;

    croppedCtx.drawImage(
      sourceCanvas,
      minX, minY, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    );

    return croppedCanvas;
  }

  /**
   * AI-powered background removal using @imgly/background-removal
   */
  private async aiBackgroundRemoval(
    sourceCanvas: HTMLCanvasElement,
    sensitivity: number
  ): Promise<HTMLCanvasElement> {
    try {
      // Check if model needs initialization
      if (!AIBackgroundRemover.isModelLoaded()) {
        this.reportProgress('Downloading AI model (one-time setup)...', 40);
        await AIBackgroundRemover.initialize((progress) => {
          this.reportProgress(`Loading model... ${progress}%`, 40 + progress * 0.1);
        });
      }

      this.reportProgress('Analyzing artwork...', 50);

      // Convert canvas to ImageBitmap for better performance
      const imageBitmap = await createImageBitmap(sourceCanvas);

      // Map sensitivity (0-100) to post-processing options
      // Higher sensitivity = crisper edges, less feathering, more aggressive alpha cutoff
      const postProcessing = {
        featherEdges: Math.max(0, 100 - sensitivity), // Higher sens = less feathering
        alphaThreshold: sensitivity * 2.55, // 0-100 → 0-255
      };

      this.reportProgress('Removing background with AI...', 60);

      // Run AI inference
      const resultBlob = await AIBackgroundRemover.removeBackground(imageBitmap, {
        model: 'medium',
        postProcessing,
        onProgress: (key: string, current: number, total: number) => {
          const progress = 60 + (current / total) * 20;
          this.reportProgress(`Processing... ${Math.round(progress)}%`, progress);
        }
      });

      this.reportProgress('Finalizing extraction...', 85);

      // Convert blob back to canvas
      const resultCanvas = await this.blobToCanvas(resultBlob);

      return resultCanvas;

    } catch (error) {
      console.error('AI background removal failed, falling back to legacy:', error);
      this.reportProgress('Using fallback algorithm...', 40);
      return this.legacyBackgroundRemoval(sourceCanvas, sensitivity);
    }
  }

  /**
   * Helper: Convert blob to canvas
   */
  private async blobToCanvas(blob: Blob): Promise<HTMLCanvasElement> {
    const img = await this.loadImage(URL.createObjectURL(blob));
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    return canvas;
  }

  /**
   * Legacy background removal: Threshold-based algorithm (fallback)
   * Only keep vibrant, colorful strokes
   */
  private legacyBackgroundRemoval(sourceCanvas: HTMLCanvasElement, sensitivity: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = sourceCanvas.width;
    canvas.height = sourceCanvas.height;
    const ctx = canvas.getContext('2d')!;

    ctx.drawImage(sourceCanvas, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Sensitivity mapping: 0-100 -> thresholds
    // Higher sensitivity = more aggressive removal = higher thresholds
    const brightnessThreshold = 220 - (sensitivity * 1.5); // 70 -> 115 (very aggressive)
    const saturationThreshold = 0.15 + (sensitivity / 500); // Minimum saturation required

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const brightness = (r + g + b) / 3;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturation = max === 0 ? 0 : (max - min) / max;

      // Remove if:
      // 1. Too bright (likely background/paper)
      // 2. Too desaturated (gray/black marks from pencil/shadows)
      const isTooBright = brightness > brightnessThreshold;
      const isDesaturated = saturation < saturationThreshold;

      if (isTooBright || isDesaturated) {
        // Make transparent
        data[i + 3] = 0;
      } else {
        // Keep and enhance saturation
        const enhanceFactor = 1.2;
        const avgValue = (max + min) / 2;

        data[i] = Math.min(255, avgValue + (r - avgValue) * enhanceFactor);
        data[i + 1] = Math.min(255, avgValue + (g - avgValue) * enhanceFactor);
        data[i + 2] = Math.min(255, avgValue + (b - avgValue) * enhanceFactor);
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  private async createCleanVariant(sourceCanvas: HTMLCanvasElement): Promise<CleanedVariant> {
    // Clean variant just uses the aggressively cleaned version
    return {
      id: 'clean',
      name: 'Clean Original',
      type: 'clean',
      dataUrl: sourceCanvas.toDataURL('image/png')
    };
  }

  private async createBoldPosterVariant(sourceCanvas: HTMLCanvasElement): Promise<CleanedVariant> {
    const canvas = document.createElement('canvas');
    canvas.width = sourceCanvas.width;
    canvas.height = sourceCanvas.height;
    const ctx = canvas.getContext('2d')!;

    ctx.drawImage(sourceCanvas, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Posterize and boost colors
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue; // Skip transparent

      // Posterize to fewer color levels
      const levels = 4;
      data[i] = Math.round(data[i] / (256 / levels)) * (256 / levels);
      data[i + 1] = Math.round(data[i + 1] / (256 / levels)) * (256 / levels);
      data[i + 2] = Math.round(data[i + 2] / (256 / levels)) * (256 / levels);

      // Extreme saturation boost
      const max = Math.max(data[i], data[i + 1], data[i + 2]);
      const min = Math.min(data[i], data[i + 1], data[i + 2]);
      const avgValue = (max + min) / 2;
      const boostFactor = 1.6;

      data[i] = Math.max(0, Math.min(255, avgValue + (data[i] - avgValue) * boostFactor));
      data[i + 1] = Math.max(0, Math.min(255, avgValue + (data[i + 1] - avgValue) * boostFactor));
      data[i + 2] = Math.max(0, Math.min(255, avgValue + (data[i + 2] - avgValue) * boostFactor));
    }

    ctx.putImageData(imageData, 0, 0);

    return {
      id: 'bold-poster',
      name: 'Bold Poster',
      type: 'bold-poster',
      dataUrl: canvas.toDataURL('image/png')
    };
  }

  private async createLineArtVariant(sourceCanvas: HTMLCanvasElement): Promise<CleanedVariant> {
    const canvas = document.createElement('canvas');
    canvas.width = sourceCanvas.width;
    canvas.height = sourceCanvas.height;
    const ctx = canvas.getContext('2d')!;

    ctx.drawImage(sourceCanvas, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Convert to grayscale first
    const grayData = new Uint8Array(data.length / 4);
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) {
        grayData[i / 4] = 255; // White for transparent
      } else {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        grayData[i / 4] = gray;
      }
    }

    // Edge detection
    const width = canvas.width;
    const height = canvas.height;

    // Fill with white first
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const pixelIdx = idx * 4;

        // Sobel operator for edge detection
        const gx =
          -grayData[(y - 1) * width + (x - 1)] + grayData[(y - 1) * width + (x + 1)] +
          -2 * grayData[y * width + (x - 1)] + 2 * grayData[y * width + (x + 1)] +
          -grayData[(y + 1) * width + (x - 1)] + grayData[(y + 1) * width + (x + 1)];

        const gy =
          -grayData[(y - 1) * width + (x - 1)] - 2 * grayData[(y - 1) * width + x] - grayData[(y - 1) * width + (x + 1)] +
          grayData[(y + 1) * width + (x - 1)] + 2 * grayData[(y + 1) * width + x] + grayData[(y + 1) * width + (x + 1)];

        const magnitude = Math.sqrt(gx * gx + gy * gy);

        // Strong edges become black lines
        if (magnitude > 40) {
          data[pixelIdx] = 0;
          data[pixelIdx + 1] = 0;
          data[pixelIdx + 2] = 0;
          data[pixelIdx + 3] = 255;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    return {
      id: 'minimal-line-art',
      name: 'Minimal Line Art',
      type: 'minimal-line-art',
      dataUrl: canvas.toDataURL('image/png')
    };
  }

  private reportProgress(step: string, progress: number) {
    if (this.onProgress) {
      this.onProgress({ step, progress });
    }
  }
}
