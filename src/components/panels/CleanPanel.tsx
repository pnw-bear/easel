import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateCleanSettings, resetCleanSettings, pushHistory, setProcessing, rotateImage, resetRotation } from '../../store/imageSlice';
import { Wand2, RotateCcw, RotateCw, Check, Lightbulb, Zap, Crop } from 'lucide-react';
import { ImageProcessor } from '../../services/imageProcessing/ImageProcessor';
import { AIBackgroundRemover } from '../../services/imageProcessing/AIBackgroundRemover';
import toast from 'react-hot-toast';
import CropModal, { CropBox } from './CropModal';

function CleanPanel() {
  const dispatch = useDispatch();
  const cleanSettings = useSelector((state: RootState) => state.image.cleanSettings);
  const artworkDetails = useSelector((state: RootState) => state.image.artworkDetails);
  const originalImageUrl = useSelector((state: RootState) => state.image.originalImageUrl);
  const rotation = useSelector((state: RootState) => state.image.rotation);
  const isProcessing = useSelector((state: RootState) => state.image.isProcessing);

  const [showCropModal, setShowCropModal] = useState(false);
  const [cropBox, setCropBox] = useState<CropBox | null>(null);
  const [displayedSize, setDisplayedSize] = useState<{ width: number; height: number } | null>(null);

  const handleRefinementChange = (value: number) => {
    dispatch(updateCleanSettings({ refinement: value }));
  };

  const handleReset = () => {
    dispatch(resetCleanSettings());
  };

  const handlePresetClick = (preset: 'light' | 'balanced' | 'strong') => {
    switch (preset) {
      case 'light':
        dispatch(updateCleanSettings({ refinement: 35 }));
        break;
      case 'balanced':
        dispatch(updateCleanSettings({ refinement: 65 }));
        break;
      case 'strong':
        dispatch(updateCleanSettings({ refinement: 90 }));
        break;
    }
  };

  const handleCropConfirm = (crop: CropBox, displayed: { width: number; height: number }) => {
    setCropBox(crop);
    setDisplayedSize(displayed);
    setShowCropModal(false);
    toast.success('Crop area selected');
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
  };

  const handleApplyClean = async () => {
    if (!originalImageUrl) return;

    try {
      dispatch(setProcessing({ isProcessing: true, message: 'Cleaning your artwork...' }));

      const processor = new ImageProcessor((progress) => {
        dispatch(setProcessing({ isProcessing: true, message: progress.step }));
      });

      // Use refinement setting for AI post-processing
      const sensitivity = cleanSettings.refinement;

      const variants = await processor.processImage(originalImageUrl, rotation, {
        sensitivity,
        cropBox: cropBox || undefined,
        displayedImageSize: displayedSize || undefined,
      });

      // Use the first variant (clean) as the cleaned version
      const cleanedVariant = variants[0];

      // Reset rotation to 0 BEFORE adding to history since the rotation is now baked into the processed image
      dispatch(resetRotation());

      // Add to history
      dispatch(
        pushHistory({
          label: 'Cleaned',
          imageUrl: cleanedVariant.dataUrl,
          tool: 'clean',
          metadata: {
            refinement: cleanSettings.refinement,
            rotation: rotation, // Save the rotation that was applied
            crop: cropBox,
          },
        })
      );

      dispatch(setProcessing({ isProcessing: false }));
      toast.success('Image cleaned successfully!');

      // Reset crop after applying
      setCropBox(null);
      setDisplayedSize(null);
    } catch (error) {
      console.error('Cleaning failed:', error);
      dispatch(setProcessing({ isProcessing: false }));
      toast.error('Failed to clean image. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-ink-red" />
          <h3 className="font-serif text-xl text-ink-charcoal">Clean Artwork</h3>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-stone-500 hover:text-ink-red transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Rotation Controls */}
      <div>
        <h4 className="font-serif text-base text-ink-charcoal mb-3">Orientation</h4>
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(rotateImage('ccw'))}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-stone-200 rounded-xl text-ink-charcoal hover:border-ink-red hover:bg-ink-red/5 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="font-sans text-sm font-medium">Rotate Left</span>
          </button>
          <button
            onClick={() => dispatch(rotateImage('cw'))}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-stone-200 rounded-xl text-ink-charcoal hover:border-ink-red hover:bg-ink-red/5 transition-all"
          >
            <RotateCw className="w-5 h-5" />
            <span className="font-sans text-sm font-medium">Rotate Right</span>
          </button>
        </div>
        <p className="text-xs text-stone-500 mt-2 text-center">
          Current rotation: {rotation}°
        </p>
      </div>

      {/* Divider */}
      <div className="ink-divider"></div>

      {/* Crop Toggle */}
      <div>
        <button
          onClick={() => setShowCropModal(true)}
          className={`
            w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-sans text-sm font-medium transition-all
            ${
              cropBox
                ? 'bg-warm-orange text-white shadow-watercolor-orange'
                : 'bg-white border-2 border-stone-200 text-ink-charcoal hover:border-warm-orange hover:bg-warm-orange/5'
            }
          `}
        >
          <Crop className="w-5 h-5" />
          {cropBox ? 'Crop Area Selected' : 'Select Crop Area'}
        </button>
        {cropBox && (
          <p className="text-xs text-stone-500 mt-2 text-center">
            Crop will be applied when you click "Apply Clean"
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="ink-divider"></div>

      {/* Refinement Slider */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="font-serif text-base text-ink-charcoal">
            Refinement
          </label>
          <span className="text-lg font-bold text-warm-orange">
            {cleanSettings.refinement}%
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={cleanSettings.refinement}
          onChange={(e) => handleRefinementChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #F5A623 0%, #D33A2C ${cleanSettings.refinement}%, #E5E7E4 ${cleanSettings.refinement}%, #E5E7E4 100%)`
          }}
        />

        <div className="flex items-center justify-between mt-2 text-xs text-stone-500">
          <span>Soft Edges</span>
          <span>Sharp Edges</span>
        </div>

        <p className="text-xs text-stone-600 mt-3">
          AI extracts artwork automatically. Adjust refinement for softer (lower) or crisper (higher) edges.
        </p>
      </div>

      {/* Apply Button */}
      <button
        onClick={handleApplyClean}
        disabled={isProcessing}
        className={`
          w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-sans font-semibold text-base transition-all
          ${
            isProcessing
              ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-ink-red to-warm-orange text-white shadow-watercolor-red hover:shadow-watercolor-orange hover:scale-[1.02]'
          }
        `}
      >
        <Check className="w-5 h-5" />
        {isProcessing ? 'Processing...' : 'Apply Clean'}
      </button>

      {/* Divider */}
      <div className="ink-divider"></div>

      {/* Quick Presets */}
      <div>
        <h4 className="font-serif text-base text-ink-charcoal mb-3">Quick Presets</h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handlePresetClick('light')}
            className="flex flex-col items-center gap-2 px-3 py-3 rounded-lg border-2 border-stone-200 hover:border-warm-orange hover:bg-warm-orange/5 transition-all"
          >
            <Lightbulb className="w-5 h-5 text-stone-500" />
            <span className="text-xs font-sans font-medium text-stone-600">Soft</span>
          </button>
          <button
            onClick={() => handlePresetClick('balanced')}
            className="flex flex-col items-center gap-2 px-3 py-3 rounded-lg border-2 border-warm-orange bg-warm-orange/5 transition-all"
          >
            <Wand2 className="w-5 h-5 text-warm-orange" />
            <span className="text-xs font-sans font-medium text-warm-orange">Balanced</span>
          </button>
          <button
            onClick={() => handlePresetClick('strong')}
            className="flex flex-col items-center gap-2 px-3 py-3 rounded-lg border-2 border-stone-200 hover:border-warm-orange hover:bg-warm-orange/5 transition-all"
          >
            <Zap className="w-5 h-5 text-stone-500" />
            <span className="text-xs font-sans font-medium text-stone-600">Crisp</span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="ink-divider"></div>

      {/* AI Model Notice - Show only on first use */}
      {!AIBackgroundRemover.isModelLoaded() && (
        <div className="bg-warm-orange/10 rounded-xl p-4 border border-warm-orange/20">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-warm-orange flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-serif text-sm text-ink-charcoal font-medium mb-1">
                AI-Powered Extraction
              </h5>
              <p className="text-xs text-stone-600 leading-relaxed">
                First-time setup: We'll download a 40MB AI model for accurate background removal.
                This happens once and takes 10-30 seconds. The model is cached for future use.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="ink-divider"></div>

      {/* Pro Tip */}
      <div className="bg-cerulean/10 rounded-xl p-4 border border-cerulean/20">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-cerulean flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-serif text-sm text-ink-charcoal font-medium mb-1">Pro Tip</h5>
            <p className="text-xs text-stone-600 leading-relaxed">
              AI extraction happens at full resolution ({artworkDetails.originalSize?.width} × {artworkDetails.originalSize?.height} px)
              for print quality. First processing may take 10-30s for model download, then 2-5s per image.
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="ink-divider"></div>

      {/* Artwork Details */}
      <div>
        <h4 className="font-serif text-base text-ink-charcoal mb-3">Artwork Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">Original Size</span>
            <span className="text-ink-charcoal font-medium">
              {artworkDetails.originalSize
                ? `${artworkDetails.originalSize.width} × ${artworkDetails.originalSize.height} px`
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">File Format</span>
            <span className="text-ink-charcoal font-medium">
              {artworkDetails.fileFormat || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Color Space</span>
            <span className="text-ink-charcoal font-medium">
              {artworkDetails.colorSpace}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">DPI</span>
            <span className="text-ink-charcoal font-medium">
              {artworkDetails.dpi}
            </span>
          </div>
        </div>
      </div>

      {/* Crop Modal */}
      {showCropModal && originalImageUrl && (
        <CropModal
          imageUrl={originalImageUrl}
          rotation={rotation}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}

export default CleanPanel;
