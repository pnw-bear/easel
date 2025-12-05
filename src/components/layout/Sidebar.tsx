import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Upload, Sparkles, Paintbrush, Package } from 'lucide-react';
import clsx from 'clsx';

const stages = [
  {
    id: 'upload',
    name: 'Upload',
    icon: Upload,
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-400',
  },
  {
    id: 'cleaning',
    name: 'Clean',
    icon: Sparkles,
    color: 'pink',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-400',
  },
  {
    id: 'styling',
    name: 'Style',
    icon: Paintbrush,
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-400',
  },
  {
    id: 'export',
    name: 'Export',
    icon: Package,
    color: 'teal',
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-600',
    borderColor: 'border-teal-400',
  },
];

function Sidebar() {
  const currentStage = useSelector((state: RootState) => state.image.currentStage);

  return (
    <aside className="fixed left-0 top-20 bottom-0 w-64 bg-white/50 backdrop-blur-sm border-r border-gray-200 p-6">
      <nav className="space-y-2">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = currentStage === stage.id;
          const isCompleted = stages.findIndex(s => s.id === currentStage) > index;

          return (
            <div key={stage.id} className="relative">
              <div
                className={clsx(
                  'stage-indicator cursor-pointer',
                  isActive && 'active'
                )}
              >
                <div
                  className={clsx(
                    'w-12 h-12 rounded-full flex items-center justify-center transition-all',
                    isActive && [stage.bgColor, 'ring-4 ring-purple-100'],
                    !isActive && isCompleted && 'bg-green-100',
                    !isActive && !isCompleted && 'bg-gray-100'
                  )}
                >
                  <Icon
                    className={clsx(
                      'w-6 h-6',
                      isActive && stage.textColor,
                      !isActive && isCompleted && 'text-green-600',
                      !isActive && !isCompleted && 'text-gray-400'
                    )}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                        isActive && [stage.bgColor, stage.textColor],
                        !isActive && isCompleted && 'bg-green-100 text-green-600',
                        !isActive && !isCompleted && 'bg-gray-100 text-gray-400'
                      )}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={clsx(
                        'font-bold text-sm',
                        isActive && 'text-gray-900',
                        !isActive && 'text-gray-500'
                      )}
                    >
                      {stage.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Connector line */}
              {index < stages.length - 1 && (
                <div
                  className={clsx(
                    'absolute left-10 top-full w-0.5 h-2 -mt-1',
                    isCompleted ? 'bg-green-300' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          );
        })}
      </nav>

      {/* Decorative elements */}
      <div className="absolute bottom-8 left-6 right-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
        <p className="text-xs text-gray-600 text-center">
          All processing happens in your browser - no data leaves your device!
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
