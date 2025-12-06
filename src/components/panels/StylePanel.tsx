import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateStyleSettings } from '../../store/imageSlice';
import { Palette, Sparkles } from 'lucide-react';

const stylePresets = [
  { id: 'watercolor', name: 'Watercolor', description: 'Soft, fluid artistic effect' },
  { id: 'ink', name: 'Ink Wash', description: 'Bold brush strokes' },
  { id: 'pastel', name: 'Pastel', description: 'Soft, chalky colors' },
  { id: 'vibrant', name: 'Vibrant', description: 'Boosted saturation' },
];

function StylePanel() {
  const dispatch = useDispatch();
  const styleSettings = useSelector((state: RootState) => state.image.styleSettings);

  const handlePresetClick = (presetId: string) => {
    dispatch(updateStyleSettings({ preset: presetId }));
  };

  const handleIntensityChange = (value: number) => {
    dispatch(updateStyleSettings({ intensity: value / 100 }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Palette className="w-5 h-5 text-indigo" />
        <h3 className="font-serif text-xl text-ink-charcoal">Apply Style</h3>
      </div>

      {/* Style Presets */}
      <div>
        <h4 className="font-serif text-base text-ink-charcoal mb-3">Style Presets</h4>
        <div className="grid grid-cols-2 gap-3">
          {stylePresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetClick(preset.id)}
              className={`
                p-4 rounded-xl border-2 transition-all text-left
                ${
                  styleSettings.preset === preset.id
                    ? 'border-indigo bg-indigo/5 shadow-paper'
                    : 'border-stone-200 hover:border-indigo hover:bg-indigo/5'
                }
              `}
            >
              <div className="font-serif text-sm text-ink-charcoal font-medium mb-1">
                {preset.name}
              </div>
              <div className="text-xs text-stone-500">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Intensity Slider */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="font-serif text-base text-ink-charcoal">
            Style Intensity
          </label>
          <span className="text-lg font-bold text-indigo">
            {Math.round(styleSettings.intensity * 100)}%
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={styleSettings.intensity * 100}
          onChange={(e) => handleIntensityChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3449A6 0%, #3449A6 ${styleSettings.intensity * 100}%, #E5E7E4 ${styleSettings.intensity * 100}%, #E5E7E4 100%)`
          }}
        />

        <div className="flex items-center justify-between mt-2 text-xs text-stone-500">
          <span>Subtle</span>
          <span>Bold</span>
        </div>
      </div>

      {/* Apply Button */}
      <button
        disabled={!styleSettings.preset}
        className={`
          w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-sans font-semibold text-base transition-all
          ${
            styleSettings.preset
              ? 'bg-indigo text-white shadow-watercolor-purple hover:scale-[1.02]'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }
        `}
      >
        <Sparkles className="w-5 h-5" />
        Apply Style
      </button>

      {/* Coming Soon Notice */}
      <div className="bg-warm-orange/10 rounded-xl p-4 border border-warm-orange/20">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-warm-orange flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-serif text-sm text-ink-charcoal font-medium mb-1">
              Coming Soon
            </h5>
            <p className="text-xs text-stone-600 leading-relaxed">
              Style presets are in development. This feature will apply artistic filters to your cleaned artwork.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StylePanel;
