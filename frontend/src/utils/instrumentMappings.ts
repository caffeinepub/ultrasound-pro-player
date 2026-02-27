// Maps each instrument to indices in the EQ_FREQUENCIES array
// EQ_FREQUENCIES = [20, 40, 80, 160, 250, 500, 800, 1000, 1600, 2000, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 14000, 16000, 20000]
// Indices:          [0,  1,  2,  3,   4,   5,   6,   7,    8,    9,    10,   11,   12,   13,   14,   15,    16,    17,    18,    19  ]

export interface InstrumentDef {
  name: string;
  emoji: string;
  bandIndices: number[];
  color: string;
}

export const INSTRUMENTS: InstrumentDef[] = [
  {
    name: 'Bass Guitar',
    emoji: '🎸',
    bandIndices: [0, 1, 2, 3, 4],
    color: '#FF6B35'
  },
  {
    name: 'Kick Drum',
    emoji: '🥁',
    bandIndices: [0, 1, 2, 3],
    color: '#FF4444'
  },
  {
    name: 'Snare',
    emoji: '🥁',
    bandIndices: [3, 4, 5, 6, 7],
    color: '#FF8C00'
  },
  {
    name: 'Hi-Hat',
    emoji: '🎵',
    bandIndices: [11, 12, 13, 14, 15],
    color: '#FFD700'
  },
  {
    name: 'Piano',
    emoji: '🎹',
    bandIndices: [3, 4, 5, 6, 7, 8, 9],
    color: '#E0E0E0'
  },
  {
    name: 'Violin',
    emoji: '🎻',
    bandIndices: [7, 8, 9, 10, 11, 12],
    color: '#DEB887'
  },
  {
    name: 'Cello',
    emoji: '🎻',
    bandIndices: [2, 3, 4, 5, 6, 7],
    color: '#CD853F'
  },
  {
    name: 'Trumpet',
    emoji: '🎺',
    bandIndices: [6, 7, 8, 9, 10, 11],
    color: '#FFD700'
  },
  {
    name: 'Saxophone',
    emoji: '🎷',
    bandIndices: [5, 6, 7, 8, 9, 10],
    color: '#FFA500'
  },
  {
    name: 'Flute',
    emoji: '🎵',
    bandIndices: [9, 10, 11, 12, 13, 14],
    color: '#87CEEB'
  },
  {
    name: 'Acoustic Guitar',
    emoji: '🎸',
    bandIndices: [3, 4, 5, 6, 7, 8],
    color: '#DEB887'
  },
  {
    name: 'Electric Guitar',
    emoji: '🎸',
    bandIndices: [5, 6, 7, 8, 9, 10, 11],
    color: '#00FF7F'
  },
  {
    name: 'Synthesizer',
    emoji: '🎹',
    bandIndices: [4, 5, 6, 7, 8, 9, 10, 11],
    color: '#00BFFF'
  },
  {
    name: 'Organ',
    emoji: '🎹',
    bandIndices: [3, 4, 5, 6, 7, 8, 9],
    color: '#9370DB'
  },
  {
    name: 'Choir/Vocals',
    emoji: '🎤',
    bandIndices: [6, 7, 8, 9, 10, 11],
    color: '#FF69B4'
  },
  {
    name: 'Strings',
    emoji: '🎻',
    bandIndices: [5, 6, 7, 8, 9, 10, 11, 12],
    color: '#F0E68C'
  },
  {
    name: 'Percussion',
    emoji: '🥁',
    bandIndices: [2, 3, 4, 5, 6, 7, 8],
    color: '#FF7F50'
  },
  {
    name: 'Sub Bass',
    emoji: '🔊',
    bandIndices: [0, 1, 2],
    color: '#8B0000'
  },
  {
    name: 'Cymbals',
    emoji: '🎵',
    bandIndices: [12, 13, 14, 15, 16, 17],
    color: '#C0C0C0'
  },
  {
    name: 'Harmonica',
    emoji: '🎵',
    bandIndices: [7, 8, 9, 10, 11, 12, 13],
    color: '#98FB98'
  }
];
