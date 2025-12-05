import { useDispatch } from 'react-redux';
import { resetPipeline } from '../../store/imageSlice';
import { RefreshCw } from 'lucide-react';

function Header() {
  const dispatch = useDispatch();

  const handleReset = () => {
    if (confirm('Start over? This will clear your current progress.')) {
      dispatch(resetPipeline());
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-handwritten font-bold text-gradient">
            Easel
          </h1>
          <span className="text-sm text-gray-500 font-medium">
            Transform Children's Art
          </span>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm font-medium">Start Over</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
