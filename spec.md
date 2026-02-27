# Specification

## Summary
**Goal:** Add three new features to UltraSound Pro: a Bluetooth Speaker Output display panel, a Number 1 Processor page, and a Sound Magnet visualization feature.

**Planned changes:**
- Add a "BLUETOOTH SPEAKER OUTPUT" panel with 2–3 animated Bluetooth speaker illustrations whose cones pulse in sync with live audio amplitude from the Web Audio API AnalyserNode; display real-time output wattage and dB level; use dark glassmorphism card style with gold/blue glow accents
- Add a "NUMBER 1 PROCESSOR IN THE WHOLE WORLD" page/panel with: Class A+ / B / C+ / D header labeled "More Super Clean Sound Control — Not Your Standard Regular Classes"; 20 Smart Chip cards each showing status indicators for Boost, Effect, Lagging, Clipping, Stuttering, and Zero Background Noise; 80Hz Deep Low Manager controlled by Smart Chip Stabilizer with range 80,000–90,000; Intelligent Amp status display; Full Stabilizer Power / Super Amp Control / Super Modes section; Automatic Frequency Control with live animated indicator driven by the AnalyserNode; Special DAW VST Generator with Big Grant FPGA, CPU Booster, Signal Stimulation; spec readout (12 Volt, 20 Core, 30 Thunders Wide); battery charge level from the existing useBatteryCharging hook; all in dark glassmorphism style with gold/blue glow
- Add a "Sound Magnet — Stimulation Virtual Music Magnifier" panel with an ON/OFF toggle labeled "SOUND MAGNET"; when ON, render a large animated radial field (concentric glowing rings / expanding gold/yellow gradient) that grows proportionally to the current audio amplitude from the AnalyserNode, visually much larger than the speaker illustration; when OFF, hide the animation

**User-visible outcome:** Users can view animated Bluetooth speaker output stats, explore a detailed processor spec page with live frequency and battery data, and toggle the Sound Magnet visualization that expands with volume to simulate room-filling sound.
