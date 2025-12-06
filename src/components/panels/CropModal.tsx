import { useState, useRef, useEffect } from 'react';
import { X, Maximize2 } from 'lucide-react';

interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropModalProps {
  imageUrl: string;
  rotation: number;
  onConfirm: (cropBox: CropBox, displayedSize: { width: number; height: number }) => void;
  onCancel: () => void;
}

function CropModal({ imageUrl, rotation, onConfirm, onCancel }: CropModalProps) {
  const [cropBox, setCropBox] = useState<CropBox | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-detect crop box on image load
  useEffect(() => {
    if (!imageUrl || !imageRef.current) return;

    const img = imageRef.current;
    if (!img.complete) {
      img.onload = () => {
        requestAnimationFrame(() => detectCropBox());
      };
    } else {
      requestAnimationFrame(() => detectCropBox());
    }
  }, [imageUrl, rotation]);

  const detectCropBox = () => {
    if (!imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const imgRect = img.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    const imgLeft = imgRect.left - containerRect.left;
    const imgTop = imgRect.top - containerRect.top;

    const margin = 0.1;
    setCropBox({
      x: imgLeft + imgRect.width * margin,
      y: imgTop + imgRect.height * margin,
      width: imgRect.width * (1 - 2 * margin),
      height: imgRect.height * (1 - 2 * margin),
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

    const imgRect = imageRef.current.getBoundingClientRect();
    const imgLeft = imgRect.left - containerRect.left;
    const imgTop = imgRect.top - containerRect.top;

    if (isDragging) {
      const x = mouseX - dragStart.x;
      const y = mouseY - dragStart.y;

      const minX = imgLeft;
      const minY = imgTop;
      const maxX = imgLeft + imgRect.width - cropBox.width;
      const maxY = imgTop + imgRect.height - cropBox.height;

      setCropBox({
        ...cropBox,
        x: Math.max(minX, Math.min(x, maxX)),
        y: Math.max(minY, Math.min(y, maxY)),
      });
    }

    if (isResizing && resizeCorner) {
      const minSize = 50;
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

      if (
        newBox.width >= minSize &&
        newBox.height >= minSize &&
        newBox.x >= imgLeft &&
        newBox.y >= imgTop &&
        newBox.x + newBox.width <= imgLeft + imgRect.width &&
        newBox.y + newBox.height <= imgTop + imgRect.height
      ) {
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

  const convertCropBoxToImageCoordinates = (containerCropBox: CropBox): CropBox => {
    if (!imageRef.current || !containerRef.current) return containerCropBox;

    const imgRect = imageRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const imgLeft = imgRect.left - containerRect.left;
    const imgTop = imgRect.top - containerRect.top;

    return {
      x: containerCropBox.x - imgLeft,
      y: containerCropBox.y - imgTop,
      width: containerCropBox.width,
      height: containerCropBox.height,
    };
  };

  const handleConfirm = () => {
    if (cropBox && imageRef.current) {
      const imageCropBox = convertCropBoxToImageCoordinates(cropBox);
      const imgRect = imageRef.current.getBoundingClientRect();
      const displayedSize = { width: imgRect.width, height: imgRect.height };

      onConfirm(imageCropBox, displayedSize);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-paper-lift w-[90vw] h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <h3 className="font-serif text-2xl text-ink-charcoal">Crop Artwork</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="flex-1 p-6 overflow-hidden">
          <div
            ref={containerRef}
            className="relative w-full h-full flex items-center justify-center bg-stone-50 rounded-xl overflow-hidden select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Crop preview"
              className="max-w-full max-h-full object-contain transition-transform duration-300"
              style={{ transform: `rotate(${rotation}deg)` }}
              draggable={false}
            />

            {cropBox && (
              <>
                <div className="absolute inset-0 bg-black/40 pointer-events-none" />

                <div
                  className="absolute border-4 border-warm-orange bg-transparent cursor-move"
                  style={{
                    left: `${cropBox.x}px`,
                    top: `${cropBox.y}px`,
                    width: `${cropBox.width}px`,
                    height: `${cropBox.height}px`,
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)',
                  }}
                  onMouseDown={handleMouseDown}
                >
                  {/* Corner handles */}
                  <div
                    className="absolute -top-2 -left-2 w-6 h-6 bg-warm-orange rounded-full border-2 border-white cursor-nwse-resize hover:scale-125 transition-transform z-10"
                    onMouseDown={(e) => handleResizeStart('top-left', e)}
                  />
                  <div
                    className="absolute -top-2 -right-2 w-6 h-6 bg-warm-orange rounded-full border-2 border-white cursor-nesw-resize hover:scale-125 transition-transform z-10"
                    onMouseDown={(e) => handleResizeStart('top-right', e)}
                  />
                  <div
                    className="absolute -bottom-2 -left-2 w-6 h-6 bg-warm-orange rounded-full border-2 border-white cursor-nesw-resize hover:scale-125 transition-transform z-10"
                    onMouseDown={(e) => handleResizeStart('bottom-left', e)}
                  />
                  <div
                    className="absolute -bottom-2 -right-2 w-6 h-6 bg-warm-orange rounded-full border-2 border-white cursor-nwse-resize hover:scale-125 transition-transform z-10"
                    onMouseDown={(e) => handleResizeStart('bottom-right', e)}
                  />

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-warm-orange text-white px-3 py-1 rounded-full text-xs font-medium pointer-events-none">
                    {isResizing ? 'Resize' : isDragging ? 'Moving' : 'Drag or resize corners'}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-stone-200">
          <button
            onClick={resetCropBox}
            className="flex items-center gap-2 px-4 py-2 border-2 border-stone-200 rounded-lg text-ink-charcoal hover:border-warm-orange hover:text-warm-orange transition-all"
          >
            <Maximize2 className="w-4 h-4" />
            Reset Crop
          </button>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-3 border-2 border-stone-200 rounded-xl text-ink-charcoal hover:bg-stone-100 transition-all font-sans font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-3 bg-gradient-to-r from-warm-orange to-warm-yellow text-white rounded-xl font-sans font-semibold shadow-watercolor-orange hover:scale-[1.02] transition-all"
            >
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CropModal;
export type { CropBox };
