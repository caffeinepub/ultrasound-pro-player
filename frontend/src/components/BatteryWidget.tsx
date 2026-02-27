import { BatteryState } from '../hooks/useBatteryCharging';

interface Props {
  batteryState: BatteryState;
}

const MAX_CAPACITY_W = 80000;
const MAX_CHARGER_W = 200000;

function formatWatts(w: number): string {
  return w.toLocaleString();
}

export function BatteryWidget({ batteryState }: Props) {
  const { percentage, chargingWatts, outputPower, isCharging, isFullyCharged } = batteryState;
  const fillHeight = percentage; // 0-100%

  return (
    <div
      className="flex flex-col items-center gap-4 p-5 rounded-2xl"
      style={{
        background: 'rgba(0,0,0,0.3)',
        border: isFullyCharged
          ? '1px solid rgba(255,215,0,0.6)'
          : '1px solid rgba(255,215,0,0.2)',
        boxShadow: isFullyCharged
          ? '0 0 40px rgba(255,215,0,0.4), inset 0 0 20px rgba(255,215,0,0.05)'
          : isCharging
          ? '0 0 20px rgba(255,215,0,0.15)'
          : 'none',
        animation: isFullyCharged ? 'unlock-burst 1s ease-in-out infinite' : 'none'
      }}
    >
      {/* Title */}
      <div className="flex items-center gap-3 w-full justify-between">
        <div>
          <h3 className="font-orbitron font-black text-sm uppercase tracking-widest" style={{ color: '#FFD700' }}>
            ⚡ Power Cell
          </h3>
          <p className="font-rajdhani text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Capacity: {formatWatts(MAX_CAPACITY_W)}W
          </p>
        </div>
        <div className="text-right">
          <p className="font-rajdhani text-xs" style={{ color: 'rgba(0,191,255,0.7)' }}>
            Charger: {formatWatts(MAX_CHARGER_W)}W
          </p>
        </div>
      </div>

      {/* Battery + Lightning Layout */}
      <div className="flex items-center gap-6 w-full justify-center">
        {/* Lightning Bolt */}
        <div className="flex flex-col items-center gap-1">
          <img
            src="/assets/generated/lightning-bolt-icon.dim_128x128.png"
            alt="Lightning"
            className={`w-12 h-12 object-contain ${isCharging ? 'animate-lightning' : ''}`}
            style={{
              filter: isCharging
                ? 'drop-shadow(0 0 12px rgba(255,215,0,1)) drop-shadow(0 0 24px rgba(255,215,0,0.6))'
                : 'drop-shadow(0 0 4px rgba(255,215,0,0.3))',
              opacity: isFullyCharged ? 1 : isCharging ? 1 : 0.4
            }}
          />
          {isCharging && (
            <div className="flex gap-0.5">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full"
                  style={{
                    background: '#FFD700',
                    animation: `lightning-flash ${0.4 + i * 0.2}s ease-in-out infinite`,
                    animationDelay: `${i * 0.15}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Battery Shape */}
        <div className="relative flex flex-col items-center">
          {/* Battery terminal */}
          <div
            className="w-8 h-2 rounded-t-sm"
            style={{
              background: 'rgba(255,215,0,0.4)',
              border: '1px solid rgba(255,215,0,0.5)',
              borderBottom: 'none'
            }}
          />
          {/* Battery body */}
          <div
            className="relative w-20 overflow-hidden rounded-b-lg"
            style={{
              height: '120px',
              background: 'rgba(0,0,0,0.5)',
              border: '2px solid rgba(255,215,0,0.4)',
              boxShadow: isCharging ? '0 0 20px rgba(255,215,0,0.3)' : 'none'
            }}
          >
            {/* Fill */}
            <div
              className="absolute bottom-0 left-0 right-0 transition-all duration-100"
              style={{
                height: `${fillHeight}%`,
                background: isFullyCharged
                  ? 'linear-gradient(to top, #FFD700, #FFF176)'
                  : percentage > 60
                  ? 'linear-gradient(to top, #FFD700, #FFEC6E)'
                  : percentage > 30
                  ? 'linear-gradient(to top, #FFA500, #FFD700)'
                  : 'linear-gradient(to top, #FF4444, #FF8C00)',
                boxShadow: isCharging
                  ? 'inset 0 0 15px rgba(255,255,255,0.3), 0 0 10px rgba(255,215,0,0.5)'
                  : 'none',
                animation: isCharging ? 'battery-fill 1.5s ease-in-out infinite' : 'none'
              }}
            />

            {/* Percentage text overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="font-orbitron font-black text-2xl"
                style={{
                  color: percentage > 50 ? 'rgba(0,0,0,0.8)' : '#FFD700',
                  textShadow: percentage > 50 ? 'none' : '0 0 10px rgba(255,215,0,0.8)',
                  zIndex: 10
                }}
              >
                {percentage}%
              </span>
            </div>

            {/* Charging stripes animation */}
            {isCharging && (
              <div
                className="absolute inset-0"
                style={{
                  background: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.05) 8px, rgba(255,255,255,0.05) 16px)',
                  animation: 'spin-slow 3s linear infinite'
                }}
              />
            )}
          </div>
        </div>

        {/* Electric Arc SVG */}
        {isCharging && (
          <svg width="40" height="80" viewBox="0 0 40 80" className="animate-lightning">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <polyline
              points="20,5 8,35 18,35 5,75"
              fill="none"
              stroke="#FFD700"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              style={{ animation: 'electric-arc 0.6s ease-in-out infinite' }}
            />
            <polyline
              points="25,10 35,30 22,30 30,70"
              fill="none"
              stroke="#00BFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              style={{ animation: 'electric-arc 0.8s ease-in-out infinite', animationDelay: '0.2s' }}
            />
          </svg>
        )}
      </div>

      {/* Wattage Counter */}
      <div className="w-full text-center">
        {isCharging && (
          <div
            className="font-orbitron text-sm font-bold"
            style={{ color: '#00BFFF' }}
          >
            Charging: {formatWatts(chargingWatts)}W / {formatWatts(MAX_CHARGER_W)}W
          </div>
        )}

        {/* Status Message */}
        <div
          className={`font-orbitron font-black text-sm uppercase tracking-widest mt-1 ${isCharging ? 'animate-text-flash' : ''}`}
          style={{
            color: isFullyCharged ? '#FFD700' : isCharging ? '#FF8C00' : 'rgba(255,255,255,0.4)',
            textShadow: isFullyCharged ? '0 0 20px rgba(255,215,0,0.8)' : 'none'
          }}
        >
          {isFullyCharged
            ? '✅ FULLY CHARGED — Music Unlocked!'
            : isCharging
            ? '⚡ CHARGING... Music Locked'
            : '○ Standby'}
        </div>

        {/* Output Power */}
        <div className="font-rajdhani text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Output Power:{' '}
          <span style={{ color: '#FFD700', fontWeight: 700 }}>
            {formatWatts(outputPower)}W
          </span>
        </div>
      </div>
    </div>
  );
}
