import { useAudio } from '../context/AudioContext';
import AmbientMixer from './AmbientMixer';
import {
  X, Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, RotateCcw, Download,
  CheckCircle2, Loader2, Layers,
} from 'lucide-react';
import { useState } from 'react';
import { useOfflineCache } from '../hooks/useOfflineCache';

function formatTime(secs) {
  if (!secs || isNaN(secs) || secs < 0) return '0:00';
  const total = Math.floor(secs);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.floor(total % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function WaveformBars() {
  return (
    <div className="flex items-end gap-1 h-8">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="waveform-bar w-1" />
      ))}
    </div>
  );
}

export default function ExpandedPlayer({ onClose }) {
  const {
    currentTrack, isPlaying, isLoading,
    seek, duration, volume, isMuted, ambientTrack, isAmbientOn,
    toggle, seekTo, changeVolume, toggleMute,
    playNext, playPrev,
  } = useAudio();

  const [showMixer, setShowMixer] = useState(false);
  const { offlineTracks, downloadProgress, saveOffline, removeOffline } = useOfflineCache();

  if (!currentTrack) return null;

  const isOffline     = offlineTracks[currentTrack.id];
  const isDownloading = downloadProgress[currentTrack.id] !== undefined &&
                        downloadProgress[currentTrack.id] < 100 &&
                        downloadProgress[currentTrack.id] > 0;
  
  const [localSeek, setLocalSeek] = useState(null);
  const displaySeek = localSeek !== null ? localSeek : seek;
  const progress = duration > 0 ? (displaySeek / duration) * 100 : 0;

  const handleSeekCommit = (e) => {
    const rawVal = e?.target?.value;
    const targetVal = (rawVal !== undefined && rawVal !== '') ? Number(rawVal) : localSeek;
    if (targetVal !== null && !isNaN(targetVal)) {
      seekTo(targetVal);
    }
    setLocalSeek(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-end sm:justify-center p-0 sm:p-6 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full sm:w-[420px] rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slide-up"
        style={{ background: 'var(--surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dynamic Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${currentTrack.coverGradient || 'from-indigo-900 to-slate-900'} opacity-30`} />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${currentTrack.accentColor}22 0%, transparent 70%)`,
          }}
        />

        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-widest">
              Now Playing
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMixer(!showMixer)}
                className={`
                  p-2 rounded-xl transition-all duration-200
                  ${showMixer
                    ? 'bg-zen-500/20 text-zen-400 border border-zen-500/30'
                    : 'text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'}
                `}
              >
                <Layers size={16} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-all duration-150"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Cover Art + Waveform */}
          <div className="flex justify-center mb-6">
            <div className={`
              relative w-48 h-48 rounded-3xl overflow-hidden
              bg-gradient-to-br ${currentTrack.coverGradient}
              shadow-2xl
            `}
              style={{ boxShadow: `0 0 60px ${currentTrack.accentColor}44, 0 20px 60px rgba(0,0,0,0.5)` }}
            >
              <div
                className="absolute inset-0 opacity-70"
                style={{ background: `radial-gradient(circle at 50% 50%, ${currentTrack.accentColor}44, transparent 65%)` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={`text-7xl opacity-30 select-none transition-all duration-700 ${isPlaying ? 'animate-float scale-110' : ''}`}
                  style={{ filter: `drop-shadow(0 0 30px ${currentTrack.accentColor})` }}
                >
                  {currentTrack.category === 'Binaural' ? '◎' :
                   currentTrack.category === 'Nature'   ? '♃' :
                   currentTrack.category === 'Guided'   ? '◈' : '◉'}
                </span>
              </div>

              {/* Waveform overlay when playing */}
              {isPlaying && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                  <WaveformBars />
                </div>
              )}

              {/* Pulse ring */}
              {isPlaying && (
                <div className="absolute inset-0 rounded-3xl"
                  style={{
                    boxShadow: `0 0 0 0 ${currentTrack.accentColor}66`,
                    animation: 'ring-expand 2s ease-out infinite',
                  }}
                />
              )}
            </div>
          </div>

          {/* Track Info */}
          <div className="text-center mb-5">
            <h2 className="text-xl font-bold text-[var(--text)] mb-1 leading-tight">
              {currentTrack.title}
            </h2>
            <p className="text-sm text-[var(--text-2)]">{currentTrack.category}</p>
          </div>

          {/* Ambient Mixer */}
          {showMixer && (
            <div className="mb-4 animate-slide-down">
              <AmbientMixer />
            </div>
          )}

          {/* Seek Bar */}
          <div className="mb-5">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={displaySeek}
              onChange={(e) => setLocalSeek(Number(e.target.value))}
              onPointerUp={handleSeekCommit}
              onTouchEnd={handleSeekCommit}
              onMouseUp={handleSeekCommit}
              onKeyUp={(e) => {
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                  handleSeekCommit(e);
                }
              }}
              className="w-full"
              style={{
                background: `linear-gradient(to right, ${currentTrack.accentColor} ${progress}%, var(--surface-3) ${progress}%)`,
              }}
            />
            <div className="flex justify-between mt-1.5 text-xs text-[var(--text-3)]">
              <span>{formatTime(displaySeek)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-4 mb-5">
            <button
              onClick={() => seekTo(0)}
              className="p-2.5 rounded-xl text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-all duration-150"
            >
              <RotateCcw size={18} />
            </button>

            <button
              onClick={playPrev}
              className="p-3 rounded-xl text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-all duration-150"
            >
              <SkipBack size={22} />
            </button>

            <button
              onClick={toggle}
              disabled={isLoading}
              className={`
                w-16 h-16 rounded-full flex items-center justify-center text-white
                transition-all duration-200 active:scale-95
                ${isLoading ? 'bg-zen-600/50' : 'bg-zen-500 hover:bg-zen-400'}
                ${isPlaying ? 'pulse-ring' : ''}
              `}
              style={{ boxShadow: isPlaying ? `0 0 32px ${currentTrack.accentColor}88` : '0 4px 24px rgba(0,0,0,0.4)' }}
            >
              {isLoading
                ? <Loader2 size={26} className="animate-spin" />
                : isPlaying
                  ? <Pause size={26} fill="white" />
                  : <Play  size={26} fill="white" />
              }
            </button>

            <button
              onClick={playNext}
              className="p-3 rounded-xl text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-all duration-150"
            >
              <SkipForward size={22} />
            </button>

            {/* Offline button */}
            <button
              onClick={() => isOffline ? removeOffline(currentTrack.id) : saveOffline(currentTrack)}
              disabled={isDownloading || !currentTrack.drive_link}
              className={`
                p-2.5 rounded-xl transition-all duration-150
                ${isOffline
                  ? 'text-emerald-400 hover:text-red-400 hover:bg-red-500/10'
                  : 'text-[var(--text-3)] hover:text-zen-400 hover:bg-[var(--surface-2)]'}
                disabled:opacity-40
              `}
            >
              {isDownloading
                ? <Loader2 size={18} className="animate-spin text-zen-400" />
                : isOffline
                  ? <CheckCircle2 size={18} />
                  : <Download size={18} />
              }
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3 px-2">
            <button
              onClick={toggleMute}
              className="text-[var(--text-3)] hover:text-[var(--text)] transition-colors"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={isMuted ? 0 : volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              className="flex-1"
            />
          </div>

          {/* Download progress */}
          {isDownloading && (
            <div className="mt-3 animate-fade-in">
              <div className="h-1 bg-[var(--surface-3)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-zen-500 transition-all duration-300"
                  style={{ width: `${downloadProgress[currentTrack.id]}%` }}
                />
              </div>
              <p className="text-center text-xs text-zen-400 mt-1.5">
                Caching for offline… {downloadProgress[currentTrack.id]}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
