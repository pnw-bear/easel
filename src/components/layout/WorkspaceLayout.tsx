import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Header from './Header';
import ToolPalette from './ToolPalette';
import HistoryTimeline from './HistoryTimeline';
import CleanPanel from '../panels/CleanPanel';
import StylePanel from '../panels/StylePanel';

interface WorkspaceLayoutProps {
  children: ReactNode;
}

function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const activeTool = useSelector((state: RootState) => state.image.activeTool);
  const currentImageUrl = useSelector((state: RootState) => state.image.currentImageUrl);

  const renderContextPanel = () => {
    // Only show panels if an image is uploaded
    if (!currentImageUrl) {
      return (
        <div className="flex items-center justify-center h-full text-stone-400 text-sm">
          <p>Upload an image to get started</p>
        </div>
      );
    }

    switch (activeTool) {
      case 'clean':
        return <CleanPanel />;
      case 'style':
        return <StylePanel />;
      case 'export':
        return (
          <div className="text-center text-stone-500">
            <p className="text-sm">Export options coming soon</p>
          </div>
        );
      default:
        return (
          <div className="text-center text-stone-500">
            <p className="text-sm">Select a tool to begin</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Left: Tool Palette - Full Height */}
      <aside className="w-[200px] border-r border-stone-200/60 flex-shrink-0">
        <ToolPalette />
      </aside>

      {/* Right Side: Header + Canvas + Context Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main Content Area - 2 Columns */}
        <div className="flex-1 flex overflow-hidden">
          {/* Center: Canvas + History Timeline */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Canvas Area */}
            <div className="flex-1 overflow-auto">
              {children}
            </div>

            {/* History Timeline */}
            <div className="border-t border-stone-200 bg-white">
              <HistoryTimeline />
            </div>
          </main>

          {/* Right: Context Panel (Tool-specific controls) */}
          <aside className="w-[360px] bg-white border-l border-stone-200 flex-shrink-0 overflow-y-auto">
            <div className="p-6">
              {renderContextPanel()}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default WorkspaceLayout;
