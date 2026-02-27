import React, { useRef, useEffect, useCallback } from 'react';
import { AudioEngine } from '../hooks/useAudioEngine';

interface Props {
  audioEngine: AudioEngine;
  isPlaying: boolean;
}

export default function SpectrumVisualizer({ audioEngine, isPlaying }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = audioEngine.getAnalyserNode();
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    if (!analyser || !isPlaying) {
      // Draw idle bars
      const barCount = 64;
      const barW = (W / barCount) * 0.7;
      const gap = (W / barCount) * 0.3;
      for (let i = 0; i < barCount; i++) {
        const x = i * (barW + gap);
        const h = 2 + Math.random() * 3;
        ctx.fillStyle = 'rgba(255,215,0,0.15)';
        ctx.fillRect(x, H - h, barW, h);
      }
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    const barCount = 64;
    const step = Math.floor(bufferLength / barCount);
    const barW = (W / barCount) * 0.7;
    const gap = (W / barCount) * 0.3;

    for (let i = 0; i < barCount; i++) {
      const value = dataArray[i * step] / 255;
      const h = value * H;
      const x = i * (barW + gap);

      // Color gradient: gold for high, blue for low
      const r = Math.round(255 * value + 0 * (1 - value));
      const g = Math.round(215 * value + 191 * (1 - value));
      const b = Math.round(0 * value + 255 * (1 - value));

      ctx.shadowBlur = 8;
      ctx.shadowColor = `rgb(${r},${g},${b})`;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, H - h, barW, h);
    }
    ctx.shadowBlur = 0;
  }, [audioEngine, isPlaying]);

  useEffect(() => {
    const loop = () => {
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <div className="glass-panel rounded-xl border border-ultra-gold/20 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={600}
        height={120}
        className="w-full h-24 block"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
