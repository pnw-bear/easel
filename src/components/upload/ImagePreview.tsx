import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { rotateImage } from '../../store/imageSlice';
import { RotateCw, RotateCcw, Check } from 'lucide-react';

interface ImagePreviewProps {
  onConfirm: () => void;
}

function ImagePreview({ onConfirm }: ImagePreviewProps) {
  const dispatch = useDispatch();
  const originalImageUrl = useSelector((state: RootState) => state.image.originalImageUrl);
  const rotation = useSelector((state: RootState) => state.image.rotation);

  if (!originalImageUrl) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 lg:px-12 lg:py-12">
      {/* Preview Card */}
      <div className="bg-white rounded-2xl shadow-paper p-8">
        <h3 className="font-serif text-2xl text-ink-charcoal mb-6 text-center">
          Preview Your Artwork
        </h3>

        {/* Image Container */}
        <div className="relative flex items-center justify-center mb-6 min-h-[400px] bg-stone-50 rounded-xl overflow-hidden">
          <img
            src={originalImageUrl}
            alt="Uploaded artwork"
            className="max-w-full max-h-[500px] object-contain transition-transform duration-300"
            style={{ transform: `rotate(${rotation}deg)` }}
          />
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

        {/* Confirm Button */}
        <div className="text-center">
          <button
            onClick={onConfirm}
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
