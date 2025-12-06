import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { rotateImage } from '../../store/imageSlice';
import { RotateCw, RotateCcw, Check, Sliders, Maximize2 } from 'lucide-react';

interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImagePreviewProps {
  onConfirm: (sensitivity: number, cropBox?: CropBox, displayedSize?: { width: number; height: number }) => void;
}

function ImagePreview({ onConfirm }: ImagePreviewProps) {
  const dispatch = useDispatch();
  const originalImageUrl = useSelector((state: RootState) => state.image.originalImageUrl);
  const rotation = useSelector((state: RootState) => state.image.rotation);
  const [sensitivity, setSensitivity] = useState(70);
  const [cropBox, setCropBox] = useState<CropBox | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-detect crop box on image load
  useEffect(() => {
    if (!originalImageUrl || !imageRef.current) return;

    const img = imageRef.current;
    if (!img.complete) {
      img.onload = () => {
        // Wait for next frame to ensure layout is complete
        requestAnimationFrame(() => detectCropBox());
      };
    } else {
      // Wait for next frame to ensure layout is complete after rotation
      requestAnimationFrame(() => detectCropBox());
    }
  }, [originalImageUrl, rotation]);

  const detectCropBox = () => {
    if (!imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const imgRect = img.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    // Calculate image position relative to container
    const imgLeft = imgRect.left - containerRect.left;
    const imgTop = imgRect.top - containerRect.top;

    // Start with 10% margin relative to image
    const margin = 0.1;
    setCropBox({
      x: imgLeft + (imgRect.width * margin),
      y: imgTop + (imgRect.height * margin),
      width: imgRect.width * (1 - 2 * margin),
      height: imgRect.height * (1 - 2 * margin)
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || !cropBox) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({ x: x - cropBox.x, y: y - cropBox.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !cropBox || !imageRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - containerRect.left;
    const mouseY = e.clientY - containerRect.top;

    // Get image bounds in container coordinates
    const imgRect = imageRef.current.getBoundingClientRect();
    const imgLeft = imgRect.left - containerRect.left;
    const imgTop = imgRect.top - containerRect.top;

    // Handle dragging (move entire box)
    if (isDragging) {
      const x = mouseX - dragStart.x;
      const y = mouseY - dragStart.y;

      // Constrain to image bounds
      const minX = imgLeft;
      const minY = imgTop;
      const maxX = imgLeft + imgRect.width - cropBox.width;
      const maxY = imgTop + imgRect.height - cropBox.height;

      setCropBox({
        ...cropBox,
        x: Math.max(minX, Math.min(x, maxX)),
        y: Math.max(minY, Math.min(y, maxY))
      });
    }

    // Handle resizing
    if (isResizing && resizeCorner) {
      const minSize = 50; // Minimum crop box size
      let newBox = { ...cropBox };

      switch (resizeCorner) {
        case 'top-left':
          newBox.width = cropBox.width + (cropBox.x - mouseX);
          newBox.height = cropBox.height + (cropBox.y - mouseY);
          newBox.x = mouseX;
          newBox.y = mouseY;
          break;
        case 'top-right':
          newBox.width = mouseX - cropBox.x;
          newBox.height = cropBox.height + (cropBox.y - mouseY);
          newBox.y = mouseY;
          break;
        case 'bottom-left':
          newBox.width = cropBox.width + (cropBox.x - mouseX);
          newBox.height = mouseY - cropBox.y;
          newBox.x = mouseX;
          break;
        case 'bottom-right':
          newBox.width = mouseX - cropBox.x;
          newBox.height = mouseY - cropBox.y;
          break;
      }

      // Constrain to minimum size and image bounds
      if (newBox.width >= minSize && newBox.height >= minSize &&
          newBox.x >= imgLeft && newBox.y >= imgTop &&
          newBox.x + newBox.width <= imgLeft + imgRect.width &&
          newBox.y + newBox.height <= imgTop + imgRect.height) {
        setCropBox(newBox);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeCorner(null);
  };

  const handleResizeStart = (corner: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeCorner(corner);
  };

  const resetCropBox = () => {
    detectCropBox();
  };

  // Convert crop box from container coordinates to image-relative coordinates
  // Returns coordinates relative to the DISPLAYED image (accounting for rotation)
  const convertCropBoxToImageCoordinates = (containerCropBox: CropBox): CropBox => {
    if (!imageRef.current || !containerRef.current) return containerCropBox;

    const imgRect = imageRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const imgLeft = imgRect.left - containerRect.left;
    const imgTop = imgRect.top - containerRect.top;

    // Convert from container coordinates to image-displayed coordinates
    // These are relative to the displayed (possibly rotated) image
    return {
      x: containerCropBox.x - imgLeft,
      y: containerCropBox.y - imgTop,
      width: containerCropBox.width,
      height: containerCropBox.height
    };
  };

  const handleConfirm = () => {
    if (cropBox && imageRef.current) {
      const imageCropBox = convertCropBoxToImageCoordinates(cropBox);
      const imgRect = imageRef.current.getBoundingClientRect();
      const displayedSize = { width: imgRect.width, height: imgRect.height };

      onConfirm(sensitivity, imageCropBox, displayedSize);
    } else {
      onConfirm(sensitivity);
    }
  };

  if (!originalImageUrl) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 lg:px-12 lg:py-12">
      {/* Preview Card */}
      <div className="bg-white rounded-2xl shadow-paper p-8">
        <h3 className="font-serif text-2xl text-ink-charcoal mb-6 text-center">
          Preview Your Artwork
        </h3>

        {/* Image Container with Crop Box */}
        <div
          ref={containerRef}
          className="relative flex items-center justify-center mb-6 min-h-[400px] bg-stone-50 rounded-xl overflow-hidden select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            ref={imageRef}
            src={originalImageUrl}
            alt="Uploaded artwork"
            className="max-w-full max-h-[500px] object-contain transition-transform duration-300"
            style={{ transform: `rotate(${rotation}deg)` }}
            draggable={false}
          />

          {/* Interactive Crop Box */}
          {cropBox && (
            <>
              {/* Overlay - darken outside crop */}
              <div className="absolute inset-0 bg-black/40 pointer-events-none" />

              {/* Crop Box */}
              <div
                className="absolute border-4 border-ink-red bg-transparent cursor-move"
                style={{
                  left: `${cropBox.x}px`,
                  top: `${cropBox.y}px`,
                  width: `${cropBox.width}px`,
                  height: `${cropBox.height}px`,
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)'
                }}
                onMouseDown={handleMouseDown}
              >
                {/* Corner handles - resizable */}
                <div
                  className="absolute -top-2 -left-2 w-6 h-6 bg-ink-red rounded-full border-2 border-white cursor-nwse-resize hover:scale-125 transition-transform z-10"
                  onMouseDown={(e) => handleResizeStart('top-left', e)}
                />
                <div
                  className="absolute -top-2 -right-2 w-6 h-6 bg-ink-red rounded-full border-2 border-white cursor-nesw-resize hover:scale-125 transition-transform z-10"
                  onMouseDown={(e) => handleResizeStart('top-right', e)}
                />
                <div
                  className="absolute -bottom-2 -left-2 w-6 h-6 bg-ink-red rounded-full border-2 border-white cursor-nesw-resize hover:scale-125 transition-transform z-10"
                  onMouseDown={(e) => handleResizeStart('bottom-left', e)}
                />
                <div
                  className="absolute -bottom-2 -right-2 w-6 h-6 bg-ink-red rounded-full border-2 border-white cursor-nwse-resize hover:scale-125 transition-transform z-10"
                  onMouseDown={(e) => handleResizeStart('bottom-right', e)}
                />

                {/* Center label */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-ink-red text-white px-3 py-1 rounded-full text-xs font-medium pointer-events-none">
                  {isResizing ? 'Resize' : isDragging ? 'Moving' : 'Drag or resize corners'}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Crop Controls */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            onClick={resetCropBox}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-stone-200 rounded-lg text-ink-charcoal hover:border-ink-red hover:text-ink-red transition-all text-sm font-medium"
          >
            <Maximize2 className="w-4 h-4" />
            Reset Crop
          </button>
          <span className="text-xs text-stone-500">
            Drag to move • Pull corners to resize
          </span>
        </div>

        {/* Rotation Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => dispatch(rotateImage('ccw'))}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-stone-200 rounded-xl text-ink-charcoal hover:border-ink-red hover:text-ink-red transition-all shadow-sm hover:shadow-md"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="font-sans text-sm font-medium">Rotate Left</span>
          </button>

          <button
            onClick={() => dispatch(rotateImage('cw'))}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-stone-200 rounded-xl text-ink-charcoal hover:border-ink-red hover:text-ink-red transition-all shadow-sm hover:shadow-md"
          >
            <RotateCw className="w-5 h-5" />
            <span className="font-sans text-sm font-medium">Rotate Right</span>
          </button>
        </div>

        {/* Cleaning Sensitivity Slider */}
        <div className="mb-8 p-6 bg-stone-50 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <Sliders className="w-5 h-5 text-ink-red" />
            <h4 className="font-serif text-lg text-ink-charcoal">
              Cleaning Strength
            </h4>
          </div>
          <p className="text-sm text-stone-600 mb-4">
            Adjust how aggressively we remove background and faint marks
          </p>

          <div className="flex items-center gap-4">
            <span className="text-sm text-stone-500 font-medium min-w-[80px]">Light Clean</span>
            <input
              type="range"
              min="30"
              max="90"
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              className="flex-1 h-3 bg-gradient-to-r from-warm-orange/20 via-ink-red/40 to-cerulean/60 rounded-full appearance-none cursor-pointer"
              style={{
                WebkitAppearance: 'none',
                background: `linear-gradient(to right, #F5A623 0%, #D33A2C ${sensitivity}%, #2B82C6 100%)`
              }}
            />
            <span className="text-sm text-stone-500 font-medium min-w-[80px] text-right">Deep Clean</span>
          </div>
          <div className="mt-2 text-center">
            <span className="text-xs text-stone-500">
              {sensitivity < 50 && 'Keeps most colors and details'}
              {sensitivity >= 50 && sensitivity < 75 && 'Balanced - removes background, keeps strong strokes'}
              {sensitivity >= 75 && 'Aggressive - only keeps vibrant colors'}
            </span>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="text-center">
          <button
            onClick={handleConfirm}
            className="inline-flex items-center gap-3 px-8 py-4 bg-ink-red text-white rounded-xl font-sans font-semibold text-lg shadow-watercolor-red hover:bg-ink-charcoal transition-all hover:scale-105"
          >
            <Check className="w-6 h-6" />
            Looks Good - Start Cleaning
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImagePreview;
export type { CropBox };
