import { useCallback, useRef, useState, useMemo } from 'react';
import { EQ_FREQUENCIES, FREQ_LABELS, EQ_GAIN_MIN, EQ_GAIN_MAX } from '../utils/audioConstants';
import { INSTRUMENTS, BAND_INDEX_TO_INSTRUMENT_INDEX } from '../utils/instrumentMappings';
import { AudioEngineControls } from '../hooks/useAudioEngine';

interface Props {
  audioEngine: AudioEngineControls;
  eqGains: number[];
  instrumentGains: number[];
  onEqGainChange: (bandIndex: number, gain: number) => void;
  onInstrumentChange: (instrumentIndex: number, gain: number) => void;
  highlightedBands: Set<number>;
  highlightedInstruments: Set<number>;
}

// Helper: convert hex color string to "r,g,b" for rgba() usage
function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '255,255,255';
  return `${r},${g},${b}`;
}

// 20 bands split into 4 rows of 5
const ROWS = 4;
const COLS = 5;

export function EQStabilizer({
  audioEngine,
  eqGains,
  instrumentGains,
  onEqGainChange,
  onInstrumentChange,
  highlightedBands,
  highlightedInstruments,
}: Props) {
  const eqDebounce = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const instDebounce = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const [activeBandIdx, setActiveBandIdx] = useState<number | null>(null);

  // ── EQ band slider handler ──────────────────────────────────────────────────
  const handleEqSlider = useCallback(
    (bandIndex: number, value: number) => {
      onEqGainChange(bandIndex, value);
      setActiveBandIdx(bandIndex);
      const existing = eqDebounce.current.get(bandIndex);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => {
        audioEngine.setFilterGain(bandIndex, value);
        eqDebounce.current.delete(bandIndex);
        setActiveBandIdx(null);
      }, 8);
      eqDebounce.current.set(bandIndex, timer);
    },
    [audioEngine, onEqGainChange]
  );

  // ── Instrument slider handler ───────────────────────────────────────────────
  const handleInstSlider = useCallback(
    (instrumentIndex: number, value: number) => {
      onInstrumentChange(instrumentIndex, value);
      const existing = instDebounce.current.get(instrumentIndex);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => {
        const instrument = INSTRUMENTS[instrumentIndex];
        const bandIdx = instrument.bandIndices[0];
        audioEngine.setFilterGain(bandIdx, value);
        instDebounce.current.delete(instrumentIndex);
      }, 8);
      instDebounce.current.set(instrumentIndex, timer);
    },
    [audioEngine, onInstrumentChange]
  );

  // ── Legend counts ───────────────────────────────────────────────────────────
  const { boostCount, cutCount, centerCount } = useMemo(() => {
    let boost = 0;
    let cut = 0;
    let center = 0;
    eqGains.forEach((g) => {
      if (g > 0) boost++;
      else if (g < 0) cut++;
      else center++;
    });
    return { boostCount: boost, cutCount: cut, centerCount: center };
  }, [eqGains]);

  // Build 4 rows × 5 cols of band indices: [[0..4],[5..9],[10..14],[15..19]]
  const rows: number[][] = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => r * COLS + c)
  );

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(4,8,28,0.95)',
        border: '1px solid rgba(255,215,0,0.18)',
        boxShadow: '0 0 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,215,0,0.08)',
      }}
    >
      {/* ── Panel header ── */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid rgba(255,215,0,0.1)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🎚</span>
          <h3
            className="font-orbitron font-black text-xs uppercase tracking-widest"
            style={{ color: '#FFD700' }}
          >
            EQ STABILIZER — 20 Bands · 20 Instruments
          </h3>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full font-rajdhani font-bold text-xs uppercase tracking-wider"
            style={{
              background: 'rgba(255,215,0,0.1)',
              border: '1px solid rgba(255,215,0,0.3)',
              color: '#FFD700',
            }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: '#FFD700' }}
            />
            Boost ({boostCount})
          </div>
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full font-rajdhani font-bold text-xs uppercase tracking-wider"
            style={{
              background: 'rgba(0,191,255,0.1)',
              border: '1px solid rgba(0,191,255,0.3)',
              color: '#00BFFF',
            }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: '#00BFFF' }}
            />
            Cut ({cutCount})
          </div>
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full font-rajdhani font-bold text-xs uppercase tracking-wider"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.35)' }}
            />
            0 dB ({centerCount})
          </div>
        </div>
      </div>

      {/* ── 4 rows × 5 cols grid ── */}
      <div className="p-3 space-y-2">
        {rows.map((rowBands, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-2">
            {rowBands.map((bandIdx) => {
              const eqGain = eqGains[bandIdx] ?? 0;
              const instIdx = BAND_INDEX_TO_INSTRUMENT_INDEX[bandIdx];
              const instrument = instIdx >= 0 ? INSTRUMENTS[instIdx] : null;
              const instGain = instIdx >= 0 ? (instrumentGains[instIdx] ?? 0) : 0;

              const isBandHighlighted =
                highlightedBands.has(bandIdx) ||
                activeBandIdx === bandIdx ||
                (instIdx >= 0 && highlightedInstruments.has(instIdx));

              const isInstActive =
                instIdx >= 0 &&
                (highlightedInstruments.has(instIdx) ||
                  activeBandIdx === bandIdx ||
                  highlightedBands.has(bandIdx));

              const normalizedEq = (eqGain - EQ_GAIN_MIN) / (EQ_GAIN_MAX - EQ_GAIN_MIN);
              const eqFillPct = normalizedEq * 100;
              const normalizedInst = (instGain - EQ_GAIN_MIN) / (EQ_GAIN_MAX - EQ_GAIN_MIN);
              const instFillPct = normalizedInst * 100;

              const instrColor = instrument?.color ?? '#FFD700';
              const instrRgb = hexToRgb(instrColor);

              return (
                <div
                  key={`col-${bandIdx}`}
                  className="flex flex-col items-center rounded-xl transition-all duration-150"
                  style={{
                    padding: '6px 4px 8px',
                    background: isBandHighlighted
                      ? 'rgba(0,191,255,0.07)'
                      : 'rgba(255,255,255,0.025)',
                    border: isBandHighlighted
                      ? '1px solid rgba(0,191,255,0.45)'
                      : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: isBandHighlighted
                      ? '0 0 14px rgba(0,191,255,0.2)'
                      : 'none',
                  }}
                >
                  {/* ── EQ BAND SECTION ── */}

                  {/* Gain readout */}
                  <span
                    className="font-orbitron font-bold text-center"
                    style={{
                      color: isBandHighlighted
                        ? '#00BFFF'
                        : eqGain > 0
                        ? '#FFD700'
                        : eqGain < 0
                        ? '#FF4444'
                        : 'rgba(255,255,255,0.2)',
                      fontSize: '9px',
                      minHeight: '12px',
                      lineHeight: '12px',
                      marginBottom: '3px',
                    }}
                  >
                    {eqGain > 0 ? `+${eqGain}` : eqGain !== 0 ? eqGain : '0'}
                  </span>

                  {/* Vertical EQ slider track */}
                  <div
                    className="relative flex items-center justify-center"
                    style={{ height: '80px', width: '36px', flexShrink: 0 }}
                  >
                    {/* Track background */}
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: '6px',
                        height: '100%',
                        background: 'rgba(255,255,255,0.07)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                      }}
                    />
                    {/* Fill */}
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: '6px',
                        background: isBandHighlighted
                          ? 'rgba(0,191,255,0.75)'
                          : eqGain > 0
                          ? 'rgba(255,215,0,0.75)'
                          : eqGain < 0
                          ? 'rgba(255,68,68,0.65)'
                          : 'rgba(255,255,255,0.06)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bottom: '0',
                        height: `${eqFillPct}%`,
                        transition: 'height 0.05s ease',
                        borderRadius: '3px',
                      }}
                    />
                    {/* 0 dB center line */}
                    <div
                      className="absolute"
                      style={{
                        width: '16px',
                        height: '1px',
                        background: 'rgba(255,255,255,0.22)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        top: '50%',
                        zIndex: 2,
                      }}
                    />
                    {/* Thumb */}
                    <div
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        width: '14px',
                        height: '14px',
                        background: isBandHighlighted
                          ? '#00BFFF'
                          : eqGain < 0
                          ? '#FF6666'
                          : '#FFD700',
                        boxShadow: isBandHighlighted
                          ? '0 0 8px rgba(0,191,255,0.9)'
                          : eqGain < 0
                          ? '0 0 6px rgba(255,68,68,0.8)'
                          : '0 0 8px rgba(255,215,0,0.9)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bottom: `calc(${eqFillPct}% - 7px)`,
                        transition: 'bottom 0.05s ease',
                        zIndex: 5,
                        border: '2px solid rgba(255,255,255,0.3)',
                      }}
                    />
                    {/* Invisible range input overlay */}
                    <input
                      type="range"
                      min={EQ_GAIN_MIN}
                      max={EQ_GAIN_MAX}
                      step={0.5}
                      value={eqGain}
                      onChange={(e) => handleEqSlider(bandIdx, parseFloat(e.target.value))}
                      className="eq-slider"
                      style={{
                        position: 'absolute',
                        opacity: 0.01,
                        width: '36px',
                        height: '80px',
                        cursor: 'pointer',
                        zIndex: 10,
                      }}
                      aria-label={`EQ band ${FREQ_LABELS[bandIdx]}`}
                    />
                  </div>

                  {/* Frequency label */}
                  <span
                    className="font-rajdhani font-bold uppercase text-center mt-1"
                    style={{
                      color: isBandHighlighted ? '#00BFFF' : 'rgba(255,255,255,0.35)',
                      fontSize: '8px',
                      letterSpacing: '0.02em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {FREQ_LABELS[bandIdx]}
                  </span>

                  {/* ── DIVIDER ── */}
                  <div
                    style={{
                      width: '100%',
                      height: '1px',
                      background: 'rgba(255,215,0,0.15)',
                      margin: '5px 0 4px',
                    }}
                  />

                  {/* ── INSTRUMENT SECTION ── */}
                  {instrument && (
                    <>
                      {/* Instrument icon */}
                      <div
                        className="rounded-md overflow-hidden flex items-center justify-center mb-1"
                        style={{
                          width: '32px',
                          height: '32px',
                          background: 'rgba(255,255,255,0.05)',
                          border: isInstActive
                            ? `1px solid ${instrColor}66`
                            : '1px solid rgba(255,255,255,0.08)',
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={instrument.iconPath}
                          alt={instrument.name}
                          style={{ width: '26px', height: '26px', objectFit: 'contain' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const parent = (e.target as HTMLImageElement).parentElement;
                            if (parent) {
                              parent.textContent = instrument.emoji;
                              parent.style.fontSize = '16px';
                            }
                          }}
                        />
                      </div>

                      {/* Instrument name */}
                      <span
                        className="font-rajdhani font-bold text-center leading-tight mb-1"
                        style={{
                          color: isInstActive ? instrColor : 'rgba(255,255,255,0.6)',
                          fontSize: '8px',
                          letterSpacing: '0.02em',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%',
                          display: 'block',
                        }}
                        title={instrument.name}
                      >
                        {instrument.name}
                      </span>

                      {/* Instrument gain readout */}
                      <span
                        className="font-orbitron font-bold text-center"
                        style={{
                          color: isInstActive
                            ? instrColor
                            : instGain > 0
                            ? '#FFD700'
                            : instGain < 0
                            ? '#FF4444'
                            : 'rgba(255,255,255,0.2)',
                          fontSize: '9px',
                          minHeight: '12px',
                          lineHeight: '12px',
                          marginBottom: '3px',
                        }}
                      >
                        {instGain > 0 ? `+${instGain}` : instGain !== 0 ? instGain : '0'}
                      </span>

                      {/* Vertical instrument slider */}
                      <div
                        className="relative flex items-center justify-center"
                        style={{ height: '70px', width: '36px', flexShrink: 0 }}
                      >
                        {/* Track background */}
                        <div
                          className="absolute rounded-full"
                          style={{
                            width: '6px',
                            height: '100%',
                            background: 'rgba(255,255,255,0.07)',
                            left: '50%',
                            transform: 'translateX(-50%)',
                          }}
                        />
                        {/* Fill */}
                        <div
                          className="absolute rounded-full"
                          style={{
                            width: '6px',
                            background: isInstActive
                              ? `rgba(${instrRgb},0.8)`
                              : instGain > 0
                              ? 'rgba(255,215,0,0.65)'
                              : instGain < 0
                              ? 'rgba(255,68,68,0.55)'
                              : 'rgba(255,255,255,0.06)',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            bottom: '0',
                            height: `${instFillPct}%`,
                            transition: 'height 0.05s ease',
                            borderRadius: '3px',
                          }}
                        />
                        {/* 0 dB center line */}
                        <div
                          className="absolute"
                          style={{
                            width: '16px',
                            height: '1px',
                            background: 'rgba(255,255,255,0.22)',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            top: '50%',
                            zIndex: 2,
                          }}
                        />
                        {/* Thumb */}
                        <div
                          className="absolute rounded-full pointer-events-none"
                          style={{
                            width: '14px',
                            height: '14px',
                            background: isInstActive
                              ? instrColor
                              : instGain < 0
                              ? '#FF6666'
                              : '#FFD700',
                            boxShadow: isInstActive
                              ? `0 0 8px ${instrColor}cc`
                              : instGain < 0
                              ? '0 0 6px rgba(255,68,68,0.8)'
                              : '0 0 8px rgba(255,215,0,0.9)',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            bottom: `calc(${instFillPct}% - 7px)`,
                            transition: 'bottom 0.05s ease',
                            zIndex: 5,
                            border: '2px solid rgba(255,255,255,0.3)',
                          }}
                        />
                        {/* Invisible range input — min 44px touch target */}
                        <input
                          type="range"
                          min={EQ_GAIN_MIN}
                          max={EQ_GAIN_MAX}
                          step={0.5}
                          value={instGain}
                          onChange={(e) =>
                            handleInstSlider(instIdx, parseFloat(e.target.value))
                          }
                          className="instrument-slider"
                          style={{
                            position: 'absolute',
                            opacity: 0.01,
                            width: '44px',
                            height: '70px',
                            cursor: 'pointer',
                            zIndex: 10,
                            minHeight: '44px',
                          }}
                          aria-label={`${instrument.name} gain`}
                        />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
