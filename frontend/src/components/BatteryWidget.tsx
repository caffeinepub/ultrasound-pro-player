import React from 'react';
import { BatteryState } from '../hooks/useBatteryCharging';
import { Zap } from 'lucide-react';

interface Props {
  state: BatteryState;
  chargerWatts: number;
}

export default function BatteryWidget({ state, chargerWatts }: Props) {
  const { percentage, watts, outputPower, isUnlocked } = state;

  return (
    <div className="glass-panel rounded-xl p-4 border border-ultra-gold/20 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/assets/generated/lightning-bolt-icon.dim_128x128.png"
            alt="Lightning"
            className="w-6 h-6 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <span className="font-orbitron font-bold text-ultra-gold text-sm tracking-wider">POWER CELL</span>
        </div>
        <span className={`font-orbitron font-black text-lg ${isUnlocked ? 'text-green-400 glow-text-green' : 'text-ultra-gold glow-gold'}`}>
          {percentage}%
        </span>
      </div>

      {/* Battery outline */}
      <div className="relative">
        <div className="w-full h-8 rounded-lg border-2 border-ultra-gold/60 bg-black/40 overflow-hidden relative">
          {/* Fill */}
          <div
            className="absolute left-0 top-0 bottom-0 transition-all duration-300"
            style={{
              width: `${percentage}%`,
              background: isUnlocked
                ? 'linear-gradient(90deg, #00ff88, #00cc66)'
                : `linear-gradient(90deg, #FFD700, #FFA500)`,
              boxShadow: isUnlocked
                ? '0 0 12px rgba(0,255,136,0.6)'
                : '0 0 12px rgba(255,215,0,0.6)',
            }}
          />
          {/* Percentage text overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-orbitron font-bold text-xs text-white drop-shadow-lg">
              {isUnlocked ? '⚡ FULLY CHARGED' : `CHARGING... ${percentage}%`}
            </span>
          </div>
        </div>
        {/* Battery tip */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-2 h-4 bg-ultra-gold/60 rounded-r" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-black/30 rounded-lg p-2">
          <p className="text-ultra-gold font-orbitron font-bold text-xs">{(watts / 1000).toFixed(1)}kW</p>
          <p className="text-white/40 text-xs font-rajdhani">Stored</p>
        </div>
        <div className="bg-black/30 rounded-lg p-2">
          <p className="text-ultra-blue font-orbitron font-bold text-xs">{(chargerWatts / 1000).toFixed(0)}kW</p>
          <p className="text-white/40 text-xs font-rajdhani">Charger</p>
        </div>
        <div className="bg-black/30 rounded-lg p-2">
          <p className="text-green-400 font-orbitron font-bold text-xs">{(outputPower / 1000).toFixed(1)}kW</p>
          <p className="text-white/40 text-xs font-rajdhani">Output</p>
        </div>
      </div>

      {/* Lock message */}
      {!isUnlocked && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          <span className="text-red-400 text-sm">🔒</span>
          <span className="text-red-400 font-rajdhani font-semibold text-xs">Music Locked — Charging to 100%</span>
        </div>
      )}
      {isUnlocked && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
          <Zap className="w-4 h-4 text-green-400" />
          <span className="text-green-400 font-rajdhani font-semibold text-xs">🎵 Music Unlocked — Full Power!</span>
        </div>
      )}
    </div>
  );
}
