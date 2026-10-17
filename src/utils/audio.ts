// Sound intentionally disabled: the simulator is visual-first and safe to use in shared spaces.
class SilentAudioEngine {
  setMuted(_muted: boolean) {}
  isMuted() { return true; }
  setSoundtrackPlaying(_playing: boolean) {}
  startSoundtrack() {}
  stopSoundtrack() {}
  playBeep(_freq?: number, _duration?: number, _type?: OscillatorType) {}
  playLungeAlarm() {}
  playHit() {}
  playDodge() {}
  playHiveSync() {}
  playThruster() {}
  playWaypointSet() {}
  playVictory() {}
}

export const sound = new SilentAudioEngine();
