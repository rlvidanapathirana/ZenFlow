import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative group">
      {/* Glow effect on focus */}
      <div className="absolute inset-0 rounded-2xl bg-zen-500/20 opacity-0 group-focus-within:opacity-100 blur-lg transition-opacity duration-300 pointer-events-none" />

      <div className="relative flex items-center gap-3 px-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-all duration-300 group-focus-within:border-zen-500/60">
        <Search
          size={18}
          className="text-[var(--text-3)] group-focus-within:text-zen-400 transition-colors duration-200 flex-shrink-0"
        />
        <input
          id="search-tracks"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search sessions, tags…"
          className="flex-1 bg-transparent text-[var(--text)] placeholder-[var(--text-3)] text-sm font-medium focus:outline-none"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="p-1 rounded-lg text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-all duration-150 animate-scale-in"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
