import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Check for updates every hour
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in w-[90%] max-w-sm">
      <div className="glass-card rounded-2xl p-4 border border-zen-500/30 bg-slate-900/90 shadow-2xl flex items-start gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">Update Available!</h3>
          <p className="text-xs text-[var(--text-3)] mt-1">A new version of ZenFlow is ready. Reload to apply.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateServiceWorker(true)}
            className="p-2 bg-zen-500 hover:bg-zen-400 text-white rounded-xl transition-colors"
            title="Reload App"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setNeedRefresh(false)}
            className="p-2 text-[var(--text-3)] hover:text-white transition-colors"
            title="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
