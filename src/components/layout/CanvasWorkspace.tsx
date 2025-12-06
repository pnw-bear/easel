import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Maximize2, RotateCcw, Upload } from 'lucide-react';

function CanvasWorkspace() {
  const currentImageUrl = useSelector((state: RootState) => state.image.currentImageUrl);
  const isProcessing = useSelector((state: RootState) => state.image.isProcessing);
  const processingMessage = useSelector((state: RootState) => state.image.processingMessage);
  const rotation = useSelector((state: RootState) => state.image.rotation);

  const handleFullscreen = () => {
    // TODO: Implement fullscreen functionality
    console.log('Fullscreen clicked');
  };

  const handleReset = () => {
    // TODO: Implement reset/fit to screen functionality
    console.log('Reset clicked');
  };

  return (
    <div className="h-full flex flex-col bg-stone-50 relative">
      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={handleFullscreen}
          className="p-2 bg-white border border-stone-200 rounded-lg text-stone-600 hover:text-ink-red hover:border-ink-red transition-all shadow-sm"
          title="Fullscreen"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-white border border-stone-200 rounded-lg text-stone-600 hover:text-ink-red hover:border-ink-red transition-all shadow-sm"
          title="Reset view"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-8 bg-stone-100/50">
        {currentImageUrl ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={currentImageUrl}
              alt="Artwork preview"
              className="max-w-full max-h-full object-contain shadow-paper-lift rounded-lg transition-transform duration-300"
              style={{
                transform: `rotate(${rotation}deg)`,
                maxHeight: '85vh',
                maxWidth: '95%'
              }}
            />
          </div>
        ) : (
          <div className="text-center text-stone-400">
            <Upload className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="font-sans text-lg">No artwork loaded</p>
            <p className="font-sans text-sm mt-2">Upload an image to get started</p>
          </div>
        )}
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="text-center max-w-md">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-stone-200 border-t-warm-orange mb-6"></div>
            <p className="font-serif text-2xl text-ink-charcoal font-medium mb-2">
              {processingMessage || 'Processing...'}
            </p>
            <p className="font-sans text-sm text-stone-500">
              {processingMessage?.includes('Downloading') || processingMessage?.includes('Loading model')
                ? 'One-time setup - model will be cached for future use'
                : 'Using AI for accurate extraction at full resolution'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CanvasWorkspace;
