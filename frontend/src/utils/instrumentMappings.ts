export interface InstrumentDef {
  id: string;
  name: string;
  emoji: string;
  iconPath: string;
  color: string;
  bandIndex: number;
}

export const INSTRUMENTS: InstrumentDef[] = [
  { id: 'accordion',       name: 'Accordion',       emoji: '🪗', iconPath: '/assets/generated/instrument-accordion.dim_64x64.png',       color: '#FF6B35', bandIndex: 0  },
  { id: 'harp',            name: 'Harp',             emoji: '🎵', iconPath: '/assets/generated/instrument-harp.dim_64x64.png',            color: '#FFD700', bandIndex: 1  },
  { id: 'acoustic-guitar', name: 'Acoustic Guitar',  emoji: '🎸', iconPath: '/assets/generated/instrument-acoustic-guitar.dim_64x64.png', color: '#8B4513', bandIndex: 2  },
  { id: 'electric-guitar', name: 'Electric Guitar',  emoji: '🎸', iconPath: '/assets/generated/instrument-electric-guitar.dim_64x64.png', color: '#FF4500', bandIndex: 3  },
  { id: 'mandolin',        name: 'Mandolin',         emoji: '🎻', iconPath: '/assets/generated/instrument-mandolin.dim_64x64.png',        color: '#DAA520', bandIndex: 4  },
  { id: 'banjo',           name: 'Banjo',            emoji: '🪕', iconPath: '/assets/generated/instrument-banjo.dim_64x64.png',           color: '#CD853F', bandIndex: 5  },
  { id: 'tambourine',      name: 'Tambourine',       emoji: '🥁', iconPath: '/assets/generated/instrument-tambourine.dim_64x64.png',      color: '#FF8C00', bandIndex: 6  },
  { id: 'keyboard',        name: 'Keyboard',         emoji: '🎹', iconPath: '/assets/generated/instrument-piano.dim_64x64.png',           color: '#00BFFF', bandIndex: 7  },
  { id: 'maracas',         name: 'Maracas',          emoji: '🎵', iconPath: '/assets/generated/instrument-maracas.dim_64x64.png',         color: '#32CD32', bandIndex: 8  },
  { id: 'conga',           name: 'Conga',            emoji: '🥁', iconPath: '/assets/generated/instrument-kick-drum.dim_64x64.png',       color: '#8B0000', bandIndex: 9  },
  { id: 'bagpipes',        name: 'Bagpipes',         emoji: '🎵', iconPath: '/assets/generated/instrument-bagpipes.dim_64x64.png',        color: '#228B22', bandIndex: 10 },
  { id: 'bongo-drums',     name: 'Bongo Drums',      emoji: '🥁', iconPath: '/assets/generated/instrument-snare.dim_64x64.png',           color: '#A0522D', bandIndex: 11 },
  { id: 'sitar',           name: 'Sitar',            emoji: '🎵', iconPath: '/assets/generated/instrument-sitar.dim_64x64.png',           color: '#FF69B4', bandIndex: 12 },
  { id: 'cymbals',         name: 'Cymbals',          emoji: '🥁', iconPath: '/assets/generated/instrument-hi-hat.dim_64x64.png',          color: '#C0C0C0', bandIndex: 13 },
  { id: 'saxophone',       name: 'Saxophone',        emoji: '🎷', iconPath: '/assets/generated/instrument-saxophone.dim_64x64.png',       color: '#FFD700', bandIndex: 14 },
  { id: 'violin',          name: 'Violin',           emoji: '🎻', iconPath: '/assets/generated/instrument-violin.dim_64x64.png',          color: '#8B008B', bandIndex: 15 },
  { id: 'viola',           name: 'Viola',            emoji: '🎻', iconPath: '/assets/generated/instrument-viola.dim_64x64.png',           color: '#9400D3', bandIndex: 16 },
  { id: 'cello',           name: 'Cello',            emoji: '🎻', iconPath: '/assets/generated/instrument-cello.dim_64x64.png',           color: '#4B0082', bandIndex: 17 },
  { id: 'trombone',        name: 'Trombone',         emoji: '🎺', iconPath: '/assets/generated/instrument-trumpet.dim_64x64.png',         color: '#B8860B', bandIndex: 18 },
  { id: 'french-horn',     name: 'French Horn',      emoji: '📯', iconPath: '/assets/generated/instrument-french-horn.dim_64x64.png',     color: '#FF6347', bandIndex: 19 },
];

// O(1) reverse lookup: bandIndex → instrument index in INSTRUMENTS array
export const BAND_INDEX_TO_INSTRUMENT_INDEX: number[] = INSTRUMENTS.reduce(
  (acc, inst, idx) => {
    acc[inst.bandIndex] = idx;
    return acc;
  },
  new Array(20).fill(0)
);
