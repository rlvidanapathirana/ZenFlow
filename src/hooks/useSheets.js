import { useState, useEffect } from 'react';
import { DEMO_TRACKS } from '../utils/demoData';
import { OPEN_LIBRARY_TRACKS } from '../utils/openLibrary';
import { driveToDirectUrl } from '../utils/driveHelper';

const API_URL = 'https://script.google.com/macros/s/AKfycbwTpdrLK3wAhcnW18XreVqlOabJ7vhS4Gy9odOj9laJhCrP46G36NyaWlCxMRY087TH/exec';

function transformRow(row) {
  return {
    id:          String(row.id || row.ID || Math.random()),
    title:       row.title || row.Title || 'Untitled',
    category:    row.category || row.Category || 'Ambient',
    drive_link:  driveToDirectUrl(row.drive_link || row['Drive Link'] || ''),
    duration:    row.duration || row.Duration || '00:00',
    tags:        row.tags || row.Tags || '',
    description: row.description || row.Description || '',
    coverGradient: 'from-indigo-900 via-violet-900 to-slate-900',
    accentColor:   '#6366f1',
  };
}

export function useSheets() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [source, setSource] = useState('demo'); // 'sheets' | 'demo'

  useEffect(() => {
    async function fetchTracks() {
      if (!API_URL) {
        // No sheet configured — use demo data
        const mergedOpenTracks = OPEN_LIBRARY_TRACKS.map(t => ({
          ...t,
          coverGradient: 'from-blue-900 via-indigo-900 to-slate-900',
          accentColor: '#3b82f6'
        }));
        setTracks([...DEMO_TRACKS, ...mergedOpenTracks]);
        setSource('demo');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'get_tracks' })
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to fetch tracks');
        
        const tracksArray = data.tracks || [];
        if (!Array.isArray(tracksArray) || tracksArray.length === 0) throw new Error('Empty sheet');
        
        const mergedOpenTracks = OPEN_LIBRARY_TRACKS.map(t => ({
          ...t,
          coverGradient: 'from-blue-900 via-indigo-900 to-slate-900',
          accentColor: '#3b82f6'
        }));
        
        const formattedTracks = tracksArray.map(transformRow);
        setTracks([...formattedTracks, ...mergedOpenTracks]);
        setSource('sheets');
      } catch (err) {
        console.warn('[ZenFlow] Sheets fetch failed, using demo data:', err.message);
        const mergedOpenTracks = OPEN_LIBRARY_TRACKS.map(t => ({
          ...t,
          coverGradient: 'from-blue-900 via-indigo-900 to-slate-900',
          accentColor: '#3b82f6'
        }));
        setTracks([...DEMO_TRACKS, ...mergedOpenTracks]);
        setSource('demo');
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTracks();
  }, []);

  return { tracks, loading, error, source };
}
