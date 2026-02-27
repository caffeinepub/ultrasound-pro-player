import { useRef, useEffect, useCallback } from 'react';
import { AudioEngineControls } from '../hooks/useAudioEngine';

interface Props {
  audioEngine: AudioEngineControls;
  isPlaying: boolean;
}

export function SpectrumVisualizer({ audioEngine, isPlaying }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = audioEngine.getAnalyser();
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (!analyser) {
      // Draw idle waveform
      ctx.strokeStyle = 'rgba(255,215,0,0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    const barWidth = (width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * height;
      const intensity = dataArray[i] / 255;

      // Gold to blue gradient based on intensity
      const r = Math.floor(255 * intensity + 0 * (1 - intensity));
      const g = Math.floor(215 * intensity + 191 * (1 - intensity));
      const b = Math.floor(0 * intensity + 255 * (1 - intensity));

      ctx.fillStyle = `rgba(${r},${g},${b},${0.6 + intensity * 0.4})`;

      // Draw bar with glow
      ctx.shadowColor = `rgba(${r},${g},${b},0.8)`;
      ctx.shadowBlur = 4;
      ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

      x += barWidth;
      if (x > width) break;
    }

    // Draw top line
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,215,0,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.stroke();
  }, [audioEngine]);

  const startLoop = useCallback(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    const loop = () => {
      if (!isRunningRef.current) return;
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [draw]);

  const stopLoop = useCallback(() => {
    isRunningRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Always run the visualizer loop
    startLoop();
    return () => stopLoop();
  }, [startLoop, stopLoop]);

  // Resize canvas to match container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeObserver = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });
    resizeObserver.observe(canvas);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden"
      style={{
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,215,0,0.15)',
        height: '120px'
      }}
    >
      {/* Background image */}
      <img
        src="/assets/generated/spectrum-hero.dim_800x200.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block' }}
      />
      <div
        className="absolute top-2 left-3 font-orbitron text-xs font-bold uppercase tracking-widest"
        style={{ color: 'rgba(255,215,0,0.5)' }}
      >
        Spectrum Analyzer
      </div>
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center font-orbitron text-xs uppercase tracking-widest"
          style={{ color: 'rgba(255,215,0,0.2)' }}
        >
          — Awaiting Signal —
        </div>
      )}
    </div>
  );
}
