export const EQ_BANDS = [20, 40, 63, 100, 160, 250, 400, 630, 1000, 1600, 2500, 4000, 6300, 10000, 16000, 20000, 18000, 19000, 19500, 20000];

export const EQ_FREQUENCIES = [20, 40, 63, 100, 160, 250, 400, 630, 1000, 1600, 2500, 4000, 6300, 10000, 16000, 20000, 18000, 19000, 19500, 20000];

export const EQ_GAIN_MIN = -12;
export const EQ_GAIN_MAX = 12;

export const FREQUENCY_LABELS = [
  '20 Hz', '40 Hz', '63 Hz', '100 Hz', '160 Hz',
  '250 Hz', '400 Hz', '630 Hz', '1 kHz', '1.6 kHz',
  '2.5 kHz', '4 kHz', '6.3 kHz', '10 kHz', '16 kHz',
  '20 kHz', '18 kHz', '19 kHz', '19.5 kHz', '20 kHz'
];

export const SOUND_ENGINE_PRESETS: Record<string, number[]> = {
  'Crystal Engine': [0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4],
  'Deep Bass Engine': [8, 7, 6, 5, 4, 3, 2, 1, 0, 0, -1, -1, -2, -2, -3, -3, -2, -2, -1, 0],
  'Surround Engine': [2, 2, 3, 3, 2, 1, 0, 0, 1, 2, 3, 4, 4, 3, 2, 2, 3, 3, 2, 1],
  'Pure HD Engine': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};
