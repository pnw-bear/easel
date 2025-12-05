import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { selectVariant } from '../../store/imageSlice';
import { Check } from 'lucide-react';

function CleaningPanel() {
  const dispatch = useDispatch();
  const cleaningProgress = useSelector((state: RootState) => state.image.cleaningProgress);
  const cleanedVariants = useSelector((state: RootState) => state.image.cleanedVariants);
  const isProcessing = useSelector((state: RootState) => state.image.isProcessing);

  const handleSelectVariant = (variantId: string) => {
    dispatch(selectVariant(variantId));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 lg:px-12 lg:py-12">
      {/* Processing State */}
      {isProcessing && cleaningProgress && (
        <div className="bg-white rounded-2xl shadow-paper p-8 mb-8">
          <h3 className="font-serif text-2xl text-ink-charcoal mb-4 text-center">
            Cleaning Your Artwork
          </h3>

          {/* Progress Bar */}
          <div className="w-full bg-stone-100 rounded-full h-4 mb-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-warm-orange via-ink-red to-cerulean h-full rounded-full transition-all duration-500"
              style={{ width: `${cleaningProgress.progress}%` }}
            />
          </div>

          <p className="text-center text-stone-600 font-sans text-sm">
            {cleaningProgress.step}
          </p>
        </div>
      )}

      {/* Variants Grid */}
      {!isProcessing && cleanedVariants.length > 0 && (
        <div>
          <h3 className="font-serif text-3xl text-ink-charcoal mb-8 text-center">
            Choose Your Favorite Style
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cleanedVariants.map((variant) => (
              <div
                key={variant.id}
                className="bg-white rounded-2xl shadow-paper overflow-hidden hover:shadow-paper-lift transition-all duration-300 cursor-pointer group"
                onClick={() => handleSelectVariant(variant.id)}
              >
                {/* Image Preview */}
                <div className="relative aspect-square bg-stone-50 overflow-hidden">
                  <img
                    src={variant.thumbnail}
                    alt={variant.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Variant Info */}
                <div className="p-6">
                  <h4 className="font-serif text-xl text-ink-charcoal mb-2">
                    {variant.name}
                  </h4>
                  <p className="text-sm text-stone-500 mb-4">
                    {variant.type === 'clean' && 'Enhanced colors with subtle cleanup'}
                    {variant.type === 'bold-poster' && 'High contrast and vibrant colors'}
                    {variant.type === 'minimal-line-art' && 'Black outlines on white'}
                  </p>

                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-ink-red text-white rounded-xl font-sans font-medium hover:bg-ink-charcoal transition-colors">
                    <Check className="w-5 h-5" />
                    Select This Style
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CleaningPanel;
