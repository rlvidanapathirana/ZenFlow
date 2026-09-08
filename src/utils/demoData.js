/**
 * demoData.js
 * Built-in fallback tracks — app works without Google Sheets config
 */

export const DEMO_TRACKS = [
  {
    id: '1',
    title: 'Deep Trance Induction',
    category: 'Binaural',
    drive_link: '',
    duration: '45:00',
    tags: 'theta, trance, deep, induction',
    description: 'A powerful theta-wave binaural induction for deep hypnotic trance states.',
    coverGradient: 'from-cyan-900 via-indigo-900 to-slate-900',
    accentColor: '#06b6d4',
  },
  {
    id: '2',
    title: 'Theta Wave Journey',
    category: 'Binaural',
    drive_link: '',
    duration: '30:00',
    tags: 'theta, waves, journey, focus',
    description: 'Ride theta brainwaves into a deeply focused, meditative state.',
    coverGradient: 'from-violet-900 via-purple-900 to-indigo-900',
    accentColor: '#8b5cf6',
  },
  {
    id: '3',
    title: 'Rainforest Sanctuary',
    category: 'Nature',
    drive_link: '',
    duration: '60:00',
    tags: 'rain, forest, nature, relax, ambient',
    description: 'Immersive rainforest soundscape for deep relaxation and stress release.',
    coverGradient: 'from-emerald-900 via-teal-900 to-slate-900',
    accentColor: '#10b981',
  },
  {
    id: '4',
    title: 'Ocean Depths',
    category: 'Nature',
    drive_link: '',
    duration: '45:00',
    tags: 'ocean, waves, water, sleep, calm',
    description: 'Deep ocean waves layered with subtle harmonic tones for sleep induction.',
    coverGradient: 'from-blue-900 via-cyan-900 to-slate-900',
    accentColor: '#0ea5e9',
  },
  {
    id: '5',
    title: 'Inner Peace Guided Session',
    category: 'Guided',
    drive_link: '',
    duration: '25:00',
    tags: 'guided, peace, meditation, anxiety, relief',
    description: 'A gentle guided hypnotherapy session for releasing anxiety and finding inner peace.',
    coverGradient: 'from-amber-900 via-orange-900 to-slate-900',
    accentColor: '#f59e0b',
  },
  {
    id: '6',
    title: 'Sleep Descent',
    category: 'Ambient',
    drive_link: '',
    duration: '90:00',
    tags: 'sleep, ambient, delta, night, rest',
    description: 'Delta-wave ambient soundscape designed to guide you into deep, restorative sleep.',
    coverGradient: 'from-slate-900 via-indigo-950 to-black',
    accentColor: '#6366f1',
  },
  {
    id: '7',
    title: 'Confidence Amplifier',
    category: 'Guided',
    drive_link: '',
    duration: '20:00',
    tags: 'confidence, self-esteem, positive, affirmation',
    description: 'Hypnotic affirmations to rewire your subconscious for unshakeable confidence.',
    coverGradient: 'from-rose-900 via-pink-900 to-indigo-900',
    accentColor: '#f43f5e',
  },
  {
    id: '8',
    title: 'Crystal Singing Bowls',
    category: 'Ambient',
    drive_link: '',
    duration: '40:00',
    tags: 'singing bowls, crystal, healing, chakra, sound bath',
    description: 'Crystal singing bowl frequencies for energetic alignment and deep healing.',
    coverGradient: 'from-purple-900 via-fuchsia-900 to-indigo-900',
    accentColor: '#a855f7',
  },
];

export const AMBIENT_TRACKS = [
  { id: 'a1', title: 'Soft Rain', category: 'Nature', drive_link: '' },
  { id: 'a2', title: 'Theta Hum', category: 'Binaural', drive_link: '' },
  { id: 'a3', title: 'Deep Forest', category: 'Nature', drive_link: '' },
  { id: 'a4', title: 'White Noise', category: 'Ambient', drive_link: '' },
];

export const CATEGORIES = ['All', 'Binaural', 'Nature', 'Guided', 'Ambient', 'Open Library'];
