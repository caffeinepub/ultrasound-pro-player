// 1-to-1 mapping: each instrument owns exactly ONE EQ band index (0–19)
// EQ_FREQUENCIES = [20, 40, 80, 160, 250, 500, 800, 1000, 1600, 2000, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 14000, 16000, 20000]
// Indices:          [0,  1,  2,  3,   4,   5,   6,   7,    8,    9,    10,   11,   12,   13,   14,   15,    16,    17,    18,    19  ]

export interface InstrumentDef {
  name: string;
  emoji: string;
  iconPath: string;
  bandIndices: number[]; // Always exactly ONE entry — the single EQ band this instrument owns
  color: string;
}

// Each instrument is assigned to exactly one EQ band, ordered from lowest to highest frequency.
// Band 0 (20 Hz) → Conga (deep sub-bass thump)
// Band 1 (40 Hz) → Bongo Drums (low bass punch)
// Band 2 (80 Hz) → Cello (warm low strings)
// Band 3 (160 Hz) → Double Bass / Trombone (low brass)
// Band 4 (250 Hz) → French Horn (mid-low brass warmth)
// Band 5 (500 Hz) → Accordion (mid-range reeds)
// Band 6 (800 Hz) → Bagpipes (mid reeds/drones)
// Band 7 (1000 Hz) → Viola (mid strings)
// Band 8 (1600 Hz) → Acoustic Guitar (mid-high body)
// Band 9 (2000 Hz) → Banjo (bright mid pluck)
// Band 10 (3150 Hz) → Saxophone (upper mid brass)
// Band 11 (4000 Hz) → Mandolin (bright pluck)
// Band 12 (5000 Hz) → Violin (bright strings)
// Band 13 (6300 Hz) → Harp (bright pluck harmonics)
// Band 14 (8000 Hz) → Electric Guitar (presence/bite)
// Band 15 (10000 Hz) → Trumpet (bright brass)
// Band 16 (12500 Hz) → Keyboard (upper harmonics)
// Band 17 (14000 Hz) → Tambourine (high jingle)
// Band 18 (16000 Hz) → Maracas (high shaker)
// Band 19 (20000 Hz) → Cymbals (air/shimmer)

export const INSTRUMENTS: InstrumentDef[] = [
  {
    name: 'Conga',
    emoji: '🥁',
    iconPath: '/assets/generated/instrument-kick-drum.dim_64x64.png',
    bandIndices: [0],
    color: '#FF4444',
  },
  {
    name: 'Bongo Drums',
    emoji: '🥁',
    iconPath: '/assets/generated/instrument-snare.dim_64x64.png',
    bandIndices: [1],
    color: '#FF7F50',
  },
  {
    name: 'Cello',
    emoji: '🎻',
    iconPath: '/assets/generated/instrument-cello.dim_64x64.png',
    bandIndices: [2],
    color: '#CD853F',
  },
  {
    name: 'Trombone',
    emoji: '🎺',
    iconPath: '/assets/generated/instrument-trumpet.dim_64x64.png',
    bandIndices: [3],
    color: '#B8860B',
  },
  {
    name: 'French Horn',
    emoji: '🎺',
    iconPath: '/assets/generated/instrument-trumpet.dim_64x64.png',
    bandIndices: [4],
    color: '#FF6B35',
  },
  {
    name: 'Accordion',
    emoji: '🪗',
    iconPath: '/assets/generated/instrument-harmonica.dim_64x64.png',
    bandIndices: [5],
    color: '#FF6B35',
  },
  {
    name: 'Bagpipes',
    emoji: '🎵',
    iconPath: '/assets/generated/instrument-flute.dim_64x64.png',
    bandIndices: [6],
    color: '#87CEEB',
  },
  {
    name: 'Viola',
    emoji: '🎻',
    iconPath: '/assets/generated/instrument-violin.dim_64x64.png',
    bandIndices: [7],
    color: '#F0E68C',
  },
  {
    name: 'Acoustic Guitar',
    emoji: '🎸',
    iconPath: '/assets/generated/instrument-acoustic-guitar.dim_64x64.png',
    bandIndices: [8],
    color: '#DEB887',
  },
  {
    name: 'Banjo',
    emoji: '🎵',
    iconPath: '/assets/generated/instrument-acoustic-guitar.dim_64x64.png',
    bandIndices: [9],
    color: '#CD853F',
  },
  {
    name: 'Saxophone',
    emoji: '🎷',
    iconPath: '/assets/generated/instrument-saxophone.dim_64x64.png',
    bandIndices: [10],
    color: '#FFA500',
  },
  {
    name: 'Mandolin',
    emoji: '🎵',
    iconPath: '/assets/generated/instrument-acoustic-guitar.dim_64x64.png',
    bandIndices: [11],
    color: '#FFA500',
  },
  {
    name: 'Violin',
    emoji: '🎻',
    iconPath: '/assets/generated/instrument-violin.dim_64x64.png',
    bandIndices: [12],
    color: '#DEB887',
  },
  {
    name: 'Harp',
    emoji: '🎵',
    iconPath: '/assets/generated/instrument-harp.dim_64x64.png',
    bandIndices: [13],
    color: '#FFD700',
  },
  {
    name: 'Electric Guitar',
    emoji: '🎸',
    iconPath: '/assets/generated/instrument-electric-guitar.dim_64x64.png',
    bandIndices: [14],
    color: '#00FF7F',
  },
  {
    name: 'Trumpet',
    emoji: '🎺',
    iconPath: '/assets/generated/instrument-trumpet.dim_64x64.png',
    bandIndices: [15],
    color: '#FFD700',
  },
  {
    name: 'Keyboard',
    emoji: '🎹',
    iconPath: '/assets/generated/instrument-piano.dim_64x64.png',
    bandIndices: [16],
    color: '#E0E0E0',
  },
  {
    name: 'Tambourine',
    emoji: '🥁',
    iconPath: '/assets/generated/instrument-hi-hat.dim_64x64.png',
    bandIndices: [17],
    color: '#FF8C00',
  },
  {
    name: 'Maracas',
    emoji: '🎵',
    iconPath: '/assets/generated/instrument-snare.dim_64x64.png',
    bandIndices: [18],
    color: '#98FB98',
  },
  {
    name: 'Cymbals',
    emoji: '🎵',
    iconPath: '/assets/generated/instrument-hi-hat.dim_64x64.png',
    bandIndices: [19],
    color: '#C0C0C0',
  },
];

// Lookup: bandIndex → instrument index (1-to-1, guaranteed)
export const BAND_TO_INSTRUMENT: number[] = INSTRUMENTS.map((inst, i) => {
  // Return the instrument index for each band
  return i; // Since bandIndices[0] === i for all instruments in this 1-to-1 mapping
});

// Build the reverse lookup properly
export const BAND_INDEX_TO_INSTRUMENT_INDEX: number[] = new Array(20).fill(-1);
INSTRUMENTS.forEach((inst, instIdx) => {
  BAND_INDEX_TO_INSTRUMENT_INDEX[inst.bandIndices[0]] = instIdx;
});
