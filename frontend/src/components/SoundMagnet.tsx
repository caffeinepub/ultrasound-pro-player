import { useRef, useEffect, useCallback } from 'react';
import { AudioEngineControls } from '../hooks/useAudioEngine';

interface Props {
  audioEngine: AudioEngineControls;
  isOn: boolean;
}

export function SoundMagnet({ audioEngine, isOn }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const amplitudeRef = useRef(0);
  const phaseRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = audioEngine.getAnalyser();
    if (analyser) {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += (data[i] / 255) ** 2;
      const rms = Math.sqrt(sum / data.length);
      amplitudeRef.current = amplitudeRef.current * 0.8 + rms * 0.2;
    } else {
      amplitudeRef.current *= 0.97;
    }

    phaseRef.current += 0.025;

    const amp = amplitudeRef.current;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    if (!isOn) return;

    // Base radius grows with amplitude — much larger than any speaker
    const baseRadius = Math.min(w, h) * 0.15;
    const maxRadius = Math.min(w, h) * 0.48;
    const dynamicRadius = baseRadius + amp * (maxRadius - baseRadius);

    // Draw concentric glowing rings
    const numRings = 8;
    for (let r = numRings; r >= 1; r--) {
      const ringFraction = r / numRings;
      const ringRadius = dynamicRadius * ringFraction;
      const pulseOffset = Math.sin(phaseRef.current - ringFraction * Math.PI * 2) * 0.15;
      const finalRadius = ringRadius * (1 + pulseOffset * amp);

      const alpha = (1 - ringFraction * 0.7) * (0.15 + amp * 0.6);
      const lineWidth = (1 - ringFraction * 0.5) * (1 + amp * 3);

      // Gold outer rings, blue inner rings
      const goldBlend = ringFraction;
      const rVal = Math.round(255 * goldBlend + 0 * (1 - goldBlend));
      const gVal = Math.round(215 * goldBlend + 191 * (1 - goldBlend));
      const bVal = Math.round(0 * goldBlend + 255 * (1 - goldBlend));

      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(1, finalRadius), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${rVal},${gVal},${bVal},${alpha})`;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }

    // Draw radial gradient fill (room-filling field)
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, dynamicRadius);
    gradient.addColorStop(0, `rgba(255,215,0,${0.08 + amp * 0.15})`);
    gradient.addColorStop(0.4, `rgba(0,191,255,${0.04 + amp * 0.08})`);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, dynamicRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw pulsing center magnet core
    const coreRadius = 18 + amp * 20;
    const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
    coreGradient.addColorStop(0, `rgba(255,255,255,${0.6 + amp * 0.4})`);
    coreGradient.addColorStop(0.3, `rgba(255,215,0,${0.5 + amp * 0.5})`);
    coreGradient.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
    ctx.fillStyle = coreGradient;
    ctx.fill();

    // Draw magnetic field lines (radial spokes)
    const numSpokes = 12;
    for (let s = 0; s < numSpokes; s++) {
      const angle = (s / numSpokes) * Math.PI * 2 + phaseRef.current * 0.3;
      const spokeAlpha = (0.05 + amp * 0.2) * (0.5 + 0.5 * Math.sin(phaseRef.current + s));
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * coreRadius, cy + Math.sin(angle) * coreRadius);
      ctx.lineTo(cx + Math.cos(angle) * dynamicRadius, cy + Math.sin(angle) * dynamicRadius);
      ctx.strokeStyle = `rgba(255,215,0,${spokeAlpha})`;
      ctx.lineWidth = 0.5 + amp * 1.5;
      ctx.stroke();
    }

    // Label
    ctx.font = 'bold 11px Orbitron, monospace';
    ctx.fillStyle = `rgba(255,215,0,${0.4 + amp * 0.5})`;
    ctx.textAlign = 'center';
    ctx.fillText('SOUND MAGNET FIELD', cx, cy + dynamicRadius + 18);

    // Room size indicator
    const roomFill = Math.min(100, Math.round((dynamicRadius / maxRadius) * 100));
    ctx.font = '10px Rajdhani, sans-serif';
    ctx.fillStyle = `rgba(0,191,255,${0.5 + amp * 0.4})`;
    ctx.fillText(`Room Fill: ${roomFill}%`, cx, cy + dynamicRadius + 32);
  }, [audioEngine, isOn]);

  const startLoop = useCallback(() => {
    const loop = () => {
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [draw]);

  const stopLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    startLoop();
    return () => stopLoop();
  }, [startLoop, stopLoop]);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });
    ro.observe(canvas);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    return () => ro.disconnect();
  }, []);

  if (!isOn) return null;

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        height: 280,
        background: 'radial-gradient(circle at center, rgba(20,10,40,0.95), rgba(6,9,24,0.98))',
        border: '1px solid rgba(255,215,0,0.2)',
        boxShadow: '0 0 40px rgba(255,215,0,0.1), inset 0 0 30px rgba(0,0,0,0.5)',
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block' }}
      />
      {/* Corner label */}
      <div
        className="absolute top-3 left-4 font-orbitron font-black text-xs uppercase tracking-widest"
        style={{ color: 'rgba(255,215,0,0.6)' }}
      >
        🧲 Gerrod's Sound Magnet
      </div>
      <div
        className="absolute top-3 right-4 font-rajdhani text-xs"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        Stimulation Virtual Music Magnifier
      </div>
    </div>
  );
}
