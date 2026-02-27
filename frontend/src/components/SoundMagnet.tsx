import React, { useRef, useEffect, useCallback } from 'react';
import { AudioEngine } from '../hooks/useAudioEngine';

interface Props {
  audioEngine: AudioEngine;
  isOn: boolean;
  isPlaying: boolean;
}

export default function SoundMagnet({ audioEngine, isOn, isPlaying }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const angleRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    ctx.clearRect(0, 0, W, H);

    if (!isOn) {
      // Static placeholder
      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,215,0,0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,215,0,0.05)';
      ctx.fill();
      ctx.fillStyle = 'rgba(255,215,0,0.3)';
      ctx.font = 'bold 12px Orbitron, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('OFF', cx, cy);
      return;
    }

    const analyser = audioEngine.getAnalyserNode();
    let amplitude = 0.3;

    if (analyser && isPlaying) {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      amplitude = data.reduce((a, b) => a + b, 0) / data.length / 255;
    }

    angleRef.current += 0.02 + amplitude * 0.05;
    const angle = angleRef.current;

    // Concentric rings
    const ringCount = 5;
    for (let r = 0; r < ringCount; r++) {
      const radius = 20 + r * 18 + amplitude * 15;
      const alpha = 0.6 - r * 0.1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = r % 2 === 0
        ? `rgba(255,215,0,${alpha})`
        : `rgba(0,191,255,${alpha})`;
      ctx.lineWidth = 2 - r * 0.2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = r % 2 === 0 ? '#FFD700' : '#00BFFF';
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Spokes
    const spokeCount = 8;
    for (let s = 0; s < spokeCount; s++) {
      const spokeAngle = angle + (s / spokeCount) * Math.PI * 2;
      const innerR = 15;
      const outerR = 30 + amplitude * 40;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(spokeAngle) * innerR, cy + Math.sin(spokeAngle) * innerR);
      ctx.lineTo(cx + Math.cos(spokeAngle) * outerR, cy + Math.sin(spokeAngle) * outerR);
      ctx.strokeStyle = `rgba(255,215,0,${0.4 + amplitude * 0.4})`;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#FFD700';
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Core pulse
    const coreRadius = 12 + amplitude * 10;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
    gradient.addColorStop(0, `rgba(255,215,0,${0.8 + amplitude * 0.2})`);
    gradient.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }, [audioEngine, isOn, isPlaying]);

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
    <div className="glass-panel rounded-xl p-3 border border-ultra-gold/20 flex flex-col items-center gap-2">
      <h4 className="font-orbitron font-bold text-ultra-gold text-xs tracking-wider">SOUND MAGNET</h4>
      <canvas
        ref={canvasRef}
        width={160}
        height={160}
        className="rounded-lg"
      />
    </div>
  );
}
