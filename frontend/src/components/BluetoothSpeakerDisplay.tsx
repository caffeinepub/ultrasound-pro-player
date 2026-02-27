import { useRef, useEffect, useCallback } from 'react';
import { AudioEngineControls } from '../hooks/useAudioEngine';

interface Props {
  audioEngine: AudioEngineControls;
  isPlaying: boolean;
}

// Compute RMS amplitude from analyser data (0–1)
function getRMS(analyser: AnalyserNode): number {
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += (data[i] / 255) * (data[i] / 255);
  }
  return Math.sqrt(sum / data.length);
}

// Convert RMS to approximate dB SPL (simulated)
function rmsToDb(rms: number): number {
  if (rms < 0.001) return -60;
  return Math.max(-60, 20 * Math.log10(rms) + 90);
}

// Convert RMS to simulated output watts
function rmsToWatts(rms: number): number {
  return Math.round(rms * rms * 80000);
}

interface SpeakerProps {
  amplitude: number; // 0–1
  label: string;
  index: number;
}

function SpeakerIllustration({ amplitude, label, index }: SpeakerProps) {
  const scale = 1 + amplitude * 0.12;
  const coneScale = 1 + amplitude * 0.18;
  const glowIntensity = Math.round(amplitude * 255);
  const glowAlpha = 0.3 + amplitude * 0.7;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Speaker body */}
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: 110,
          height: 110,
          background: `radial-gradient(circle at 40% 35%, rgba(40,40,60,0.95), rgba(10,10,20,0.98))`,
          border: `2px solid rgba(255,215,0,${0.2 + amplitude * 0.6})`,
          boxShadow: `0 0 ${10 + amplitude * 30}px rgba(255,215,0,${glowAlpha}), 0 0 ${20 + amplitude * 50}px rgba(0,191,255,${glowAlpha * 0.5}), inset 0 0 15px rgba(0,0,0,0.8)`,
          transform: `scale(${scale})`,
          transition: 'transform 0.05s ease-out',
        }}
      >
        {/* Outer ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: 96,
            height: 96,
            border: `1px solid rgba(255,215,0,${0.15 + amplitude * 0.4})`,
          }}
        />
        {/* Middle ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: 72,
            height: 72,
            border: `1px solid rgba(0,191,255,${0.2 + amplitude * 0.5})`,
            background: `radial-gradient(circle, rgba(0,191,255,${amplitude * 0.08}), transparent 70%)`,
          }}
        />
        {/* Cone (inner circle that pulses) */}
        <div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            width: 50,
            height: 50,
            background: `radial-gradient(circle at 40% 35%, rgba(80,80,100,0.9), rgba(20,20,40,0.95))`,
            border: `2px solid rgba(255,215,0,${0.3 + amplitude * 0.7})`,
            boxShadow: `0 0 ${5 + amplitude * 20}px rgba(255,215,0,${glowAlpha}), inset 0 0 8px rgba(255,215,0,${amplitude * 0.3})`,
            transform: `scale(${coneScale})`,
            transition: 'transform 0.04s ease-out',
          }}
        >
          {/* Dust cap */}
          <div
            className="rounded-full"
            style={{
              width: 18,
              height: 18,
              background: `radial-gradient(circle, rgba(${glowIntensity},${Math.round(215 * amplitude)},0,0.9), rgba(20,20,40,0.8))`,
              boxShadow: `0 0 ${amplitude * 15}px rgba(255,215,0,${glowAlpha})`,
            }}
          />
        </div>

        {/* Speaker image overlay */}
        <img
          src="/assets/generated/bluetooth-speaker.dim_120x120.png"
          alt={`Speaker ${index + 1}`}
          className="absolute inset-0 w-full h-full object-contain rounded-full"
          style={{ opacity: 0.18, mixBlendMode: 'screen' }}
        />
      </div>

      {/* Speaker label */}
      <div
        className="font-orbitron text-xs font-bold uppercase tracking-wider text-center"
        style={{ color: `rgba(255,215,0,${0.5 + amplitude * 0.5})` }}
      >
        {label}
      </div>

      {/* Cone movement indicator */}
      <div className="flex gap-1 items-end" style={{ height: 16 }}>
        {[0.2, 0.5, 0.8, 1.0, 0.8, 0.5, 0.2].map((h, i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: 3,
              height: Math.max(3, h * amplitude * 16),
              background: `rgba(255,215,0,${0.4 + amplitude * 0.6})`,
              transition: 'height 0.05s ease-out',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function BluetoothSpeakerDisplay({ audioEngine, isPlaying }: Props) {
  const amplitudeRef = useRef(0);
  const displayAmplitudeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dbDisplayRef = useRef<HTMLSpanElement>(null);
  const wattsDisplayRef = useRef<HTMLSpanElement>(null);
  const speaker1Ref = useRef<HTMLDivElement>(null);
  const speaker2Ref = useRef<HTMLDivElement>(null);
  const speaker3Ref = useRef<HTMLDivElement>(null);

  const animate = useCallback(() => {
    const analyser = audioEngine.getAnalyser();
    if (analyser) {
      const rms = getRMS(analyser);
      // Smooth the amplitude
      amplitudeRef.current = amplitudeRef.current * 0.7 + rms * 0.3;
    } else {
      amplitudeRef.current *= 0.95;
    }

    const amp = amplitudeRef.current;
    displayAmplitudeRef.current = amp;

    const db = rmsToDb(amp);
    const watts = rmsToWatts(amp);

    // Update DOM directly for performance
    if (dbDisplayRef.current) {
      dbDisplayRef.current.textContent = `${db.toFixed(1)} dB`;
    }
    if (wattsDisplayRef.current) {
      wattsDisplayRef.current.textContent = `${watts.toLocaleString()} W`;
    }

    // Update speaker animations via CSS custom properties
    const scale = 1 + amp * 0.12;
    const coneScale = 1 + amp * 0.18;
    const glowAlpha = 0.3 + amp * 0.7;
    const borderAlpha = 0.2 + amp * 0.6;

    [speaker1Ref, speaker2Ref, speaker3Ref].forEach((ref) => {
      if (ref.current) {
        const body = ref.current.querySelector('.spk-body') as HTMLElement;
        const cone = ref.current.querySelector('.spk-cone') as HTMLElement;
        const bars = ref.current.querySelectorAll('.spk-bar') as NodeListOf<HTMLElement>;
        const dustCap = ref.current.querySelector('.spk-dust') as HTMLElement;

        if (body) {
          body.style.transform = `scale(${scale})`;
          body.style.borderColor = `rgba(255,215,0,${borderAlpha})`;
          body.style.boxShadow = `0 0 ${10 + amp * 30}px rgba(255,215,0,${glowAlpha}), 0 0 ${20 + amp * 50}px rgba(0,191,255,${glowAlpha * 0.5}), inset 0 0 15px rgba(0,0,0,0.8)`;
        }
        if (cone) {
          cone.style.transform = `scale(${coneScale})`;
          cone.style.borderColor = `rgba(255,215,0,${0.3 + amp * 0.7})`;
          cone.style.boxShadow = `0 0 ${5 + amp * 20}px rgba(255,215,0,${glowAlpha}), inset 0 0 8px rgba(255,215,0,${amp * 0.3})`;
        }
        if (dustCap) {
          const g = Math.round(amp * 255);
          dustCap.style.background = `radial-gradient(circle, rgba(${g},${Math.round(215 * amp)},0,0.9), rgba(20,20,40,0.8))`;
          dustCap.style.boxShadow = `0 0 ${amp * 15}px rgba(255,215,0,${glowAlpha})`;
        }
        const barHeights = [0.2, 0.5, 0.8, 1.0, 0.8, 0.5, 0.2];
        bars.forEach((bar, i) => {
          bar.style.height = `${Math.max(3, barHeights[i] * amp * 16)}px`;
          bar.style.background = `rgba(255,215,0,${0.4 + amp * 0.6})`;
        });
      }
    });

    rafRef.current = requestAnimationFrame(animate);
  }, [audioEngine]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  const speakerLabels = ['BT SPEAKER 1', 'BT SPEAKER 2', 'BT SPEAKER 3'];
  const speakerRefs = [speaker1Ref, speaker2Ref, speaker3Ref];

  return (
    <div
      ref={containerRef}
      className="glass-panel p-5 flex flex-col gap-4"
    >
      {/* Title */}
      <div className="flex items-center justify-between">
        <h2
          className="font-orbitron font-black text-sm uppercase tracking-widest text-glow-gold"
          style={{ color: '#FFD700' }}
        >
          📡 Bluetooth Speaker Output
        </h2>
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full"
          style={{
            background: isPlaying ? 'rgba(0,255,100,0.1)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${isPlaying ? 'rgba(0,255,100,0.4)' : 'rgba(255,255,255,0.1)'}`,
          }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: isPlaying ? '#00FF64' : 'rgba(255,255,255,0.3)',
              boxShadow: isPlaying ? '0 0 8px rgba(0,255,100,0.8)' : 'none',
              animation: isPlaying ? 'battery-fill 1s ease-in-out infinite' : 'none',
            }}
          />
          <span
            className="font-orbitron text-xs uppercase tracking-wider"
            style={{ color: isPlaying ? '#00FF64' : 'rgba(255,255,255,0.3)' }}
          >
            {isPlaying ? 'LIVE' : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* Live Stats Bar */}
      <div
        className="flex items-center justify-around rounded-xl p-3"
        style={{
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,215,0,0.1)',
        }}
      >
        <div className="text-center">
          <div className="font-rajdhani text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Output Power
          </div>
          <div className="font-orbitron font-black text-lg" style={{ color: '#FFD700' }}>
            <span ref={wattsDisplayRef}>0 W</span>
          </div>
        </div>
        <div
          className="w-px h-10"
          style={{ background: 'rgba(255,215,0,0.15)' }}
        />
        <div className="text-center">
          <div className="font-rajdhani text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
            dB Level
          </div>
          <div className="font-orbitron font-black text-lg" style={{ color: '#00BFFF' }}>
            <span ref={dbDisplayRef}>-60.0 dB</span>
          </div>
        </div>
        <div
          className="w-px h-10"
          style={{ background: 'rgba(255,215,0,0.15)' }}
        />
        <div className="text-center">
          <div className="font-rajdhani text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Test Mode
          </div>
          <div className="font-orbitron font-black text-xs" style={{ color: 'rgba(255,215,0,0.7)' }}>
            TEST BEFORE
            <br />
            YOU BUY IT
          </div>
        </div>
      </div>

      {/* 3 Speakers */}
      <div className="flex items-end justify-around gap-2 flex-wrap">
        {speakerLabels.map((label, idx) => (
          <div key={idx} ref={speakerRefs[idx]} className="flex flex-col items-center gap-2">
            {/* Speaker body */}
            <div
              className="spk-body relative flex items-center justify-center rounded-full"
              style={{
                width: 110,
                height: 110,
                background: 'radial-gradient(circle at 40% 35%, rgba(40,40,60,0.95), rgba(10,10,20,0.98))',
                border: '2px solid rgba(255,215,0,0.2)',
                boxShadow: '0 0 10px rgba(255,215,0,0.3), inset 0 0 15px rgba(0,0,0,0.8)',
                transition: 'transform 0.05s ease-out',
              }}
            >
              {/* Outer ring */}
              <div
                className="absolute rounded-full"
                style={{ width: 96, height: 96, border: '1px solid rgba(255,215,0,0.15)' }}
              />
              {/* Middle ring */}
              <div
                className="absolute rounded-full"
                style={{ width: 72, height: 72, border: '1px solid rgba(0,191,255,0.2)' }}
              />
              {/* Cone */}
              <div
                className="spk-cone absolute rounded-full flex items-center justify-center"
                style={{
                  width: 50,
                  height: 50,
                  background: 'radial-gradient(circle at 40% 35%, rgba(80,80,100,0.9), rgba(20,20,40,0.95))',
                  border: '2px solid rgba(255,215,0,0.3)',
                  transition: 'transform 0.04s ease-out',
                }}
              >
                <div
                  className="spk-dust rounded-full"
                  style={{
                    width: 18,
                    height: 18,
                    background: 'radial-gradient(circle, rgba(80,60,0,0.9), rgba(20,20,40,0.8))',
                  }}
                />
              </div>
              {/* Speaker image overlay */}
              <img
                src="/assets/generated/bluetooth-speaker.dim_120x120.png"
                alt={label}
                className="absolute inset-0 w-full h-full object-contain rounded-full"
                style={{ opacity: 0.15, mixBlendMode: 'screen', pointerEvents: 'none' }}
              />
            </div>

            {/* Label */}
            <div
              className="font-orbitron text-xs font-bold uppercase tracking-wider text-center"
              style={{ color: 'rgba(255,215,0,0.6)' }}
            >
              {label}
            </div>

            {/* Cone movement bars */}
            <div className="flex gap-1 items-end" style={{ height: 16 }}>
              {[0.2, 0.5, 0.8, 1.0, 0.8, 0.5, 0.2].map((_, i) => (
                <div
                  key={i}
                  className="spk-bar rounded-full"
                  style={{
                    width: 3,
                    height: 3,
                    background: 'rgba(255,215,0,0.4)',
                    transition: 'height 0.05s ease-out',
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom note */}
      <div
        className="text-center font-rajdhani text-xs"
        style={{ color: 'rgba(255,255,255,0.25)' }}
      >
        Simulated output — run your settings through the Bluetooth speaker to see what it does
      </div>
    </div>
  );
}
