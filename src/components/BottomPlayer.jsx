import { useAudio } from '../context/AudioContext';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, ChevronUp, Loader2,
} from 'lucide-react';

import { useState } from 'react';

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function WaveformBars({ size = 'sm' }) {
  const h = size === 'sm' ? 'h-3' : 'h-4';
  return (
    <div className={`flex items-end gap-0.5 ${h}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="waveform-bar" style={{ height: [8,14,10,16,9][i] }} />
      ))}
    </div>
  );
}

export default function BottomPlayer({ onExpand }) {
  const {
    currentTrack, isPlaying, isLoading,
    seek, duration, volume, isMuted,
    toggle, seekTo, changeVolume, toggleMute,
    playNext, playPrev,
  } = useAudio();

  if (!currentTrack) return null;

  const [localSeek, setLocalSeek] = useState(null);
  const displaySeek = localSeek !== null ? localSeek : seek;
  const progress = duration > 0 ? (displaySeek / duration) * 100 : 0;

  return (
    <div className="bottom-player fixed bottom-0 left-0 right-0 z-40 animate-slide-up">
      {/* Seek bar — full width, above player */}
      <div className="relative px-0">
        <div className="h-0.5 bg-[var(--surface-3)] w-full">
          <div
            className="h-full bg-zen-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.5}
          value={displaySeek}
          onChange={(e) => setLocalSeek(Number(e.target.value))}
          onPointerUp={() => {
            if (localSeek !== null) {
              seekTo(localSeek);
              setLocalSeek(null);
            }
          }}
          onTouchEnd={() => {
            if (localSeek !== null) {
              seekTo(localSeek);
              setLocalSeek(null);
            }
          }}
          onMouseUp={() => {
            if (localSeek !== null) {
              seekTo(localSeek);
              setLocalSeek(null);
            }
          }}
          onKeyUp={(e) => {
            if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && localSeek !== null) {
              seekTo(localSeek);
              setLocalSeek(null);
            }
          }}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-0.5"
          style={{ height: '8px', top: '-4px' }}
        />
      </div>

      <div className="flex items-center gap-3 px-4 py-3 max-w-screen-xl mx-auto">
        {/* Track info */}
        <button
          onClick={onExpand}
          className="flex items-center gap-3 flex-1 min-w-0 group"
        >
          {/* Cover thumbnail */}
          <div className={`
            w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden
            bg-gradient-to-br ${currentTrack.coverGradient || 'from-indigo-900 to-violet-900'}
            relative
          `}>
            {isPlaying && <div className="absolute inset-0 flex items-center justify-center"><WaveformBars /></div>}
            {!isPlaying && (
              <span className="text-lg opacity-40">
                {currentTrack.category === 'Binaural' ? '◎' :
                 currentTrack.category === 'Nature'   ? '♃' :
                 currentTrack.category === 'Guided'   ? '◈' : '◉'}
              </span>
            )}
          </div>

          <div className="min-w-0 text-left">
            <p className="text-sm font-semibold text-[var(--text)] truncate leading-tight">
              {currentTrack.title}
            </p>
            <p className="text-[11px] text-[var(--text-3)] flex items-center gap-1 mt-0.5">
              <span>{formatTime(displaySeek)}</span>
              <span>·</span>
              <span>{formatTime(duration)}</span>
            </p>
          </div>

          <ChevronUp
            size={16}
            className="text-[var(--text-3)] group-hover:text-zen-400 transition-colors ml-1 flex-shrink-0"
          />
        </button>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={playPrev}
            className="p-2 rounded-xl text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-all duration-150"
          >
            <SkipBack size={18} />
          </button>

          <button
            onClick={toggle}
            disabled={isLoading}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center text-white
              transition-all duration-200 active:scale-95
              ${isLoading ? 'bg-zen-600/50' : 'bg-zen-500 hover:bg-zen-400'}
              ${isPlaying ? 'shadow-glow-indigo' : ''}
            `}
          >
            {isLoading
              ? <Loader2 size={18} className="animate-spin" />
              : isPlaying
                ? <Pause size={18} fill="white" />
                : <Play  size={18} fill="white" />
            }
          </button>

          <button
            onClick={playNext}
            className="p-2 rounded-xl text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-all duration-150"
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Volume — hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2 w-28">
          <button
            onClick={toggleMute}
            className="text-[var(--text-3)] hover:text-[var(--text)] transition-colors duration-150 flex-shrink-0"
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
      </div>
    </div>
  );
}
