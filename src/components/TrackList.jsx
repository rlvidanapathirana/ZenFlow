import TrackCard from './TrackCard';
import { useOfflineCache } from '../hooks/useOfflineCache';
import { useEffect } from 'react';

function SkeletonCard({ index }) {
  return (
    <div
      className="rounded-2xl overflow-hidden border border-[var(--border)] animate-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="skeleton h-36" />
      <div className="p-3.5 space-y-2">
        <div className="skeleton h-4 rounded-lg w-3/4" />
        <div className="skeleton h-3 rounded-lg w-full" />
        <div className="skeleton h-3 rounded-lg w-1/2" />
      </div>
    </div>
  );
}

export default function TrackList({ tracks, loading }) {
  const { downloadProgress, offlineTracks, saveOffline, removeOffline, initOfflineStatus } = useOfflineCache();

  useEffect(() => {
    if (tracks.length > 0) {
      initOfflineStatus(tracks.map((t) => t.id));
    }
  }, [tracks, initOfflineStatus]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} index={i} />)}
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="text-5xl mb-4 opacity-30">◎</div>
        <p className="text-[var(--text-2)] font-medium">No sessions found</p>
        <p className="text-[var(--text-3)] text-sm mt-1">Try a different search or category</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {tracks.map((track, index) => (
        <TrackCard
          key={track.id}
          track={track}
          index={index}
          isOffline={offlineTracks[track.id] || false}
          downloadProgress={downloadProgress[track.id]}
          onDownload={() => saveOffline(track)}
          onRemoveOffline={() => removeOffline(track.id)}
        />
      ))}
    </div>
  );
}
