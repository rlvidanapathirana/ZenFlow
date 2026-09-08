import { useAudio } from '../context/AudioContext';
import { AMBIENT_TRACKS } from '../utils/demoData';
import { Volume2, Play, Square } from 'lucide-react';

export default function AmbientMixer() {
  const {
    volume, changeVolume,
    ambientTrack, isAmbientOn, ambientVolume,
    playAmbient, stopAmbient, changeAmbientVolume,
  } = useAudio();

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-zen-400" />
        <span className="text-xs font-semibold text-[var(--text-2)] uppercase tracking-widest">
          Dual-Track Mixer
        </span>
      </div>

      {/* Two-slider side-by-side */}
      <div className="grid grid-cols-2 gap-4">
        {/* Primary voice */}
        <div className="space-y-2">
          <div className="text-xs text-[var(--text-3)] font-medium flex items-center gap-1">
            <Volume2 size={11} /> Voice Guide
          </div>
          <div className="flex flex-col items-center gap-2">
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-[10px] text-[var(--text-3)]">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        {/* Ambient */}
        <div className="space-y-2">
          <div className="text-xs text-[var(--text-3)] font-medium flex items-center gap-1">
            <Volume2 size={11} /> Ambient Layer
          </div>
          <div className="flex flex-col items-center gap-2">
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={ambientVolume}
              onChange={(e) => changeAmbientVolume(Number(e.target.value))}
              className="w-full"
              disabled={!isAmbientOn}
            />
            <span className="text-[10px] text-[var(--text-3)]">
              {isAmbientOn ? `${Math.round(ambientVolume * 100)}%` : 'Off'}
            </span>
          </div>
        </div>
      </div>

      {/* Ambient track selector */}
      <div className="space-y-1.5">
        <div className="text-xs text-[var(--text-3)] font-medium mb-2">Ambient Layer</div>
        <div className="flex flex-wrap gap-1.5">
          {AMBIENT_TRACKS.map((track) => {
            const isSelected = ambientTrack?.id === track.id && isAmbientOn;
            return (
              <button
                key={track.id}
                onClick={() => isSelected ? stopAmbient() : playAmbient(track, track.drive_link)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
                  border transition-all duration-200
                  ${isSelected
                    ? 'bg-zen-500/20 border-zen-500/40 text-zen-300'
                    : 'border-[var(--border)] text-[var(--text-3)] hover:text-[var(--text)] hover:border-[var(--border-strong)]'}
                `}
              >
                {isSelected
                  ? <Square size={10} fill="currentColor" />
                  : <Play size={10} fill="currentColor" />
                }
                {track.title}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
