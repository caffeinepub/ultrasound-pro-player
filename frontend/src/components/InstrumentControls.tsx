import { useCallback, useRef } from 'react';
import { INSTRUMENTS } from '../utils/instrumentMappings';
import { AudioEngineControls } from '../hooks/useAudioEngine';
import { EQ_GAIN_MIN, EQ_GAIN_MAX } from '../utils/audioConstants';

interface Props {
  audioEngine: AudioEngineControls;
  instrumentGains: number[];
  eqGains: number[];
  onInstrumentChange: (instrumentIndex: number, gain: number) => void;
  highlightedInstruments: Set<number>;
}

export function InstrumentControls({
  audioEngine,
  instrumentGains,
  eqGains,
  onInstrumentChange,
  highlightedInstruments
}: Props) {
  const debounceTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const handleSliderChange = useCallback((instrumentIndex: number, value: number) => {
    onInstrumentChange(instrumentIndex, value);

    const existing = debounceTimers.current.get(instrumentIndex);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      // Apply gain to all mapped EQ bands
      const instrument = INSTRUMENTS[instrumentIndex];
      instrument.bandIndices.forEach(bandIdx => {
        audioEngine.setFilterGain(bandIdx, value);
      });
      debounceTimers.current.delete(instrumentIndex);
    }, 8);
    debounceTimers.current.set(instrumentIndex, timer);
  }, [audioEngine, onInstrumentChange]);

  return (
    <div
      className="p-5 rounded-2xl"
      style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(0,191,255,0.15)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-orbitron font-black text-sm uppercase tracking-widest" style={{ color: '#00BFFF' }}>
          🎸 Instrument Controls
        </h3>
        <span className="font-rajdhani text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          20 Instruments
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {INSTRUMENTS.map((instrument, i) => {
          const gain = instrumentGains[i] ?? 0;
          const isHighlighted = highlightedInstruments.has(i);
          const normalizedPos = (gain - EQ_GAIN_MIN) / (EQ_GAIN_MAX - EQ_GAIN_MIN);

          return (
            <div
              key={instrument.name}
              className="flex flex-col gap-2 p-3 rounded-xl transition-all duration-200"
              style={{
                background: isHighlighted
                  ? 'rgba(0,191,255,0.08)'
                  : 'rgba(255,255,255,0.03)',
                border: isHighlighted
                  ? '1px solid rgba(0,191,255,0.4)'
                  : '1px solid rgba(255,255,255,0.06)',
                boxShadow: isHighlighted ? '0 0 12px rgba(0,191,255,0.2)' : 'none'
              }}
            >
              {/* Instrument name */}
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{instrument.emoji}</span>
                <span
                  className="font-rajdhani font-bold text-xs truncate"
                  style={{
                    color: isHighlighted ? '#00BFFF' : instrument.color,
                    fontSize: '11px'
                  }}
                >
                  {instrument.name}
                </span>
              </div>

              {/* Slider */}
              <div className="flex flex-col gap-1">
                <input
                  type="range"
                  min={EQ_GAIN_MIN}
                  max={EQ_GAIN_MAX}
                  step={0.5}
                  value={gain}
                  onChange={(e) => handleSliderChange(i, parseFloat(e.target.value))}
                  className={`instrument-slider ${isHighlighted ? 'highlighted' : ''}`}
                  style={{
                    accentColor: isHighlighted ? '#00BFFF' : instrument.color
                  }}
                />
                <div className="flex justify-between">
                  <span className="font-orbitron" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '8px' }}>
                    -12
                  </span>
                  <span
                    className="font-orbitron font-bold"
                    style={{
                      color: isHighlighted ? '#00BFFF' : gain !== 0 ? instrument.color : 'rgba(255,255,255,0.3)',
                      fontSize: '9px'
                    }}
                  >
                    {gain > 0 ? `+${gain}` : gain}dB
                  </span>
                  <span className="font-orbitron" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '8px' }}>
                    +12
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
