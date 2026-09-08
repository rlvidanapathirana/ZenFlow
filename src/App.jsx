import { useState, useMemo } from 'react';
import { AudioProvider } from './context/AudioContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useSheets } from './hooks/useSheets';
import SearchBar from './components/SearchBar';
import CategoryTabs from './components/CategoryTabs';
import TrackList from './components/TrackList';
import BottomPlayer from './components/BottomPlayer';
import ExpandedPlayer from './components/ExpandedPlayer';
import InstallPrompt from './components/InstallPrompt';
import { Sun, Moon, Wifi, WifiOff } from 'lucide-react';
import { CATEGORIES } from './utils/demoData';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      id="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="
        relative w-10 h-10 rounded-xl flex items-center justify-center
        border border-[var(--border)] bg-[var(--surface)]
        hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]
        text-[var(--text-2)] hover:text-[var(--text)]
        transition-all duration-250 active:scale-95
      "
    >
      <div className="relative overflow-hidden w-4 h-4">
        <Sun
          size={16}
          className={`absolute inset-0 transition-all duration-300 ${theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`}
        />
        <Moon
          size={16}
          className={`absolute inset-0 transition-all duration-300 ${theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}
        />
      </div>
    </button>
  );
}

function AppShell() {
  const { theme } = useTheme();
  const { tracks, loading, source } = useSheets();
  const [search,        setSearch]        = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expanded,      setExpanded]      = useState(false);
  const [isOnline,      setIsOnline]      = useState(navigator.onLine);

  // Online/offline listener
  useState(() => {
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  });

  // Filtering
  const filteredTracks = useMemo(() => {
    let t = tracks;
    if (activeCategory !== 'All') {
      t = t.filter((tr) => tr.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      t = t.filter(
        (tr) =>
          tr.title.toLowerCase().includes(q) ||
          (tr.tags || '').toLowerCase().includes(q) ||
          (tr.description || '').toLowerCase().includes(q)
      );
    }
    return t;
  }, [tracks, activeCategory, search]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: tracks.length };
    CATEGORIES.filter((c) => c !== 'All').forEach((cat) => {
      counts[cat] = tracks.filter((t) => t.category === cat).length;
    });
    return counts;
  }, [tracks]);

  return (
    <div className={`${theme} min-h-dvh flex flex-col relative`}>
      {/* Animated background orbs */}
      <div className={`bg-orbs ${theme}`} />

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bottom-player px-4 pt-safe-top">
          <div className="max-w-screen-xl mx-auto py-4 flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-zen-500 to-violet-500 flex items-center justify-center shadow-glow-indigo">
                <span className="text-white text-sm select-none">◎</span>
              </div>
              <div>
                <h1 className="text-base font-bold gradient-text leading-none">ZenFlow</h1>
                <p className="text-[10px] text-[var(--text-3)] leading-none mt-0.5">Hypnotherapy Audio</p>
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {/* Online/offline badge */}
              <div className={`
                hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium
                ${isOnline
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}
              `}>
                {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
                {isOnline ? 'Online' : 'Offline'}
              </div>

              {/* Demo badge */}
              {source === 'demo' && (
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Demo Mode
                </div>
              )}

              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="px-4 pt-8 pb-6 max-w-screen-xl mx-auto w-full">
          <div className="animate-fade-in">
            <p className="text-xs font-semibold text-zen-400 uppercase tracking-widest mb-2">
              Your sanctuary awaits
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] leading-tight font-display mb-1">
              Zero interruptions.
            </h2>
            <h2 className="text-3xl sm:text-4xl font-extrabold gradient-text leading-tight font-display">
              Pure healing.
            </h2>
            <p className="mt-3 text-sm text-[var(--text-2)] max-w-md leading-relaxed">
              Ad-free hypnotherapy sessions for deep trance, sleep, and inner peace.
              Works offline. Always free.
            </p>
          </div>
        </section>

        {/* Search + Filter */}
        <div className="px-4 max-w-screen-xl mx-auto w-full space-y-3 mb-6">
          <SearchBar value={search} onChange={setSearch} />
          <CategoryTabs
            active={activeCategory}
            onChange={setActiveCategory}
            counts={categoryCounts}
          />
        </div>

        {/* Track Grid */}
        <main className="px-4 pb-32 max-w-screen-xl mx-auto w-full flex-1">
          {/* Results count */}
          {!loading && (
            <p className="text-xs text-[var(--text-3)] mb-3 animate-fade-in">
              {filteredTracks.length} session{filteredTracks.length !== 1 ? 's' : ''}
              {search ? ` for "${search}"` : ''}
            </p>
          )}
          <TrackList tracks={filteredTracks} loading={loading} />
        </main>

        {/* Footer */}
        <footer className="text-center text-[10px] text-[var(--text-3)] pb-6 pt-2">
          Made with ◎ · 100% Free · No Ads · PWA
        </footer>
      </div>

      {/* Bottom Player */}
      <BottomPlayer onExpand={() => setExpanded(true)} />

      {/* Expanded Player Modal */}
      {expanded && <ExpandedPlayer onClose={() => setExpanded(false)} />}

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AudioProvider>
        <AppShell />
      </AudioProvider>
    </ThemeProvider>
  );
}
