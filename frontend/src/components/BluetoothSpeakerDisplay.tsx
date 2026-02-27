import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AudioEngine } from '../hooks/useAudioEngine';

interface Props {
  audioEngine: AudioEngine;
  isPlaying: boolean;
}

interface SpeakerState {
  label: string;
  db: number;
  watts: number;
  scale: number;
  glow: number;
}

const SPEAKERS = ['Left', 'Center', 'Right'];

export default function BluetoothSpeakerDisplay({ audioEngine, isPlaying }: Props) {
  const [speakers, setSpeakers] = useState<SpeakerState[]>(
    SPEAKERS.map((label) => ({ label, db: -60, watts: 0, scale: 1, glow: 0 }))
  );
  const rafRef = useRef<number | null>(null);

  const animate = useCallback(() => {
    const analyser = audioEngine.getAnalyserNode();
    if (!analyser || !isPlaying) {
      setSpeakers(SPEAKERS.map((label) => ({ label, db: -60, watts: 0, scale: 1, glow: 0 })));
      return;
    }

    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    const normalized = avg / 255;

    const db = normalized > 0 ? 20 * Math.log10(normalized) : -60;
    const watts = Math.max(0, (db + 60) * 2.5);

    setSpeakers(SPEAKERS.map((label, i) => {
      const offset = (i - 1) * 0.1;
      const speakerNorm = Math.max(0, Math.min(1, normalized + offset));
      return {
        label,
        db: Math.round(speakerNorm > 0 ? 20 * Math.log10(speakerNorm + 0.001) : -60),
        watts: Math.round(Math.max(0, (speakerNorm * 60 + 60 - 60) * 2.5)),
        scale: 1 + speakerNorm * 0.15,
        glow: speakerNorm,
      };
    }));
  }, [audioEngine, isPlaying]);

  useEffect(() => {
    const loop = () => {
      animate();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  return (
    <div className="glass-panel rounded-xl p-4 border border-ultra-blue/20 space-y-4">
      <h3 className="font-orbitron font-bold text-ultra-blue text-sm tracking-wider text-center">
        🔊 BLUETOOTH SPEAKERS
      </h3>
      <div className="flex justify-around items-end gap-4">
        {speakers.map((spk) => (
          <div key={spk.label} className="flex flex-col items-center gap-2">
            <div
              className="relative transition-transform duration-100"
              style={{
                transform: `scale(${spk.scale})`,
                filter: `drop-shadow(0 0 ${Math.round(spk.glow * 20)}px rgba(0,191,255,${spk.glow * 0.8}))`,
              }}
            >
              <img
                src="/assets/generated/bluetooth-speaker.dim_120x120.png"
                alt={`${spk.label} Speaker`}
                className="w-20 h-20 object-contain"
                onError={(e) => {
                  const t = e.target as HTMLImageElement;
                  t.style.display = 'none';
                  const parent = t.parentElement;
                  if (parent) {
                    const div = document.createElement('div');
                    div.className = 'w-20 h-20 flex items-center justify-center text-5xl';
                    div.textContent = '🔊';
                    parent.appendChild(div);
                  }
                }}
              />
            </div>
            <span className="font-rajdhani font-bold text-white/70 text-sm">{spk.label}</span>
            <div className="text-center space-y-0.5">
              <p className="font-mono text-xs text-ultra-blue font-bold">{spk.db} dB</p>
              <p className="font-mono text-xs text-ultra-gold font-bold">{spk.watts} W</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
