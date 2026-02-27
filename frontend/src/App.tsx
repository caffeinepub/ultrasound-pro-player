import React, { useState, useCallback, useMemo } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import Header from './components/Header';
import FilePicker from './components/FilePicker';
import Playlist from './components/Playlist';
import PlayerControls from './components/PlayerControls';
import SpectrumVisualizer from './components/SpectrumVisualizer';
import BatteryWidget from './components/BatteryWidget';
import EQStabilizer from './components/EQStabilizer';
import BluetoothSpeakerDisplay from './components/BluetoothSpeakerDisplay';
import ProcessorPage from './components/ProcessorPage';
import SoundMagnet from './components/SoundMagnet';
import SoundMagnetToggle from './components/SoundMagnetToggle';
import AudioEngineFallback from './components/AudioEngineFallback';
import { useAudioEngine } from './hooks/useAudioEngine';
import { useAudioFiles } from './hooks/useAudioFiles';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useBatteryCharging } from './hooks/useBatteryCharging';
import { useSoundMagnet } from './hooks/useSoundMagnet';
import { SOUND_ENGINE_PRESETS } from './utils/audioConstants';
import { AudioFile } from './hooks/useAudioFiles';

type TabId = 'player' | 'bt-speakers' | 'processor';

const TABS: { id: TabId; label: string }[] = [
  { id: 'player', label: '🎵 Player' },
  { id: 'bt-speakers', label: '🔊 BT Speakers' },
  { id: 'processor', label: '⚙️ Processor' },
];

const isWebAudioSupported = typeof window !== 'undefined' && !!(window.AudioContext || (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext);

export default function App() {
  if (!isWebAudioSupported) {
    return <AudioEngineFallback />;
  }

  return <AppInner />;
}

function AppInner() {
  const [activeTab, setActiveTab] = useState<TabId>('player');
  const [currentEngine, setCurrentEngine] = useState('Crystal Engine');
  const [eqGains, setEqGains] = useState<number[]>(new Array(20).fill(0));
  const [instrumentGains, setInstrumentGains] = useState<number[]>(new Array(20).fill(100));

  const { audioEngine } = useAudioEngine();
  const { files, addFile, addStream, removeFile } = useAudioFiles();
  const { state: playerState, play, pause, resume, seek, setVolume } = useAudioPlayer(audioEngine);
  const { state: batteryState, CHARGER_WATTS } = useBatteryCharging();
  const { isOn: soundMagnetOn, toggle: toggleSoundMagnet } = useSoundMagnet();

  const handleEngineSelect = useCallback((engine: string) => {
    setCurrentEngine(engine);
    const preset = SOUND_ENGINE_PRESETS[engine];
    if (preset) {
      setEqGains([...preset]);
      preset.forEach((gain, i) => audioEngine.setEQBand(i, gain));
    }
  }, [audioEngine]);

  const handleAddFiles = useCallback(async (fileList: File[]) => {
    for (const file of fileList) {
      await addFile(file);
    }
  }, [addFile]);

  const handleTrackSelect = useCallback((track: AudioFile) => {
    play(track);
  }, [play]);

  const handleNext = useCallback(() => {
    const idx = files.findIndex((f) => f.id === playerState.currentTrack?.id);
    if (idx < files.length - 1) play(files[idx + 1]);
  }, [files, playerState.currentTrack, play]);

  const handlePrevious = useCallback(() => {
    const idx = files.findIndex((f) => f.id === playerState.currentTrack?.id);
    if (idx > 0) play(files[idx - 1]);
  }, [files, playerState.currentTrack, play]);

  const handleEQChange = useCallback((index: number, gain: number) => {
    setEqGains((prev) => {
      const next = [...prev];
      next[index] = gain;
      return next;
    });
  }, []);

  const handleInstrumentGainChange = useCallback((index: number, gain: number) => {
    setInstrumentGains((prev) => {
      const next = [...prev];
      next[index] = gain;
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-ultra-dark flex flex-col" style={{
      background: 'linear-gradient(135deg, #060918 0%, #0d1440 50%, #060918 100%)',
    }}>
      {/* Header */}
      <ErrorBoundary section="Header">
        <Header currentEngine={currentEngine} onEngineSelect={handleEngineSelect} />
      </ErrorBoundary>

      {/* Tab Navigation */}
      <div className="flex border-b border-white/10 bg-black/20 px-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-3 font-rajdhani font-semibold text-sm transition-all duration-200 border-b-2 min-h-[44px]
              ${activeTab === tab.id
                ? 'border-ultra-gold text-ultra-gold'
                : 'border-transparent text-white/50 hover:text-white/80 hover:border-white/20'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-3 sm:p-4">
        {activeTab === 'player' && (
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
            {/* Left Panel */}
            <div className="space-y-4">
              <ErrorBoundary section="File Picker">
                <div className="glass-panel rounded-xl p-4 border border-white/10">
                  <h3 className="font-orbitron font-bold text-white/80 text-sm tracking-wider mb-3">ADD AUDIO</h3>
                  <FilePicker onAdd={handleAddFiles} onStreamAdded={addStream} />
                </div>
              </ErrorBoundary>

              <ErrorBoundary section="Playlist">
                <div className="glass-panel rounded-xl p-4 border border-white/10">
                  <h3 className="font-orbitron font-bold text-white/80 text-sm tracking-wider mb-3">
                    PLAYLIST ({files.length})
                  </h3>
                  <Playlist
                    tracks={files}
                    currentTrack={playerState.currentTrack}
                    isPlaying={playerState.isPlaying}
                    onSelect={handleTrackSelect}
                    onRemove={removeFile}
                  />
                </div>
              </ErrorBoundary>
            </div>

            {/* Center Panel */}
            <div className="space-y-4">
              <ErrorBoundary section="Player Controls">
                <PlayerControls
                  playerState={playerState}
                  onPlay={play}
                  onPause={pause}
                  onResume={resume}
                  onSeek={seek}
                  onVolumeChange={setVolume}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                />
              </ErrorBoundary>

              <ErrorBoundary section="Spectrum Visualizer">
                <SpectrumVisualizer audioEngine={audioEngine} isPlaying={playerState.isPlaying} />
              </ErrorBoundary>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ErrorBoundary section="Battery Widget">
                  <BatteryWidget state={batteryState} chargerWatts={CHARGER_WATTS} />
                </ErrorBoundary>

                <ErrorBoundary section="Sound Magnet">
                  <div className="space-y-2">
                    <SoundMagnetToggle isOn={soundMagnetOn} onToggle={toggleSoundMagnet} />
                    <SoundMagnet audioEngine={audioEngine} isOn={soundMagnetOn} isPlaying={playerState.isPlaying} />
                  </div>
                </ErrorBoundary>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bt-speakers' && (
          <div className="max-w-screen-lg mx-auto">
            <ErrorBoundary section="Bluetooth Speakers">
              <BluetoothSpeakerDisplay audioEngine={audioEngine} isPlaying={playerState.isPlaying} />
            </ErrorBoundary>
          </div>
        )}

        {activeTab === 'processor' && (
          <div className="max-w-screen-lg mx-auto">
            <ErrorBoundary section="Processor">
              <ProcessorPage audioEngine={audioEngine} isPlaying={playerState.isPlaying} />
            </ErrorBoundary>
          </div>
        )}
      </main>

      {/* EQ Stabilizer — always visible at bottom */}
      <div className="border-t border-white/10 p-3 sm:p-4">
        <ErrorBoundary section="EQ Stabilizer">
          <EQStabilizer
            eqGains={eqGains}
            instrumentGains={instrumentGains}
            audioEngine={audioEngine}
            onEQChange={handleEQChange}
            onInstrumentGainChange={handleInstrumentGainChange}
          />
        </ErrorBoundary>
      </div>

      {/* Footer */}
      <footer className="text-center py-3 border-t border-white/5 bg-black/20">
        <p className="text-white/20 font-rajdhani text-xs">
          Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'ultrasound-pro')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ultra-gold/40 hover:text-ultra-gold/70 transition-colors"
          >
            caffeine.ai
          </a>
          {' '}· © {new Date().getFullYear()} UltraSound Pro
        </p>
      </footer>
    </div>
  );
}
