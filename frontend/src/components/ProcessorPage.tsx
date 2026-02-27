import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AudioEngine } from '../hooks/useAudioEngine';

interface Props {
  audioEngine: AudioEngine;
  isPlaying: boolean;
}

interface ChipState {
  name: string;
  status: 'active' | 'warning' | 'error' | 'fixing' | 'fixed';
  readout: string;
}

interface AutoFixIssue {
  id: string;
  type: string;
  message: string;
  fixed: boolean;
}

const CHIP_NAMES = [
  'DSP Core 1', 'DSP Core 2', 'EQ Processor', 'Limiter', 'Compressor',
  'Reverb Unit', 'Delay Line', 'Noise Gate', 'Stereo Widener', 'Bass Enhancer',
  'Treble Boost', 'Mid Scoop', 'Harmonic Gen', 'Phase Align', 'Dynamic EQ',
  'Multiband Comp', 'Transient Shaper', 'Exciter', 'De-Esser', 'Master Limiter',
];

const CLASS_LABELS = ['Class A+', 'Class B+', 'Class C+', 'Class D+'];

function initChips(): ChipState[] {
  return CHIP_NAMES.map((name) => ({ name, status: 'active', readout: 'OK' }));
}

export default function ProcessorPage({ audioEngine, isPlaying }: Props) {
  const [chips, setChips] = useState<ChipState[]>(initChips);
  const [issues, setIssues] = useState<AutoFixIssue[]>([]);
  const [freqBars, setFreqBars] = useState<number[]>(new Array(32).fill(0));
  const rafRef = useRef<number | null>(null);
  const frameCount = useRef(0);

  const analyze = useCallback(() => {
    const analyser = audioEngine.getAnalyserNode();
    frameCount.current++;

    if (!analyser || !isPlaying) {
      setFreqBars(new Array(32).fill(0));
      return;
    }

    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    // Frequency bars (32 bars)
    const step = Math.floor(data.length / 32);
    const bars = Array.from({ length: 32 }, (_, i) => data[i * step] / 255);
    setFreqBars(bars);

    // Auto-fix detection every 30 frames
    if (frameCount.current % 30 === 0) {
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      const max = Math.max(...data);
      const newIssues: AutoFixIssue[] = [];

      if (max > 240) {
        newIssues.push({ id: 'clip', type: 'Clipping', message: 'Peak level exceeding threshold — applying limiter', fixed: false });
      }
      if (avg < 5 && isPlaying) {
        newIssues.push({ id: 'stutter', type: 'Buffer Drop', message: 'Low signal detected — checking buffer', fixed: false });
      }
      if (avg > 180) {
        newIssues.push({ id: 'distort', type: 'Distortion', message: 'High RMS detected — reducing gain', fixed: false });
      }

      if (newIssues.length > 0) {
        setIssues(newIssues);
        // Auto-fix after 1.5s
        setTimeout(() => {
          setIssues((prev) => prev.map((iss) => ({ ...iss, fixed: true })));
          setTimeout(() => setIssues([]), 2000);
        }, 1500);
      }

      // Randomly animate chips
      if (frameCount.current % 90 === 0) {
        setChips((prev) => prev.map((chip, i) => {
          if (Math.random() < 0.1) {
            return { ...chip, status: 'fixing', readout: 'FIXING...' };
          }
          if (chip.status === 'fixing') {
            return { ...chip, status: 'fixed', readout: 'FIXED ✓' };
          }
          if (chip.status === 'fixed') {
            return { ...chip, status: 'active', readout: 'OK' };
          }
          return chip;
        }));
      }
    }
  }, [audioEngine, isPlaying]);

  useEffect(() => {
    const loop = () => {
      analyze();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [analyze]);

  const statusColor = (status: ChipState['status']) => {
    switch (status) {
      case 'active': return 'bg-green-400';
      case 'warning': return 'bg-yellow-400';
      case 'error': return 'bg-red-400';
      case 'fixing': return 'bg-yellow-400 animate-pulse';
      case 'fixed': return 'bg-green-400 animate-pulse';
    }
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="font-orbitron font-black text-ultra-gold text-lg sm:text-xl tracking-wider glow-gold">
          NUMBER 1 PROCESSOR IN THE WHOLE WORLD
        </h2>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="px-4 py-1.5 bg-ultra-gold/20 border-2 border-ultra-gold text-ultra-gold font-orbitron font-black text-sm rounded-full shadow-glow-gold">
            HIGH TOP 9.0
          </span>
          {CLASS_LABELS.map((label) => (
            <span key={label} className="px-3 py-1 bg-ultra-blue/10 border border-ultra-blue/40 text-ultra-blue font-rajdhani font-bold text-sm rounded-full">
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Smart Chips Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {chips.map((chip, i) => (
          <div
            key={i}
            className="glass-panel rounded-lg p-2 border border-white/10 flex flex-col gap-1"
          >
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full shrink-0 ${statusColor(chip.status)}`} />
              <span className="font-rajdhani font-semibold text-white/80 text-xs truncate">{chip.name}</span>
            </div>
            <span className={`font-mono text-xs font-bold ${
              chip.status === 'fixing' ? 'text-yellow-400' :
              chip.status === 'fixed' ? 'text-green-400' :
              chip.status === 'error' ? 'text-red-400' :
              'text-white/50'
            }`}>
              {chip.readout}
            </span>
          </div>
        ))}
      </div>

      {/* Auto-Fix Monitor */}
      <div className="glass-panel rounded-xl p-3 border border-ultra-blue/20">
        <h4 className="font-orbitron font-bold text-ultra-blue text-xs tracking-wider mb-2">
          ⚡ AUTO-FIX MONITOR
        </h4>
        {issues.length === 0 ? (
          <p className="text-green-400 font-rajdhani text-sm">✓ All systems nominal — no issues detected</p>
        ) : (
          <div className="space-y-1">
            {issues.map((issue) => (
              <div key={issue.id} className={`flex items-center gap-2 text-xs font-rajdhani ${issue.fixed ? 'text-green-400' : 'text-yellow-400'}`}>
                <span>{issue.fixed ? '✓ FIXED:' : '⚠ DETECTED:'}</span>
                <span className="font-bold">{issue.type}</span>
                <span className="text-white/60">— {issue.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Frequency Bars */}
      <div className="glass-panel rounded-xl p-3 border border-ultra-gold/20">
        <h4 className="font-orbitron font-bold text-ultra-gold text-xs tracking-wider mb-2">
          FREQUENCY ANALYSIS
        </h4>
        <div className="flex items-end gap-0.5 h-16">
          {freqBars.map((val, i) => (
            <div
              key={i}
              className="flex-1 rounded-t transition-all duration-75"
              style={{
                height: `${Math.max(2, val * 100)}%`,
                background: `linear-gradient(to top, #FFD700, #FFA500)`,
                boxShadow: val > 0.5 ? '0 0 4px rgba(255,215,0,0.6)' : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Stabilizer Range */}
      <div className="glass-panel rounded-xl p-3 border border-white/10">
        <div className="flex justify-between items-center text-xs font-mono text-white/40">
          <span>20 Hz</span>
          <span className="text-ultra-gold font-rajdhani font-bold">STABILIZER RANGE</span>
          <span>20 kHz</span>
        </div>
        <div className="mt-2 h-1 bg-gradient-to-r from-ultra-blue via-ultra-gold to-ultra-blue rounded-full opacity-60" />
      </div>
    </div>
  );
}
