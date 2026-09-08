import { CATEGORIES } from '../utils/demoData';

const CATEGORY_ICONS = {
  All:      '✦',
  Binaural: '◎',
  Nature:   '♃',
  Guided:   '◈',
  Ambient:  '◉',
  'Open Library': '🌍',
};

const CATEGORY_COLORS = {
  All:      'text-zen-400',
  Binaural: 'text-cyan-400',
  Nature:   'text-emerald-400',
  Guided:   'text-amber-400',
  Ambient:  'text-violet-400',
  'Open Library': 'text-blue-400',
};

const CATEGORY_ACTIVE_BG = {
  All:      'bg-zen-500/20 border-zen-500/50 text-zen-300',
  Binaural: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300',
  Nature:   'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
  Guided:   'bg-amber-500/20 border-amber-500/50 text-amber-300',
  Ambient:  'bg-violet-500/20 border-violet-500/50 text-violet-300',
  'Open Library': 'bg-blue-500/20 border-blue-500/50 text-blue-300',
};

export default function CategoryTabs({ active, onChange, counts = {} }) {
  const allCats = Object.keys(counts).filter(c => c !== 'Open Library');
  allCats.push('Open Library'); // keep it at the end

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      {allCats.map((cat) => {
        const isActive = active === cat;
        const icon = CATEGORY_ICONS[cat] || '★'; // fallback icon
        const colorClass = CATEGORY_COLORS[cat] || 'text-slate-400';
        const activeBg = CATEGORY_ACTIVE_BG[cat] || 'bg-slate-500/20 border-slate-500/50 text-slate-300';
        
        return (
          <button
            key={cat}
            id={`cat-${cat.toLowerCase()}`}
            onClick={() => onChange(cat)}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium
              whitespace-nowrap flex-shrink-0 transition-all duration-250
              ${isActive
                ? activeBg
                : 'border-[var(--border)] text-[var(--text-2)] hover:border-[var(--border-strong)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'}
            `}
            style={{
              transform: isActive ? 'scale(1.04)' : 'scale(1)',
              boxShadow: isActive ? `0 2px 16px var(--accent-glow)` : 'none',
            }}
          >
            <span className={`text-xs ${isActive ? '' : colorClass}`}>
              {icon}
            </span>
            {cat}
            {counts[cat] !== undefined && (
              <span className={`
                text-[10px] px-1.5 py-0.5 rounded-full font-semibold
                ${isActive ? 'bg-white/20' : 'bg-[var(--surface-3)] text-[var(--text-3)]'}
              `}>
                {counts[cat]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
