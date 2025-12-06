import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { jumpToHistory } from '../../store/imageSlice';
import { Check } from 'lucide-react';

function HistoryTimeline() {
  const dispatch = useDispatch();
  const history = useSelector((state: RootState) => state.image.history);
  const currentHistoryIndex = useSelector((state: RootState) => state.image.currentHistoryIndex);

  const handleHistoryClick = (index: number) => {
    dispatch(jumpToHistory(index));
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="py-4 px-6">
      <div className="flex items-center gap-3">
        <span className="text-xs font-sans font-medium text-stone-500 uppercase tracking-wide">
          History
        </span>
        <div className="flex-1 flex items-center gap-3 overflow-x-auto hide-scrollbar">
          {history.map((entry, index) => {
            const isActive = index === currentHistoryIndex;
            const isPast = index < currentHistoryIndex;
            const isFuture = index > currentHistoryIndex;

            return (
              <button
                key={entry.id}
                onClick={() => handleHistoryClick(index)}
                className={`
                  relative flex-shrink-0 group transition-all duration-200
                  ${isActive ? 'scale-110' : 'scale-100'}
                `}
                title={`${entry.label} - ${new Date(entry.timestamp).toLocaleTimeString()}`}
              >
                {/* Thumbnail */}
                <div
                  className={`
                    w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200
                    ${
                      isActive
                        ? 'border-ink-red shadow-md'
                        : 'border-stone-200 hover:border-ink-red/50'
                    }
                    ${isFuture ? 'opacity-50 grayscale' : 'opacity-100'}
                    ${isPast && !isActive ? 'opacity-75' : ''}
                  `}
                >
                  <img
                    src={entry.imageUrl}
                    alt={entry.label}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-ink-red rounded-full flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Label */}
                <div
                  className={`
                    mt-2 text-xs font-sans text-center
                    ${isActive ? 'text-ink-red font-semibold' : 'text-stone-600'}
                  `}
                >
                  {entry.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default HistoryTimeline;
