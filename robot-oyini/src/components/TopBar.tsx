import React from 'react';

interface TopBarProps {
  mode: 'levels' | 'sandbox';
  onModeChange: (mode: 'levels' | 'sandbox') => void;
  onOpenGuide: () => void;
  onResetAll: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  mode,
  onModeChange,
  onOpenGuide,
  onResetAll,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Brand wordmark */}
        <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
          Basqarıw programmaları
        </span>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <button
            type="button"
            onClick={() => onModeChange('levels')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'levels'
                ? 'border-sky-600 text-slate-900 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Tapsırmalar
          </button>
          <button
            type="button"
            onClick={() => onModeChange('sandbox')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'sandbox'
                ? 'border-sky-600 text-slate-900 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Erkin maydan
          </button>
          <button
            type="button"
            onClick={onOpenGuide}
            className="py-1 border-b-2 border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Buyrıqlar qollanbası
          </button>
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onResetAll}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:scale-[0.99] transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            Qayta baslaw
          </button>
        </div>
      </div>
    </header>
  );
};
