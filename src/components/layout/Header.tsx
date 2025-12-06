import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { resetPipeline, undo, redo } from '../../store/imageSlice';
import { HelpCircle, Crown, RotateCcw, RotateCw } from 'lucide-react';

function Header() {
  const dispatch = useDispatch();
  const currentHistoryIndex = useSelector((state: RootState) => state.image.currentHistoryIndex);
  const historyLength = useSelector((state: RootState) => state.image.history.length);
  const artworkDetails = useSelector((state: RootState) => state.image.artworkDetails);

  const canUndo = currentHistoryIndex > 0;
  const canRedo = currentHistoryIndex < historyLength - 1;

  const handleReset = () => {
    if (confirm('Start over? This will clear your current progress.')) {
      dispatch(resetPipeline());
    }
  };

  const handleUndo = () => {
    if (canUndo) {
      dispatch(undo());
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      dispatch(redo());
    }
  };

  // Extract filename from original file format if available
  const filename = artworkDetails.fileFormat
    ? `Artwork.${artworkDetails.fileFormat.toLowerCase()}`
    : 'Untitled';

  return (
    <header className="relative h-[70px] border-b border-stone-200/60 flex items-center px-8 bg-parchment paper-texture">
      {/* Watercolor Wash Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-warm-orange/5 via-cerulean/5 to-indigo/5 pointer-events-none"></div>

      <div className="relative z-10 flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          {historyLength > 0 && (
            <>
              {/* Undo/Redo Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className={`
                    w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all
                    ${canUndo
                      ? 'border-stone-300 text-stone-600 hover:border-ink-red hover:text-ink-red'
                      : 'border-stone-200 text-stone-300 cursor-not-allowed'
                    }
                  `}
                  title="Undo (Cmd+Z)"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={!canRedo}
                  className={`
                    w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all
                    ${canRedo
                      ? 'border-stone-300 text-stone-600 hover:border-ink-red hover:text-ink-red'
                      : 'border-stone-200 text-stone-300 cursor-not-allowed'
                    }
                  `}
                  title="Redo (Cmd+Shift+Z)"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>

              {/* Filename */}
              <span className="font-serif text-2xl text-ink-charcoal">
                {filename}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button className="px-4 py-2 text-sm font-sans text-warm-grey hover:text-ink-charcoal transition-colors">
            <HelpCircle className="w-4 h-4 inline mr-2" />
            Help
          </button>
          <button onClick={handleReset} className="px-5 py-2 bg-ink-charcoal text-white rounded-lg text-sm font-sans shadow-paper hover:bg-ink-red transition-colors">
            <Crown className="w-4 h-4 inline mr-2" />
            Start Over
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
