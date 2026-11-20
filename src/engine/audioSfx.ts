type SoundEffectKey = 'coin' | 'ok' | 'bad' | 'tap' | 'badge' | 'kick' | 'unlock';

class AudioSfxManager {
  private ctx: AudioContext | null = null;
  private isMuted = false;

  public init(): void {
    if (!this.ctx && typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      } catch {
        // Ignore audio context restriction
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(m: boolean): void {
    this.isMuted = m;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public tone(
    frequencies: number[],
    dur: number,
    type: OscillatorType,
    vol: number,
    gap?: number
  ): void {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t0 = this.ctx.currentTime;
    frequencies.forEach((f, i) => {
      if (!this.ctx) return;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const st = t0 + i * (gap || dur * 0.8);
      o.type = type;
      o.frequency.value = f;
      g.gain.setValueAtTime(0, st);
      g.gain.linearRampToValueAtTime(vol, st + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0008, st + dur);
      o.connect(g);
      g.connect(this.ctx.destination);
      o.start(st);
      o.stop(st + dur + 0.02);
    });
  }

  public play(key: SoundEffectKey): void {
    switch (key) {
      case 'coin':
        this.tone([988, 1319], 0.1, 'square', 0.04, 0.07);
        break;
      case 'ok':
        this.tone([523, 659, 784, 1047], 0.16, 'triangle', 0.11, 0.1);
        break;
      case 'bad':
        this.tone([240, 180], 0.22, 'sawtooth', 0.04, 0.15);
        break;
      case 'tap':
        this.tone([700], 0.06, 'sine', 0.04);
        break;
      case 'badge':
        this.tone([784, 988, 1175, 1568], 0.2, 'triangle', 0.11, 0.12);
        break;
      case 'kick':
        this.tone([140, 90], 0.12, 'square', 0.07, 0.06);
        break;
      case 'unlock':
        this.tone([440, 554, 659, 880, 1108], 0.18, 'triangle', 0.1, 0.09);
        break;
    }
  }
}

export const audioSfx = new AudioSfxManager();
