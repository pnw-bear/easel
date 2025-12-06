import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setActiveTool, Tool } from '../../store/imageSlice';
import { Upload, Wand2, Palette, Download } from 'lucide-react';

interface ToolItem {
  id: Tool;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const tools: ToolItem[] = [
  {
    id: 'upload',
    label: 'Upload',
    icon: Upload,
    description: 'Upload your artwork',
  },
  {
    id: 'clean',
    label: 'Clean',
    icon: Wand2,
    description: 'Remove background',
  },
  {
    id: 'style',
    label: 'Style',
    icon: Palette,
    description: 'Apply artistic styles',
  },
  {
    id: 'export',
    label: 'Export',
    icon: Download,
    description: 'Download results',
  },
];

function ToolPalette() {
  const dispatch = useDispatch();
  const activeTool = useSelector((state: RootState) => state.image.activeTool);

  const handleToolClick = (toolId: Tool) => {
    dispatch(setActiveTool(toolId));
  };

  return (
    <div className="h-full flex flex-col bg-parchment sidebar-ink-pattern paper-texture">
      {/* Logo Area */}
      <div className="px-4 py-6 border-b border-stone-200/40">
        <div className="flex flex-col items-center gap-2">
          <img
            src="/easel-logo.png"
            alt="Easel Logo"
            className="h-16 w-auto object-contain"
          />
          <h1 className="font-serif text-2xl text-ink-charcoal leading-none text-center">Easel</h1>
          <p className="font-hand text-xs text-stone-500">Art Studio</p>
        </div>
      </div>

      {/* Tool Buttons */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`
                w-full group flex flex-col items-center gap-2 px-3 py-4 rounded-xl
                transition-all duration-300
                ${
                  isActive
                    ? 'bg-white shadow-paper border border-stone-100'
                    : 'hover:bg-white/60'
                }
              `}
              title={tool.description}
            >
              {/* Icon with watercolor blob background */}
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div
                  className={`
                    absolute inset-0 rounded-full transition-opacity
                    ${
                      tool.id === 'upload'
                        ? 'watercolor-blob-orange'
                        : tool.id === 'clean'
                        ? 'watercolor-blob-red'
                        : tool.id === 'style'
                        ? 'watercolor-blob-indigo'
                        : 'watercolor-blob-blue'
                    }
                    ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                  `}
                />
                <Icon
                  className={`
                    w-6 h-6 relative transition-colors
                    ${
                      isActive
                        ? tool.id === 'upload'
                          ? 'text-warm-orange'
                          : tool.id === 'clean'
                          ? 'text-ink-red'
                          : tool.id === 'style'
                          ? 'text-indigo'
                          : 'text-cerulean'
                        : 'text-stone-400 group-hover:text-ink-charcoal'
                    }
                  `}
                />
              </div>

              {/* Label */}
              <div className="text-center">
                <div
                  className={`
                    font-serif text-sm transition-colors
                    ${
                      isActive
                        ? 'text-ink-charcoal font-medium'
                        : 'text-stone-500 group-hover:text-ink-charcoal'
                    }
                  `}
                >
                  {tool.label}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Section (Future: User Profile) */}
      <div className="px-6 pt-4 border-t border-stone-200">
        <div className="text-xs text-stone-400 font-sans text-center">
          v2.0
        </div>
      </div>
    </div>
  );
}

export default ToolPalette;
