import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { Howl } from 'howler';

const AudioCtx = createContext(null);

export function AudioProvider({ children }) {
  const howlRef        = useRef(null); // Primary Howl instance
  const ambientRef     = useRef(null); // Secondary ambient Howl instance
  const seekIntervalRef = useRef(null);

  const [currentTrack,   setCurrentTrack]   = useState(null);
  const [ambientTrack,   setAmbientTrack]   = useState(null);
  const [isPlaying,      setIsPlaying]      = useState(false);
  const [isAmbientOn,    setIsAmbientOn]    = useState(false);
  const [seek,           setSeek]           = useState(0);
  const [duration,       setDuration]       = useState(0);
  const [volume,         setVolume]         = useState(0.85);
  const [ambientVolume,  setAmbientVolume]  = useState(0.35);
  const [isLoading,      setIsLoading]      = useState(false);
  const [isMuted,        setIsMuted]        = useState(false);
  const [queue,          setQueue]          = useState([]);
  const [queueIndex,     setQueueIndex]     = useState(-1);

  // Seek progress ticker
  const startSeekTicker = useCallback(() => {
    clearInterval(seekIntervalRef.current);
    seekIntervalRef.current = setInterval(() => {
      if (howlRef.current?.playing()) {
        setSeek(howlRef.current.seek() || 0);
      }
    }, 500);
  }, []);

  const stopSeekTicker = useCallback(() => {
    clearInterval(seekIntervalRef.current);
  }, []);

  useEffect(() => () => {
    stopSeekTicker();
    howlRef.current?.unload();
    ambientRef.current?.unload();
  }, [stopSeekTicker]);

  // Core: load and play a track (with optional crossfade)
  const playTrack = useCallback((track, audioUrl, crossfade = true) => {
    const oldHowl = howlRef.current;
    setIsLoading(true);
    setCurrentTrack(track);
    setSeek(0);

    const newHowl = new Howl({
      src: [audioUrl || track.drive_link || ''],
      html5: true, // streaming
      loop: true,
      volume: crossfade ? 0 : volume,
      onload: () => {
        setDuration(newHowl.duration());
        setIsLoading(false);
        if (crossfade && oldHowl) {
          // Fade in new
          newHowl.play();
          newHowl.fade(0, volume, 1800);
          // Fade out old
          oldHowl.fade(oldHowl.volume(), 0, 1800);
          oldHowl.once('fade', () => oldHowl.unload());
        } else {
          oldHowl?.unload();
          newHowl.volume(volume);
          newHowl.play();
        }
        setIsPlaying(true);
        startSeekTicker();
      },
      onloaderror: () => {
        setIsLoading(false);
        setIsPlaying(false);
      },
      onplay:  () => setIsPlaying(true),
      onpause: () => { setIsPlaying(false); stopSeekTicker(); },
      onstop:  () => { setIsPlaying(false); stopSeekTicker(); setSeek(0); },
      onend:   () => {
        // Loop handles replay, but for non-loop advance queue
        if (queueIndex < queue.length - 1) playNext();
      },
    });

    howlRef.current = newHowl;
  }, [volume, queueIndex, queue, startSeekTicker, stopSeekTicker]);

  const pause = useCallback(() => {
    howlRef.current?.pause();
    stopSeekTicker();
    setIsPlaying(false);
  }, [stopSeekTicker]);

  const resume = useCallback(() => {
    howlRef.current?.play();
    startSeekTicker();
    setIsPlaying(true);
  }, [startSeekTicker]);

  const toggle = useCallback(() => {
    if (isPlaying) pause(); else resume();
  }, [isPlaying, pause, resume]);

  const seekTo = useCallback((val) => {
    howlRef.current?.seek(val);
    setSeek(val);
  }, []);

  const changeVolume = useCallback((val) => {
    setVolume(val);
    howlRef.current?.volume(val);
    if (val > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      howlRef.current?.volume(volume);
      setIsMuted(false);
    } else {
      howlRef.current?.volume(0);
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  // Ambient track
  const playAmbient = useCallback((track, url) => {
    ambientRef.current?.unload();
    setAmbientTrack(track);
    const a = new Howl({
      src: [url || track.drive_link || ''],
      html5: true,
      loop: true,
      volume: 0,
      onload: () => {
        a.play();
        a.fade(0, ambientVolume, 1500);
        setIsAmbientOn(true);
      },
    });
    ambientRef.current = a;
  }, [ambientVolume]);

  const stopAmbient = useCallback(() => {
    if (ambientRef.current) {
      ambientRef.current.fade(ambientRef.current.volume(), 0, 1000);
      ambientRef.current.once('fade', () => ambientRef.current?.unload());
    }
    setIsAmbientOn(false);
    setAmbientTrack(null);
  }, []);

  const changeAmbientVolume = useCallback((val) => {
    setAmbientVolume(val);
    ambientRef.current?.volume(val);
  }, []);

  // Queue management
  const setTrackQueue = useCallback((tracks, startIndex = 0) => {
    setQueue(tracks);
    setQueueIndex(startIndex);
  }, []);

  const playNext = useCallback(() => {
    if (queueIndex < queue.length - 1) {
      const next = queue[queueIndex + 1];
      setQueueIndex((i) => i + 1);
      playTrack(next, next.drive_link);
    }
  }, [queue, queueIndex, playTrack]);

  const playPrev = useCallback(() => {
    if (queueIndex > 0) {
      const prev = queue[queueIndex - 1];
      setQueueIndex((i) => i - 1);
      playTrack(prev, prev.drive_link);
    } else if (howlRef.current) {
      seekTo(0);
    }
  }, [queue, queueIndex, playTrack, seekTo]);

  const value = {
    currentTrack, ambientTrack,
    isPlaying, isAmbientOn, isLoading, isMuted,
    seek, duration, volume, ambientVolume,
    queue, queueIndex,
    playTrack, pause, resume, toggle,
    seekTo, changeVolume, toggleMute,
    playAmbient, stopAmbient, changeAmbientVolume,
    setTrackQueue, playNext, playPrev,
  };

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}

export const useAudio = () => {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
};
