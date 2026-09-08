import { useState, useCallback } from 'react';
import localforage from 'localforage';

// Dedicated localforage instance for audio blobs
const audioStore = localforage.createInstance({
  name: 'ZenFlow',
  storeName: 'audio_blobs',
});

// Track download state
const downloadStateStore = localforage.createInstance({
  name: 'ZenFlow',
  storeName: 'download_state',
});

export function useOfflineCache() {
  const [downloadProgress, setDownloadProgress] = useState({}); // { [trackId]: 0-100 }
  const [offlineTracks, setOfflineTracks]       = useState({});  // { [trackId]: true }

  // Check if a track is cached on mount or demand
  const isOffline = useCallback(async (trackId) => {
    const blob = await audioStore.getItem(`audio_${trackId}`);
    return blob !== null;
  }, []);

  // Initialize offline status for given track IDs
  const initOfflineStatus = useCallback(async (trackIds) => {
    const statuses = {};
    await Promise.all(
      trackIds.map(async (id) => {
        statuses[id] = await isOffline(id);
      })
    );
    setOfflineTracks(statuses);
  }, [isOffline]);

  // Download and cache a track
  const saveOffline = useCallback(async (track) => {
    if (!track.drive_link) {
      console.warn('[ZenFlow] No audio URL for track', track.title);
      return false;
    }

    setDownloadProgress((p) => ({ ...p, [track.id]: 0 }));

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', track.drive_link, true);
      xhr.responseType = 'blob';

      xhr.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setDownloadProgress((p) => ({ ...p, [track.id]: pct }));
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          try {
            await audioStore.setItem(`audio_${track.id}`, xhr.response);
            await downloadStateStore.setItem(track.id, {
              title: track.title,
              cachedAt: Date.now(),
              size: xhr.response.size,
            });
            setOfflineTracks((o) => ({ ...o, [track.id]: true }));
            setDownloadProgress((p) => ({ ...p, [track.id]: 100 }));
            resolve(true);
          } catch (err) {
            reject(err);
          }
        } else {
          reject(new Error(`Download failed: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send();
    });
  }, []);

  // Get ObjectURL for cached blob (for Howler)
  const getOfflineUrl = useCallback(async (trackId) => {
    const blob = await audioStore.getItem(`audio_${trackId}`);
    if (!blob) return null;
    return URL.createObjectURL(blob);
  }, []);

  // Remove cached track
  const removeOffline = useCallback(async (trackId) => {
    await audioStore.removeItem(`audio_${trackId}`);
    await downloadStateStore.removeItem(trackId);
    setOfflineTracks((o) => ({ ...o, [trackId]: false }));
  }, []);

  // Get cache size info
  const getCacheInfo = useCallback(async () => {
    const keys = await downloadStateStore.keys();
    const items = await Promise.all(keys.map((k) => downloadStateStore.getItem(k)));
    const totalSize = items.reduce((acc, i) => acc + (i?.size || 0), 0);
    return { count: keys.length, totalSize };
  }, []);

  return {
    downloadProgress,
    offlineTracks,
    saveOffline,
    removeOffline,
    getOfflineUrl,
    isOffline,
    initOfflineStatus,
    getCacheInfo,
  };
}
