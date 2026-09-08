import { useState, useEffect } from 'react';
import { DEMO_TRACKS } from '../utils/demoData';
import { OPEN_LIBRARY_TRACKS } from '../utils/openLibrary';
import { driveToDirectUrl } from '../utils/driveHelper';

const SHEET_ID = import.meta.env.VITE_SHEET_ID || '13Fk7AfmSEEaMV6V38U2aij6qbjkrgLgLOKYxZxdGadU';
const TAB_NAME = import.meta.env.VITE_TAB_NAME || 'Tracks';

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
      if (!SHEET_ID) {
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
        const url = `https://opensheet.elk.sh/${SHEET_ID}/${encodeURIComponent(TAB_NAME)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error('Empty sheet');
        const mergedOpenTracks = OPEN_LIBRARY_TRACKS.map(t => ({
          ...t,
          coverGradient: 'from-blue-900 via-indigo-900 to-slate-900',
          accentColor: '#3b82f6'
        }));
        
        const fetchedTracks = data.map(transformRow);
        setTracks([...fetchedTracks, ...mergedOpenTracks]);
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
