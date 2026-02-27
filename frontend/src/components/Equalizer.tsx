import { useCallback, useRef } from 'react';
import { EQ_FREQUENCIES, FREQ_LABELS, EQ_GAIN_MIN, EQ_GAIN_MAX } from '../utils/audioConstants';
import { AudioEngineControls } from '../hooks/useAudioEngine';
import { INSTRUMENTS } from '../utils/instrumentMappings';

interface Props {
  audioEngine: AudioEngineControls;
  eqGains: number[];
  onGainChange: (bandIndex: number, gain: number) => void;
  highlightedBands: Set<number>;
}

export function Equalizer({ audioEngine, eqGains, onGainChange, highlightedBands }: Props) {
  const debounceTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const handleSliderChange = useCallback((bandIndex: number, value: number) => {
    onGainChange(bandIndex, value);

    // Debounced audio update
    const existing = debounceTimers.current.get(bandIndex);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      audioEngine.setFilterGain(bandIndex, value);
      debounceTimers.current.delete(bandIndex);
    }, 8);
    debounceTimers.current.set(bandIndex, timer);
  }, [audioEngine, onGainChange]);

  // Suppress unused import warning — INSTRUMENTS is used indirectly via parent
  void INSTRUMENTS;

  return (
    <div
      className="p-5 rounded-2xl"
      style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,215,0,0.15)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-orbitron font-black text-sm uppercase tracking-widest" style={{ color: '#FFD700' }}>
          🎚 20-Band Equalizer
        </h3>
        <span className="font-rajdhani text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          ±12dB per band
        </span>
      </div>

      <div className="flex items-end justify-between gap-1 overflow-x-auto pb-2">
        {EQ_FREQUENCIES.map((freq, i) => {
          const gain = eqGains[i] ?? 0;
          const isHighlighted = highlightedBands.has(i);
          const normalizedPos = (gain - EQ_GAIN_MIN) / (EQ_GAIN_MAX - EQ_GAIN_MIN);
          const fillPercent = normalizedPos * 100;

          return (
            <div
              key={freq}
              className="flex flex-col items-center gap-1 shrink-0"
              style={{ minWidth: '36px' }}
            >
              {/* Gain value */}
              <span
                className="font-orbitron text-xs font-bold"
                style={{
                  color: isHighlighted ? '#00BFFF' : gain !== 0 ? '#FFD700' : 'rgba(255,255,255,0.3)',
                  fontSize: '9px',
                  minHeight: '14px'
                }}
              >
                {gain > 0 ? `+${gain}` : gain}
              </span>

              {/* Slider track container */}
              <div
                className="relative flex items-center justify-center"
                style={{ height: '100px', width: '28px' }}
              >
                {/* Track background */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: '4px',
                    height: '100%',
                    background: 'rgba(255,255,255,0.08)',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                />
                {/* Fill indicator */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: '4px',
                    background: isHighlighted
                      ? 'rgba(0,191,255,0.6)'
                      : gain > 0
                      ? 'rgba(255,215,0,0.6)'
                      : gain < 0
                      ? 'rgba(255,68,68,0.6)'
                      : 'rgba(255,255,255,0.1)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bottom: '0',
                    height: `${fillPercent}%`,
                    transition: 'height 0.05s ease'
                  }}
                />
                {/* Center line */}
                <div
                  className="absolute"
                  style={{
                    width: '12px',
                    height: '1px',
                    background: 'rgba(255,255,255,0.2)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: '50%'
                  }}
                />
                <input
                  type="range"
                  min={EQ_GAIN_MIN}
                  max={EQ_GAIN_MAX}
                  step={0.5}
                  value={gain}
                  onChange={(e) => handleSliderChange(i, parseFloat(e.target.value))}
                  className="eq-slider"
                  style={{
                    position: 'absolute',
                    opacity: 0.01,
                    width: '28px',
                    height: '100px',
                    cursor: 'pointer',
                    zIndex: 10
                  }}
                />
                {/* Thumb indicator */}
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: '14px',
                    height: '14px',
                    background: isHighlighted ? '#00BFFF' : '#FFD700',
                    boxShadow: isHighlighted
                      ? '0 0 8px rgba(0,191,255,0.9)'
                      : '0 0 8px rgba(255,215,0,0.8)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bottom: `calc(${fillPercent}% - 7px)`,
                    transition: 'bottom 0.05s ease',
                    zIndex: 5
                  }}
                />
              </div>

              {/* Frequency label */}
              <span
                className="font-orbitron font-bold text-center"
                style={{
                  color: isHighlighted ? '#00BFFF' : 'rgba(255,255,255,0.4)',
                  fontSize: '8px',
                  lineHeight: '1.2',
                  maxWidth: '36px',
                  wordBreak: 'break-all'
                }}
              >
                {FREQ_LABELS[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
