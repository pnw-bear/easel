import { useDispatch } from 'react-redux';
import { resetPipeline } from '../../store/imageSlice';
import { HelpCircle, Crown } from 'lucide-react';

function Header() {
  const dispatch = useDispatch();

  const handleReset = () => {
    if (confirm('Start over? This will clear your current progress.')) {
      dispatch(resetPipeline());
    }
  };

  return (
    <header className="relative h-[70px] border-b border-stone-200/60 flex items-center px-8 bg-parchment paper-texture hidden lg:flex">
      {/* Watercolor Wash Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-warm-orange/5 via-cerulean/5 to-indigo/5 pointer-events-none"></div>

      <div className="relative z-10 flex items-center justify-between w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          <h2 className="font-serif text-2xl text-ink-charcoal">Transform Your Art</h2>
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
