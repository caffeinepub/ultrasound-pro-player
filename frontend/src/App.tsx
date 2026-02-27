import { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { FilePicker } from './components/FilePicker';
import { Playlist } from './components/Playlist';
import { PlayerControls } from './components/PlayerControls';
import { SpectrumVisualizer } from './components/SpectrumVisualizer';
import { BatteryWidget } from './components/BatteryWidget';
import { EQStabilizer } from './components/EQStabilizer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AudioEngineFallback } from './components/AudioEngineFallback';
import { useAudioEngine } from './hooks/useAudioEngine';
import { useAudioFiles, AudioFile } from './hooks/useAudioFiles';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useBatteryCharging } from './hooks/useBatteryCharging';
import { SoundEngine, EQ_GAIN_DEFAULT, SOUND_ENGINE_PRESETS } from './utils/audioConstants';
import { INSTRUMENTS, BAND_INDEX_TO_INSTRUMENT_INDEX } from './utils/instrumentMappings';

const INITIAL_EQ_GAINS = new Array(20).fill(EQ_GAIN_DEFAULT);
const INITIAL_INSTRUMENT_GAINS = new Array(20).fill(0);

export default function App() {
  const audioEngine = useAudioEngine();
  const { files, addFiles, removeFile, error: fileError } = useAudioFiles();
  const { state: batteryState } = useBatteryCharging();
  const player = useAudioPlayer(files, audioEngine, batteryState.isUnlocked);

  const [activeEngine, setActiveEngine] = useState<SoundEngine>('Crystal Engine');
  const [eqGains, setEqGains] = useState<number[]>(INITIAL_EQ_GAINS);
  const [instrumentGains, setInstrumentGains] = useState<number[]>(INITIAL_INSTRUMENT_GAINS);
  const [highlightedBands, setHighlightedBands] = useState<Set<number>>(new Set());
  const [highlightedInstruments, setHighlightedInstruments] = useState<Set<number>>(new Set());

  const handleEngineSelect = useCallback(
    (engine: SoundEngine) => {
      setActiveEngine(engine);
      audioEngine.setSoundEngine(engine);
      const preset = SOUND_ENGINE_PRESETS[engine];
      setEqGains([...preset]);
      // Sync instrument gains to match the preset (1-to-1)
      const newInstGains = new Array(20).fill(0);
      INSTRUMENTS.forEach((inst, instIdx) => {
        const bandIdx = inst.bandIndices[0];
        newInstGains[instIdx] = preset[bandIdx] ?? 0;
      });
      setInstrumentGains(newInstGains);
    },
    [audioEngine]
  );

  // When an EQ band slider moves → update that band's gain AND sync the linked instrument's gain
  const handleEqGainChange = useCallback((bandIndex: number, gain: number) => {
    setEqGains((prev) => {
      const next = [...prev];
      next[bandIndex] = gain;
      return next;
    });

    const instIdx = BAND_INDEX_TO_INSTRUMENT_INDEX[bandIndex];
    if (instIdx >= 0) {
      setInstrumentGains((prev) => {
        const next = [...prev];
        next[instIdx] = gain;
        return next;
      });
      setHighlightedInstruments(new Set([instIdx]));
      setTimeout(() => setHighlightedInstruments(new Set()), 1500);
    }
  }, []);

  // When an instrument slider moves → update that instrument's gain AND sync the linked EQ band
  const handleInstrumentChange = useCallback((instrumentIndex: number, gain: number) => {
    setInstrumentGains((prev) => {
      const next = [...prev];
      next[instrumentIndex] = gain;
      return next;
    });

    const instrument = INSTRUMENTS[instrumentIndex];
    const bandIdx = instrument.bandIndices[0];
    setEqGains((prev) => {
      const next = [...prev];
      next[bandIdx] = gain;
      return next;
    });

    setHighlightedBands(new Set([bandIdx]));
    setTimeout(() => setHighlightedBands(new Set()), 1500);
  }, []);

  // Clicking a playlist item loads the track and auto-plays if battery is unlocked
  const handleTrackSelect = useCallback(
    (file: AudioFile, index: number) => {
      // If same track is already loaded, just toggle play/pause
      if (player.state.currentIndex === index && player.state.currentTrack) {
        if (player.state.playbackState === 'playing') {
          player.pause();
        } else {
          player.play();
        }
        return;
      }
      // Load new track — auto-play if unlocked
      player.loadTrack(file, index, batteryState.isUnlocked);
    },
    [player, batteryState.isUnlocked]
  );

  if (!audioEngine.state.isAvailable) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <AudioEngineFallback />
      </div>
    );
  }

  const isPlaying = player.state.playbackState === 'playing';

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          'linear-gradient(135deg, #060918 0%, #0a0e2a 40%, #0d1440 70%, #060918 100%)',
      }}
    >
      {/* Header */}
      <ErrorBoundary sectionName="Header">
        <Header activeEngine={activeEngine} onEngineSelect={handleEngineSelect} />
      </ErrorBoundary>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0">
        {/* Left Panel: File Picker + Playlist */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col gap-4">
          <div className="glass-panel p-4 flex flex-col gap-4" style={{ minHeight: '200px' }}>
            <ErrorBoundary sectionName="File Picker">
              <FilePicker onFilesAdded={addFiles} error={fileError} />
            </ErrorBoundary>
          </div>
          <div className="glass-panel p-4 flex-1">
            <ErrorBoundary sectionName="Playlist">
              <Playlist
                files={files}
                currentIndex={player.state.currentIndex}
                playbackState={player.state.playbackState}
                onSelect={handleTrackSelect}
                onRemove={removeFile}
              />
            </ErrorBoundary>
          </div>
        </aside>

        {/* Center Panel: Player + Visualizer + Battery */}
        <section className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Player Controls */}
          <div className="glass-panel p-5">
            <ErrorBoundary sectionName="Player Controls">
              <PlayerControls
                playerState={player.state}
                isUnlocked={batteryState.isUnlocked}
                playlist={files}
                onPlay={player.play}
                onPause={player.pause}
                onStop={player.stop}
                onNext={player.next}
                onPrevious={player.previous}
                onSeek={player.seek}
                onClearError={player.clearError}
              />
            </ErrorBoundary>
          </div>

          {/* Spectrum Visualizer */}
          <ErrorBoundary sectionName="Spectrum Visualizer">
            <SpectrumVisualizer audioEngine={audioEngine} isPlaying={isPlaying} />
          </ErrorBoundary>

          {/* Battery Widget */}
          <ErrorBoundary sectionName="Battery System">
            <BatteryWidget batteryState={batteryState} />
          </ErrorBoundary>
        </section>
      </main>

      {/* Bottom Panel: Unified EQ Stabilizer */}
      <section className="p-4">
        <ErrorBoundary sectionName="EQ Stabilizer">
          <EQStabilizer
            audioEngine={audioEngine}
            eqGains={eqGains}
            instrumentGains={instrumentGains}
            onEqGainChange={handleEqGainChange}
            onInstrumentChange={handleInstrumentChange}
            highlightedBands={highlightedBands}
            highlightedInstruments={highlightedInstruments}
          />
        </ErrorBoundary>
      </section>

      {/* Footer */}
      <footer
        className="w-full py-3 px-6 flex items-center justify-center gap-2 text-xs"
        style={{
          background: 'rgba(6,9,24,0.8)',
          borderTop: '1px solid rgba(255,215,0,0.1)',
          color: 'rgba(255,255,255,0.3)',
        }}
      >
        <span>© {new Date().getFullYear()} ULTRASOUND PRO</span>
        <span style={{ color: 'rgba(255,215,0,0.3)' }}>·</span>
        <span className="flex items-center gap-1">
          Built with <span style={{ color: '#FFD700' }}>♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== 'undefined' ? window.location.hostname : 'ultrasound-pro'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold transition-colors"
            style={{ color: '#FFD700' }}
          >
            caffeine.ai
          </a>
        </span>
      </footer>
    </div>
  );
}
