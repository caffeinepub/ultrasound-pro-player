# Specification

## Summary
**Goal:** Build ULTRASOUND PRO, an ultra-premium client-side music player web app with a deep dark blue/gold visual theme, Web Audio API processing, a 20-band EQ, 20 instrument controls, an animated battery charging system, and a real-time spectrum visualizer.

**Planned changes:**
- Implement global visual theme: dark blue gradient background (#060918 → #0d1440), gold (#FFD700) primary accent, electric blue (#00BFFF) secondary accent, glassmorphism panels, neon glow effects, bold premium typography, and a glowing "ULTRASOUND PRO" title bar
- Build four-region layout: full-width header (title + sound engine selector), left sidebar (file picker + playlist), center panel (player controls + spectrum visualizer + battery widget), bottom section (20-band EQ + 20 instrument sliders)
- Implement file picker with drag-and-drop support, accepting MP3/WAV/FLAC/OGG/AAC, with a glowing drop zone, and a playlist showing track name, duration, and format badge; clicking a track loads it into the player
- Build player controls (Play, Pause, Stop, Next, Previous, seek bar) with song title/artist display and album art placeholder; all controls visually locked and disabled until battery reaches 100%
- Implement animated battery charging widget: large stylized battery showing 80,000W capacity, 200,000W charger with lightning bolt and electric arc CSS/SVG animations, glowing yellow fill rising from 0–100%, real-time wattage counter, "CHARGING… Music Locked" status, and a dramatic unlock animation + "FULLY CHARGED — Music Unlocked!" message at 100%
- Add 4-option sound engine selector in the header (Crystal Engine, Deep Bass Engine, Surround Engine, Pure HD Engine), each applying a distinct Web Audio API filter chain preset, updating in real time without restarting playback
- Implement 20-band EQ with vertical ±12dB sliders at 20 defined frequencies using BiquadFilterNodes in series; adjusting an EQ band highlights linked instrument sliders
- Render 20 instrument sliders (Bass Guitar, Kick Drum, Snare, Hi-Hat, Piano, Violin, Cello, Trumpet, Saxophone, Flute, Acoustic Guitar, Electric Guitar, Synthesizer, Organ, Choir/Vocals, Strings, Percussion, Sub Bass, Cymbals, Harmonica); each maps to specific EQ bands and moving an instrument slider updates linked EQ sliders visually and in audio
- Build canvas-based real-time frequency spectrum visualizer driven by AnalyserNode and requestAnimationFrame, drawing gold bars/waveform, always active during playback
- Wire the full Web Audio API signal chain: source → 20 BiquadFilterNodes → GainNode → AnalyserNode → destination; debounce EQ/instrument changes (5–10ms); create AudioContext on first user interaction; show graceful fallback if Web Audio API is unavailable
- Wrap every major section (file picker, player, battery, EQ, instrument panel, visualizer) in React error boundaries with styled fallback UI and a Retry button

**User-visible outcome:** Users can load local audio files, watch the battery charge animation unlock the player, select a sound engine, adjust 20 EQ bands and 20 instrument sliders with real-time audio processing, and see a live spectrum visualizer — all within a premium dark blue and gold glassmorphism interface.
