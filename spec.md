# Specification

## Summary
**Goal:** Fix the audio playback pipeline so that files selected via the file picker actually play in the UltraSound Pro app.

**Planned changes:**
- Ensure object URLs created from selected File objects are correctly assigned to the HTMLAudioElement `src` before playback begins
- Resume the AudioContext from `suspended` state before calling `play()` to satisfy browser autoplay policy
- Fix the integration between `useAudioFiles.ts`, `useAudioPlayer.ts`, and `useAudioEngine.ts` in `App.tsx` so the full data flow works end-to-end (file selection → URL creation → src assignment → source node connection → play)
- Ensure the MediaElementSourceNode is correctly connected to the 20-band EQ filter chain → GainNode → AnalyserNode → destination before playback
- Prevent duplicate MediaElementSourceNode creation errors when switching tracks
- Await the `play()` promise and catch any rejections, displaying a visible error message to the user
- Ensure subsequent track selections (Next, Previous, playlist click) also play correctly

**User-visible outcome:** After selecting audio files via the file picker, clicking a track in the playlist produces audible sound and the spectrum visualizer animates. Play/Pause/Stop controls respond correctly once a track is loaded and the battery is at 100%.
