import { useRef, useEffect, useCallback } from 'react';
import { AudioEngineControls } from '../hooks/useAudioEngine';
import { BatteryState } from '../hooks/useBatteryCharging';

interface Props {
  audioEngine: AudioEngineControls;
  batteryState: BatteryState;
}

const SMART_CHIP_MONITORS = ['Boost', 'Effect', 'Lagging', 'Clipping', 'Stuttering', 'Zero BG Noise'];

const PROCESSOR_CLASSES = [
  { name: 'Class A+', color: '#FFD700', desc: 'Ultra Clean' },
  { name: 'Class B', color: '#00BFFF', desc: 'Super Clean' },
  { name: 'Class C+', color: '#FF8C00', desc: 'Mega Clean' },
  { name: 'Class D', color: '#9B59B6', desc: 'Deep Clean' },
];

function SmartChipCard({ chipNumber, amplitude }: { chipNumber: number; amplitude: number }) {
  const isActive = amplitude > 0.05;
  const chipColor = isActive ? '#FFD700' : 'rgba(255,255,255,0.15)';

  return (
    <div
      className="rounded-xl p-2 flex flex-col gap-1.5"
      style={{
        background: isActive
          ? 'rgba(255,215,0,0.06)'
          : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isActive ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: isActive ? '0 0 10px rgba(255,215,0,0.15)' : 'none',
        transition: 'all 0.15s ease',
        minWidth: 0,
      }}
    >
      {/* Chip header */}
      <div className="flex items-center justify-between">
        <span
          className="font-orbitron font-black text-xs"
          style={{ color: chipColor }}
        >
          SC-{String(chipNumber).padStart(2, '0')}
        </span>
        <div
          className="w-2 h-2 rounded-full"
          style={{
            background: isActive ? '#00FF64' : 'rgba(255,255,255,0.2)',
            boxShadow: isActive ? '0 0 6px rgba(0,255,100,0.8)' : 'none',
            animation: isActive ? 'battery-fill 1s ease-in-out infinite' : 'none',
          }}
        />
      </div>

      {/* Monitor indicators */}
      <div className="grid grid-cols-3 gap-0.5">
        {SMART_CHIP_MONITORS.map((monitor, i) => {
          const monitorActive = isActive && (chipNumber + i) % 3 !== 0;
          return (
            <div
              key={monitor}
              className="rounded px-1 py-0.5 text-center"
              style={{
                background: monitorActive ? 'rgba(0,191,255,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${monitorActive ? 'rgba(0,191,255,0.3)' : 'rgba(255,255,255,0.05)'}`,
              }}
            >
              <span
                className="font-rajdhani font-bold"
                style={{
                  fontSize: '8px',
                  color: monitorActive ? '#00BFFF' : 'rgba(255,255,255,0.25)',
                  lineHeight: 1,
                  display: 'block',
                }}
              >
                {monitor.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProcessorPage({ audioEngine, batteryState }: Props) {
  const amplitudeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const freqBarsRef = useRef<HTMLDivElement[]>([]);
  const stabilizerBarRef = useRef<HTMLDivElement>(null);
  const chipsContainerRef = useRef<HTMLDivElement>(null);
  const ampDisplayRef = useRef<HTMLSpanElement>(null);

  const animate = useCallback(() => {
    const analyser = audioEngine.getAnalyser();
    if (analyser) {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += (data[i] / 255) ** 2;
      const rms = Math.sqrt(sum / data.length);
      amplitudeRef.current = amplitudeRef.current * 0.75 + rms * 0.25;

      // Update frequency bars
      const step = Math.floor(data.length / freqBarsRef.current.length);
      freqBarsRef.current.forEach((bar, i) => {
        if (!bar) return;
        const val = data[i * step] / 255;
        bar.style.height = `${Math.max(4, val * 60)}px`;
        const r = Math.round(255 * val);
        const g = Math.round(215 * val + 191 * (1 - val));
        const b = Math.round(255 * (1 - val));
        bar.style.background = `rgba(${r},${g},${b},0.9)`;
        bar.style.boxShadow = `0 0 ${val * 8}px rgba(${r},${g},${b},0.8)`;
      });

      // Update stabilizer bar
      if (stabilizerBarRef.current) {
        const stabVal = 80000 + amplitudeRef.current * 10000;
        stabilizerBarRef.current.style.width = `${Math.min(100, amplitudeRef.current * 100 + 20)}%`;
      }

      // Update amp display
      if (ampDisplayRef.current) {
        const stabVal = Math.round(80000 + amplitudeRef.current * 10000);
        ampDisplayRef.current.textContent = stabVal.toLocaleString();
      }
    } else {
      amplitudeRef.current *= 0.95;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [audioEngine]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  const amplitude = amplitudeRef.current;

  return (
    <div className="flex flex-col gap-4">
      {/* ── HEADER ── */}
      <div
        className="rounded-2xl p-5 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(0,191,255,0.05))',
          border: '1px solid rgba(255,215,0,0.3)',
          boxShadow: '0 0 30px rgba(255,215,0,0.1)',
        }}
      >
        <div
          className="font-orbitron font-black text-lg md:text-xl uppercase tracking-widest text-glow-gold mb-1"
          style={{ color: '#FFD700' }}
        >
          ⚙️ Number 1 Processor in the Whole World
        </div>
        <div className="font-rajdhani text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Not Your Standard Regular Classes — These Are More Super Clean Sound Control
        </div>

        {/* Classes */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {PROCESSOR_CLASSES.map((cls) => (
            <div
              key={cls.name}
              className="flex flex-col items-center px-4 py-2 rounded-xl"
              style={{
                background: `rgba(${cls.color === '#FFD700' ? '255,215,0' : cls.color === '#00BFFF' ? '0,191,255' : cls.color === '#FF8C00' ? '255,140,0' : '155,89,182'},0.1)`,
                border: `1px solid ${cls.color}40`,
                boxShadow: `0 0 12px ${cls.color}30`,
              }}
            >
              <span className="font-orbitron font-black text-sm" style={{ color: cls.color }}>
                {cls.name}
              </span>
              <span className="font-rajdhani text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {cls.desc}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 20 SMART CHIPS ── */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,215,0,0.15)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3
            className="font-orbitron font-black text-sm uppercase tracking-widest"
            style={{ color: '#FFD700' }}
          >
            🔬 20 Smart Chips
          </h3>
          <span className="font-rajdhani text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Each with Built-in Control Monitor
          </span>
        </div>
        <div
          ref={chipsContainerRef}
          className="grid gap-2"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}
        >
          {Array.from({ length: 20 }, (_, i) => (
            <SmartChipCard key={i} chipNumber={i + 1} amplitude={amplitude} />
          ))}
        </div>
        {/* Monitor legend */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {SMART_CHIP_MONITORS.map((m) => (
            <span
              key={m}
              className="font-rajdhani text-xs px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(0,191,255,0.08)',
                border: '1px solid rgba(0,191,255,0.2)',
                color: 'rgba(0,191,255,0.7)',
              }}
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* ── STABILIZER + AMP ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Smart Chip Stabilizer */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,215,0,0.2)',
          }}
        >
          <h3
            className="font-orbitron font-black text-sm uppercase tracking-widest mb-1"
            style={{ color: '#FFD700' }}
          >
            🎛️ Smart Chip Stabilizer
          </h3>
          <div className="font-rajdhani text-xs mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
            80Hz Deep Low Manager
          </div>

          {/* Range display */}
          <div className="flex items-center justify-between mb-2">
            <span className="font-orbitron text-xs" style={{ color: 'rgba(255,215,0,0.6)' }}>
              80,000
            </span>
            <span
              className="font-orbitron font-black text-sm"
              style={{ color: '#FFD700' }}
            >
              <span ref={ampDisplayRef}>80,000</span>
            </span>
            <span className="font-orbitron text-xs" style={{ color: 'rgba(255,215,0,0.6)' }}>
              90,000
            </span>
          </div>

          {/* Stabilizer bar */}
          <div
            className="relative rounded-full overflow-hidden"
            style={{
              height: 12,
              background: 'rgba(255,215,0,0.1)',
              border: '1px solid rgba(255,215,0,0.2)',
            }}
          >
            <div
              ref={stabilizerBarRef}
              className="absolute left-0 top-0 h-full rounded-full"
              style={{
                width: '20%',
                background: 'linear-gradient(90deg, #FFD700, #00BFFF)',
                boxShadow: '0 0 10px rgba(255,215,0,0.6)',
                transition: 'width 0.1s ease-out',
              }}
            />
          </div>

          <div
            className="font-rajdhani text-xs mt-2"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Range: 80,000 – 90,000
          </div>
        </div>

        {/* Intelligent Amp */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(0,191,255,0.2)',
          }}
        >
          <h3
            className="font-orbitron font-black text-sm uppercase tracking-widest mb-1"
            style={{ color: '#00BFFF' }}
          >
            ⚡ Intelligent Amp
          </h3>
          <div
            className="font-rajdhani font-bold text-sm mb-2"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Does NOT Limit Music — It CORRECTS It
          </div>
          <div className="space-y-1">
            {[
              'Full Stabilizer Power',
              'Super Amp Control',
              'Super Modes for Everything',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: '#00BFFF', boxShadow: '0 0 6px rgba(0,191,255,0.8)' }}
                />
                <span className="font-rajdhani text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
          <div
            className="mt-3 px-3 py-1.5 rounded-lg text-center font-orbitron text-xs font-bold"
            style={{
              background: 'rgba(0,191,255,0.1)',
              border: '1px solid rgba(0,191,255,0.3)',
              color: '#00BFFF',
            }}
          >
            IT IS A STABILIZER
          </div>
        </div>
      </div>

      {/* ── AUTOMATIC FREQUENCY CONTROL ── */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,140,0,0.25)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3
            className="font-orbitron font-black text-sm uppercase tracking-widest"
            style={{ color: '#FF8C00' }}
          >
            🎵 Automatic Frequency Control
          </h3>
          <span className="font-rajdhani text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Adjusted to All Songs
          </span>
        </div>

        {/* Live frequency bars */}
        <div
          className="flex items-end gap-0.5 rounded-xl overflow-hidden p-2"
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,140,0,0.1)',
            height: 80,
          }}
        >
          {Array.from({ length: 32 }, (_, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) freqBarsRef.current[i] = el;
              }}
              className="flex-1 rounded-t-sm"
              style={{
                height: 4,
                background: 'rgba(255,140,0,0.4)',
                transition: 'height 0.05s ease-out',
                minWidth: 0,
              }}
            />
          ))}
        </div>

        <div className="font-rajdhani text-xs mt-2 text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Processor listens to the music and auto-adjusts frequency balance for every song
        </div>
      </div>

      {/* ── DAW VST GENERATOR + SPECS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DAW VST Generator */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(155,89,182,0.3)',
          }}
        >
          <h3
            className="font-orbitron font-black text-sm uppercase tracking-widest mb-3"
            style={{ color: '#9B59B6' }}
          >
            🎛️ Special DAW VST Generator
          </h3>
          <div className="space-y-2">
            {[
              { label: 'Big Grant FPGA', icon: '🔲' },
              { label: 'CPU Booster', icon: '⚡' },
              { label: 'Signal Stimulation', icon: '📡' },
              { label: 'DAW VST Plug-in', icon: '🎚️' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <span className="font-rajdhani text-sm font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {item.label}
                </span>
                <div
                  className="ml-auto w-2 h-2 rounded-full"
                  style={{ background: '#9B59B6', boxShadow: '0 0 6px rgba(155,89,182,0.8)' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Processor Specs */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(0,255,100,0.2)',
          }}
        >
          <h3
            className="font-orbitron font-black text-sm uppercase tracking-widest mb-3"
            style={{ color: '#00FF64' }}
          >
            📊 Processor Specs
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Voltage', value: '12 Volt' },
              { label: 'Cores', value: '20 Core' },
              { label: 'Thunders', value: '30 Wide' },
              { label: 'Rank', value: '#1 World' },
            ].map((spec) => (
              <div
                key={spec.label}
                className="rounded-lg p-2 text-center"
                style={{
                  background: 'rgba(0,255,100,0.05)',
                  border: '1px solid rgba(0,255,100,0.15)',
                }}
              >
                <div className="font-orbitron font-black text-sm" style={{ color: '#00FF64' }}>
                  {spec.value}
                </div>
                <div className="font-rajdhani text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {spec.label}
                </div>
              </div>
            ))}
          </div>

          {/* Battery integration */}
          <div
            className="mt-3 rounded-lg p-2 flex items-center justify-between"
            style={{
              background: 'rgba(255,215,0,0.05)',
              border: '1px solid rgba(255,215,0,0.15)',
            }}
          >
            <span className="font-rajdhani text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Battery Mix
            </span>
            <span className="font-orbitron font-black text-sm" style={{ color: '#FFD700' }}>
              {batteryState.percentage}% — {batteryState.outputPower.toLocaleString()}W
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
