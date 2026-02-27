// 20 EQ frequency bands
export const EQ_FREQUENCIES = [
  20, 40, 80, 160, 250, 500, 800,
  1000, 1600, 2000, 3150, 4000, 5000,
  6300, 8000, 10000, 12500, 14000, 16000, 20000
];

export const EQ_GAIN_MIN = -12;
export const EQ_GAIN_MAX = 12;
export const EQ_GAIN_DEFAULT = 0;

export const FREQ_LABELS = [
  '20Hz', '40Hz', '80Hz', '160Hz', '250Hz', '500Hz', '800Hz',
  '1kHz', '1.6kHz', '2kHz', '3.15kHz', '4kHz', '5kHz',
  '6.3kHz', '8kHz', '10kHz', '12.5kHz', '14kHz', '16kHz', '20kHz'
];

// Sound engine presets: array of 20 gain values (dB) for each frequency band
export type SoundEngine = 'Crystal Engine' | 'Deep Bass Engine' | 'Surround Engine' | 'Pure HD Engine';

export const SOUND_ENGINE_PRESETS: Record<SoundEngine, number[]> = {
  'Crystal Engine': [
    -2, -1, 0, 0, 1, 2, 3, 4, 5, 6, 7, 7, 6, 5, 4, 3, 2, 1, 0, -1
  ],
  'Deep Bass Engine': [
    10, 9, 8, 7, 6, 4, 2, 0, -1, -2, -2, -1, 0, 0, 0, -1, -2, -3, -4, -5
  ],
  'Surround Engine': [
    4, 3, 2, 1, 0, -1, 0, 2, 4, 5, 6, 6, 5, 4, 3, 2, 1, 0, -1, -2
  ],
  'Pure HD Engine': [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
  ]
};
