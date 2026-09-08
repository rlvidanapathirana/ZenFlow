import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show after 3s
      setTimeout(() => setShow(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShow(false);
    setDeferredPrompt(null);
  };

  if (!show || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-50 animate-slide-up">
      <div className="glass rounded-2xl p-4 shadow-glass flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-zen-500/20 flex items-center justify-center flex-shrink-0">
          <Download size={18} className="text-zen-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text)]">Install ZenFlow</p>
          <p className="text-xs text-[var(--text-2)] mt-0.5">
            Add to home screen for offline access
          </p>
          <button
            onClick={install}
            className="mt-2.5 px-4 py-1.5 rounded-xl bg-zen-500 hover:bg-zen-400 text-white text-xs font-semibold transition-colors duration-150"
          >
            Install App
          </button>
        </div>
        <button
          onClick={() => setShow(false)}
          className="text-[var(--text-3)] hover:text-[var(--text)] transition-colors flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
