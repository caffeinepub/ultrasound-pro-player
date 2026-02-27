# Specification

## Summary
**Goal:** Migrate the entire UltraSound Pro application into a new clean project, carrying over every feature, component, hook, utility, style, and configuration without any omissions or changes.

**Planned changes:**
- Copy all frontend components: Header, FilePicker, Playlist, PlayerControls, BatteryWidget, SpectrumVisualizer, EQStabilizer, BluetoothSpeakerDisplay, ProcessorPage, SoundMagnet, SoundMagnetToggle, SoundEngineSelector, AudioEngineFallback, ErrorBoundary
- Copy all hooks: useAudioEngine, useAudioFiles, useAudioPlayer, useBatteryCharging, useCanvasAnimation, useSoundMagnet, useInternetIdentity, useActor, useQueries
- Copy all utility files: audioConstants.ts, instrumentMappings.ts, debounce.ts
- Preserve the full visual theme: deep dark blue gradient, gold/yellow accents, electric blue secondary, glassmorphism panels, neon glow effects, Orbitron/Rajdhani/Inter fonts
- Preserve the four-region layout: top header with sound engine selector, left panel (file picker/playlist), center panel (player/visualizer/battery), bottom EQ Stabilizer panel
- Preserve the 20-band EQ Stabilizer with 4×5 grid, all 20 instrument cards, SVG instrument icons, and instrument-to-band mappings
- Preserve the animated battery charging widget (80,000W / 200,000W charger, gold fill animation, music lock)
- Preserve the four sound engine presets, canvas spectrum visualizer, Bluetooth Speaker Display, and Sound Magnet feature
- Preserve the Processor page with HIGH TOP 9.0 badge, Class A+/B+/C+/D+ labels, 20 Smart Chips, and Auto-Fix Monitor
- Preserve tab navigation (Player / BT Speakers / Processor), drag-and-drop FilePicker, and full audio playback pipeline
- Preserve mobile-responsive layout, all Tailwind config, CSS custom properties, and global styles
- Copy the backend Motoko actor as-is

**User-visible outcome:** A new clean project that is functionally and visually identical to the current UltraSound Pro application in every respect.
