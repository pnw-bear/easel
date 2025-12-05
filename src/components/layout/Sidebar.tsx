import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Upload, Wand2, Paintbrush, FileDown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const stages = [
  {
    id: 'upload',
    name: 'Upload',
    subtitle: 'Add your artwork',
    icon: Upload,
    number: 1,
    colorClass: 'ink-red',
  },
  {
    id: 'cleaning',
    name: 'Clean',
    subtitle: 'Enhance quality',
    icon: Wand2,
    number: 2,
    colorClass: 'ink-red',
  },
  {
    id: 'styling',
    name: 'Style',
    subtitle: 'Apply filters',
    icon: Paintbrush,
    number: 3,
    colorClass: 'indigo',
  },
  {
    id: 'export',
    name: 'Export',
    subtitle: 'Download art',
    icon: FileDown,
    number: 4,
    colorClass: 'cerulean',
  },
];

function Sidebar() {
  const currentStage = useSelector((state: RootState) => state.image.currentStage);

  return (
    <aside className="w-full lg:w-[250px] bg-parchment border-r border-stone-200/60 flex flex-col shrink-0 hidden lg:flex sidebar-ink-pattern paper-texture">
      {/* Logo Area */}
      <div className="px-6 py-8 border-b border-stone-200/40">
        <div className="flex items-center gap-3 mb-2">
          <img src="/easel-logo.png" alt="Easel Logo" className="h-12 w-auto object-contain" />
          <div>
            <h1 className="font-serif text-3xl text-ink-charcoal leading-none">Easel</h1>
            <p className="font-hand text-sm text-stone-500 mt-0.5">Art Transformer</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-3">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = currentStage === stage.id;
          const isCompleted = stages.findIndex(s => s.id === currentStage) > index;

          return (
            <div
              key={stage.id}
              className={clsx(
                'group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300',
                isActive && 'bg-white shadow-paper border border-stone-100',
                !isActive && 'hover:bg-white/60'
              )}
            >
              {/* Stage Number with Watercolor Blob */}
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className={clsx(
                  'absolute inset-0 rounded-full transition-opacity',
                  isActive && 'watercolor-blob-orange opacity-100',
                  !isActive && 'opacity-0 group-hover:opacity-100 watercolor-blob-red'
                )} />
                <span className={clsx(
                  'relative font-serif text-xl font-bold transition-colors',
                  isActive ? 'text-ink-red' : 'text-stone-400 group-hover:text-ink-red'
                )}>
                  {stage.number}
                </span>
              </div>

              {/* Stage Info */}
              <div className="flex-1">
                <div className="font-serif text-base text-ink-charcoal">{stage.name}</div>
                <div className="text-xs text-stone-500 font-sans">{stage.subtitle}</div>
              </div>

              {/* Chevron */}
              {isActive && (
                <ChevronRight className="w-4 h-4 text-ink-red" />
              )}
            </div>
          );
        })}
      </nav>

      {/* Privacy Badge */}
      <div className="px-6 py-6 border-t border-stone-200/40">
        <div className="p-4 bg-gradient-to-br from-warm-orange/10 to-cerulean/10 rounded-xl">
          <p className="text-xs text-stone-600 text-center font-sans leading-relaxed">
            <span className="font-bold">100% Private</span><br />
            All processing in your browser
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
