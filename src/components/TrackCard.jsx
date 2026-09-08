import { Play, Pause, Download, CheckCircle2, Loader2, Clock } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const CATEGORY_BADGE = {
  Binaural: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  Nature:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Guided:   'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Ambient:  'bg-violet-500/15 text-violet-400 border-violet-500/30',
  'Open Library': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

function WaveformBars() {
  return (
    <div className="flex items-end gap-0.5 h-6">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="waveform-bar" />
      ))}
    </div>
  );
}

export default function TrackCard({ track, isOffline, downloadProgress, onDownload, onRemoveOffline, index = 0 }) {
  const { currentTrack, isPlaying, playTrack, pause, resume, setTrackQueue } = useAudio();
  const isActive = currentTrack?.id === track.id;

  const handlePlay = () => {
    if (isActive) {
      isPlaying ? pause() : resume();
    } else {
      playTrack(track, track.drive_link);
    }
  };

  const tags = (track.tags || '').split(',').map((t) => t.trim()).filter(Boolean);
  const badgeClass = CATEGORY_BADGE[track.category] || CATEGORY_BADGE.Ambient;
  const isDownloading = downloadProgress !== undefined && downloadProgress < 100 && downloadProgress > 0;

  return (
    <div
      className={`
        glass-card rounded-2xl overflow-hidden cursor-pointer group
        animate-fade-in
      `}
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={handlePlay}
    >
      {/* Cover Art */}
      <div className={`relative h-36 bg-gradient-to-br ${track.coverGradient || 'from-indigo-900 via-violet-900 to-slate-900'} overflow-hidden`}>
        {/* Animated radial glow */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `radial-gradient(circle at 50% 60%, ${track.accentColor}33 0%, transparent 65%)`,
          }}
        />

        {/* Floating symbol */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`text-5xl opacity-25 select-none transition-all duration-500 ${isActive ? 'animate-float scale-110 opacity-40' : 'group-hover:scale-105 group-hover:opacity-35'}`}
            style={{ filter: `drop-shadow(0 0 20px ${track.accentColor})` }}
          >
            {track.category === 'Binaural' ? '◎' :
             track.category === 'Nature'   ? '♃' :
             track.category === 'Guided'   ? '◈' : '◉'}
          </span>
        </div>

        {/* Playing overlay */}
        {isActive && (
          <div className="absolute inset-0 bg-black/20 flex items-end justify-end p-3">
            {isPlaying ? (
              <WaveformBars />
            ) : (
              <div className="w-2 h-2 rounded-full bg-zen-400 animate-pulse" />
            )}
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeClass} backdrop-blur-sm`}>
            {track.category}
          </span>
        </div>

        {/* Duration */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-white/60 text-[10px]">
          <Clock size={10} />
          {track.duration}
        </div>

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div
            className={`
              w-12 h-12 rounded-full flex items-center justify-center text-white
              transition-all duration-200 shadow-lg
              ${isActive && isPlaying ? 'bg-white/20 backdrop-blur-sm' : 'bg-zen-500'}
            `}
            style={{
              boxShadow: isActive ? `0 0 24px ${track.accentColor}88` : undefined,
            }}
          >
            {isActive && isPlaying
              ? <Pause size={20} fill="white" />
              : <Play size={20} fill="white" />
            }
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h3 className="text-sm font-semibold text-[var(--text)] leading-tight line-clamp-1 mb-1">
          {track.title}
        </h3>

        {track.description && (
          <p className="text-xs text-[var(--text-2)] line-clamp-2 mb-2 leading-relaxed">
            {track.description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--text-3)] border border-[var(--border)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Offline button */}
        <div
          className="flex items-center justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-1" />
          {isDownloading ? (
            <div className="flex items-center gap-1.5 text-xs text-zen-400">
              <Loader2 size={12} className="animate-spin" />
              <span>{downloadProgress}%</span>
            </div>
          ) : isOffline ? (
            <button
              onClick={onRemoveOffline}
              className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-red-400 transition-colors duration-200"
            >
              <CheckCircle2 size={12} />
              <span>Offline</span>
            </button>
          ) : track.drive_link ? (
            <button
              onClick={onDownload}
              className="flex items-center gap-1 text-[10px] text-[var(--text-3)] hover:text-zen-400 transition-colors duration-200"
            >
              <Download size={12} />
              <span>Save offline</span>
            </button>
          ) : (
            <span className="text-[10px] text-[var(--text-3)]">Demo track</span>
          )}
        </div>
      </div>
    </div>
  );
}
