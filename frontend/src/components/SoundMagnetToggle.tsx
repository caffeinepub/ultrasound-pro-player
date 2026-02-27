interface Props {
  isOn: boolean;
  onToggle: () => void;
}

export function SoundMagnetToggle({ isOn, onToggle }: Props) {
  return (
    <div
      className="flex items-center justify-between rounded-2xl px-5 py-4"
      style={{
        background: isOn
          ? 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(0,191,255,0.06))'
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isOn ? 'rgba(255,215,0,0.4)' : 'rgba(255,255,255,0.1)'}`,
        boxShadow: isOn ? '0 0 20px rgba(255,215,0,0.15)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Left: info */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 18 }}>🧲</span>
          <span
            className="font-orbitron font-black text-sm uppercase tracking-widest"
            style={{ color: isOn ? '#FFD700' : 'rgba(255,255,255,0.5)' }}
          >
            Sound Magnet
          </span>
        </div>
        <span className="font-rajdhani text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Stimulation Virtual Music Magnifier — by Gerrod
        </span>
        <span className="font-rajdhani text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          For small speakers like Musi Baby M88
        </span>
      </div>

      {/* Right: toggle button */}
      <button
        onClick={onToggle}
        className="relative flex items-center shrink-0 ml-4"
        style={{
          width: 64,
          height: 32,
          borderRadius: 16,
          background: isOn
            ? 'linear-gradient(90deg, #FFD700, #FF8C00)'
            : 'rgba(255,255,255,0.1)',
          border: `2px solid ${isOn ? 'rgba(255,215,0,0.6)' : 'rgba(255,255,255,0.15)'}`,
          boxShadow: isOn ? '0 0 15px rgba(255,215,0,0.5)' : 'none',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          outline: 'none',
        }}
        aria-label={isOn ? 'Turn Sound Magnet OFF' : 'Turn Sound Magnet ON'}
      >
        {/* Thumb */}
        <div
          style={{
            position: 'absolute',
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: isOn ? '#fff' : 'rgba(255,255,255,0.4)',
            boxShadow: isOn ? '0 0 8px rgba(255,215,0,0.8)' : 'none',
            left: isOn ? 36 : 4,
            transition: 'left 0.3s ease, background 0.3s ease',
          }}
        />
        {/* Label inside */}
        <span
          className="font-orbitron font-black absolute"
          style={{
            fontSize: 8,
            color: isOn ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.3)',
            left: isOn ? 6 : 14,
            transition: 'all 0.3s ease',
            userSelect: 'none',
          }}
        >
          {isOn ? 'ON' : 'OFF'}
        </span>
      </button>
    </div>
  );
}
