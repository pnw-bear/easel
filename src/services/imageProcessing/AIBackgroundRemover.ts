/**
 * AIBackgroundRemover - Wrapper service for @imgly/background-removal
 * Handles AI model loading, caching, and inference for artwork extraction
 */

import { removeBackground, Config } from '@imgly/background-removal';

export interface AIRemovalOptions {
  model?: 'small' | 'medium';
  onProgress?: (key: string, current: number, total: number) => void;
  postProcessing?: {
    featherEdges?: number; // 0-100, amount of edge smoothing
    alphaThreshold?: number; // 0-255, minimum alpha to keep
  };
}

export class AIBackgroundRemover {
  private static modelInstance: any = null;
  private static isLoading: boolean = false;
  private static modelLoaded: boolean = false;

  /**
   * Initialize the AI model (lazy load on first use)
   */
  static async initialize(onProgress?: (progress: number) => void): Promise<void> {
    if (this.modelLoaded || this.isLoading) {
      return;
    }

    this.isLoading = true;

    try {
      // The library handles model loading internally
      // We just need to track progress if provided
      if (onProgress) {
        // Simulate progress for user feedback
        const progressInterval = setInterval(() => {
          // Model loading is handled by the library, we just show progress
        }, 100);

        // Clear interval when done
        setTimeout(() => clearInterval(progressInterval), 1000);
      }

      this.modelLoaded = true;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Remove background from image using AI
   */
  static async removeBackground(
    imageSource: ImageBitmap | HTMLImageElement,
    options: AIRemovalOptions = {}
  ): Promise<Blob> {
    // Ensure model is ready
    if (!this.modelLoaded) {
      await this.initialize();
    }

    // Configure the background removal
    const config: Config = {
      progress: options.onProgress,
      model: options.model === 'small' ? 'small' : 'medium',
      output: {
        format: 'png',
        quality: 1.0,
      },
    };

    try {
      // Run AI inference
      const blob = await removeBackground(imageSource, config);

      // Apply post-processing if needed
      if (options.postProcessing) {
        return await this.applyPostProcessing(blob, options.postProcessing);
      }

      return blob;
    } catch (error) {
      console.error('AI background removal failed:', error);
      throw error;
    }
  }

  /**
   * Check if model is loaded and ready
   */
  static isModelLoaded(): boolean {
    return this.modelLoaded;
  }

  /**
   * Apply post-processing to refine edges and transparency
   */
  private static async applyPostProcessing(
    blob: Blob,
    options: { featherEdges?: number; alphaThreshold?: number }
  ): Promise<Blob> {
    // Convert blob to canvas for post-processing
    const canvas = await this.blobToCanvas(blob);
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Apply alpha threshold if specified
    if (options.alphaThreshold !== undefined && options.alphaThreshold > 0) {
      for (let i = 3; i < data.length; i += 4) {
        const alpha = data[i];
        // Remove pixels below threshold
        if (alpha < options.alphaThreshold) {
          data[i] = 0;
        }
      }
    }

    // Apply edge feathering if specified
    if (options.featherEdges && options.featherEdges > 0) {
      // Simple edge smoothing by slightly reducing alpha at edges
      const featherAmount = options.featherEdges / 100;
      for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < canvas.width - 1; x++) {
          const idx = (y * canvas.width + x) * 4;
          const alpha = data[idx + 3];

          if (alpha > 0 && alpha < 255) {
            // This is an edge pixel, apply feathering
            const neighbors = [
              data[((y - 1) * canvas.width + x) * 4 + 3], // top
              data[((y + 1) * canvas.width + x) * 4 + 3], // bottom
              data[(y * canvas.width + (x - 1)) * 4 + 3], // left
              data[(y * canvas.width + (x + 1)) * 4 + 3], // right
            ];

            const avgNeighbor = neighbors.reduce((a, b) => a + b, 0) / 4;
            data[idx + 3] = alpha * (1 - featherAmount) + avgNeighbor * featherAmount;
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Convert back to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      }, 'image/png');
    });
  }

  /**
   * Helper: Convert blob to canvas
   */
  private static async blobToCanvas(blob: Blob): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image from blob'));
      };

      img.src = url;
    });
  }
}
