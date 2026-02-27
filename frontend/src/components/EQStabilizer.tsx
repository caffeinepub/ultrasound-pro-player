import React, { useCallback, useMemo } from 'react';
import { INSTRUMENTS } from '../utils/instrumentMappings';
import { FREQUENCY_LABELS, EQ_GAIN_MIN, EQ_GAIN_MAX } from '../utils/audioConstants';
import { debounce } from '../utils/debounce';
import { AudioEngine } from '../hooks/useAudioEngine';

interface Props {
  eqGains: number[];
  instrumentGains: number[];
  audioEngine: AudioEngine;
  onEQChange: (index: number, gain: number) => void;
  onInstrumentGainChange: (index: number, gain: number) => void;
}

export default function EQStabilizer({ eqGains, instrumentGains, audioEngine, onEQChange, onInstrumentGainChange }: Props) {
  const debouncedEQChange = useMemo(
    () => debounce((index: number, gain: number) => {
      audioEngine.setEQBand(index, gain);
      onEQChange(index, gain);
    }, 50),
    [audioEngine, onEQChange]
  );

  const debouncedInstrumentChange = useMemo(
    () => debounce((index: number, gain: number) => {
      // Instrument gain maps to its linked EQ band
      const instrument = INSTRUMENTS[index];
      if (instrument) {
        const eqGain = ((gain - 100) / 100) * EQ_GAIN_MAX;
        audioEngine.setEQBand(instrument.bandIndex, eqGain);
      }
      onInstrumentGainChange(index, gain);
    }, 50),
    [audioEngine, onInstrumentGainChange]
  );

  const boostCount = eqGains.filter((g) => g > 0).length;
  const cutCount = eqGains.filter((g) => g < 0).length;
  const centerCount = eqGains.filter((g) => g === 0).length;

  const handleEQSlider = useCallback((index: number, value: number) => {
    debouncedEQChange(index, value);
  }, [debouncedEQChange]);

  const handleInstrumentSlider = useCallback((index: number, value: number) => {
    debouncedInstrumentChange(index, value);
  }, [debouncedInstrumentChange]);

  return (
    <div className="glass-panel rounded-xl p-4 border border-ultra-gold/20 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h2 className="font-orbitron font-bold text-ultra-gold text-base tracking-wider glow-gold">
          EQ STABILIZER
        </h2>
        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-rajdhani">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-ultra-gold inline-block" />
            <span className="text-white/60">Boost ({boostCount})</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-ultra-blue inline-block" />
            <span className="text-white/60">Cut ({cutCount})</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-white/30 inline-block" />
            <span className="text-white/60">0 dB ({centerCount})</span>
          </span>
        </div>
      </div>

      {/* EQ Sliders Grid — 4 rows × 5 cols */}
      <div className="grid grid-cols-5 gap-2">
        {eqGains.map((gain, i) => {
          const isBoost = gain > 0;
          const isCut = gain < 0;
          const fillPct = ((gain - EQ_GAIN_MIN) / (EQ_GAIN_MAX - EQ_GAIN_MIN)) * 100;

          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-white/50 text-xs font-mono text-center leading-tight" style={{ fontSize: '9px' }}>
                {FREQUENCY_LABELS[i]}
              </span>
              <span className={`text-xs font-mono font-bold ${isBoost ? 'text-ultra-gold' : isCut ? 'text-ultra-blue' : 'text-white/40'}`} style={{ fontSize: '9px' }}>
                {gain > 0 ? `+${gain.toFixed(1)}` : gain.toFixed(1)}
              </span>
              <div className="eq-slider-wrapper">
                <input
                  type="range"
                  min={EQ_GAIN_MIN}
                  max={EQ_GAIN_MAX}
                  step={0.1}
                  value={gain}
                  onChange={(e) => handleEQSlider(i, Number(e.target.value))}
                  className={`eq-slider vertical-slider ${isBoost ? 'boost' : isCut ? 'cut' : ''}`}
                  style={{
                    '--fill-pct': `${fillPct}%`,
                  } as React.CSSProperties}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Instrument Cards Grid — 4 rows × 5 cols */}
      <div className="grid grid-cols-5 gap-2">
        {INSTRUMENTS.map((instrument, i) => {
          const gain = instrumentGains[i] ?? 100;
          const isActive = gain !== 100;
          const isBoost = gain > 100;

          return (
            <div
              key={instrument.id}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                isActive
                  ? isBoost
                    ? 'border-ultra-gold/50 bg-ultra-gold/5'
                    : 'border-ultra-blue/50 bg-ultra-blue/5'
                  : 'border-white/10 bg-white/2'
              }`}
            >
              <img
                src={instrument.iconPath}
                alt={instrument.name}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const span = document.createElement('span');
                    span.textContent = instrument.emoji;
                    span.className = 'text-2xl';
                    parent.insertBefore(span, target);
                  }
                }}
              />
              <span className="text-white/60 font-rajdhani text-center leading-tight" style={{ fontSize: '8px' }}>
                {instrument.name}
              </span>
              <div className="instrument-slider-wrapper">
                <input
                  type="range"
                  min={0}
                  max={200}
                  step={1}
                  value={gain}
                  onChange={(e) => handleInstrumentSlider(i, Number(e.target.value))}
                  className="instrument-slider vertical-slider"
                  style={{
                    '--fill-pct': `${gain / 2}%`,
                  } as React.CSSProperties}
                />
              </div>
              <span className={`font-mono font-bold ${isBoost ? 'text-ultra-gold' : gain < 100 ? 'text-ultra-blue' : 'text-white/40'}`} style={{ fontSize: '8px' }}>
                {gain}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center pt-2 border-t border-white/10">
        <p className="text-white/30 font-rajdhani text-xs tracking-widest">
          DESIGNED BY ULTRASOUND PRO · 20-BAND INSTRUMENT EQ · CONNECTED TO AUDIO CHAIN
        </p>
      </div>
    </div>
  );
}
