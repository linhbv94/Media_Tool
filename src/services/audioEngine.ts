/**
 * Web Audio Engine for volume control & Adaptive Audio Fade for A-B Loop
 */
export class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private currentMediaElement: HTMLMediaElement | null = null;
  private isFading: boolean = false;

  public init(mediaElement: HTMLMediaElement) {
    this.currentMediaElement = mediaElement;
    // Always sync native volume directly to avoid Web Audio CORS silencing
    if (this.currentMediaElement) {
      this.currentMediaElement.volume = 1.0;
    }
  }

  public setVolume(volume: number, isMuted: boolean = false) {
    const target = isMuted ? 0.0 : Math.max(0.0, Math.min(1.0, volume));
    if (this.currentMediaElement) {
      this.currentMediaElement.volume = target;
      this.currentMediaElement.muted = isMuted;
    }
    if (this.gainNode && this.audioCtx && !this.isFading) {
      this.gainNode.gain.cancelScheduledValues(this.audioCtx.currentTime);
      this.gainNode.gain.setValueAtTime(target, this.audioCtx.currentTime);
    }
  }

  /**
   * Calculate fade duration based on A-B loop duration
   * loopDuration in seconds
   * Returns milliseconds (0 to 100)
   */
  public calculateFadeDurationMs(pointA: number, pointB: number): number {
    const loopDuration = Math.max(0, pointB - pointA);
    if (loopDuration < 0.5) {
      return 0; // Segment too short, do not fade to avoid mute
    }
    // loopDuration in seconds * 0.02 => seconds * 1000 => ms
    return Math.min(loopDuration * 20, 100);
  }

  /**
   * Execute smooth adaptive fade out and fade in across A-B Loop boundary
   */
  public performLoopTransition(
    media: HTMLMediaElement,
    pointA: number,
    targetVolume: number,
    fadeDurationMs: number
  ) {
    if (!this.gainNode || !this.audioCtx || fadeDurationMs <= 0) {
      media.currentTime = pointA;
      return;
    }

    const fadeSec = fadeDurationMs / 1000;
    const now = this.audioCtx.currentTime;
    this.isFading = true;

    try {
      // 1. Ramp down to 0
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
      this.gainNode.gain.linearRampToValueAtTime(0.0001, now + fadeSec);

      setTimeout(() => {
        // 2. Jump to point A
        if (typeof (media as HTMLVideoElement).fastSeek === 'function') {
          (media as HTMLVideoElement).fastSeek(pointA);
        } else {
          media.currentTime = pointA;
        }

        // 3. Ramp back up to target volume
        if (this.gainNode && this.audioCtx) {
          const resumeTime = this.audioCtx.currentTime;
          this.gainNode.gain.cancelScheduledValues(resumeTime);
          this.gainNode.gain.setValueAtTime(0.0001, resumeTime);
          this.gainNode.gain.linearRampToValueAtTime(targetVolume, resumeTime + fadeSec);
        }

        setTimeout(() => {
          this.isFading = false;
        }, fadeDurationMs + 10);
      }, fadeDurationMs);
    } catch (e) {
      this.isFading = false;
      media.currentTime = pointA;
    }
  }

  public dispose() {
    try {
      if (this.gainNode) this.gainNode.disconnect();
      if (this.sourceNode) this.sourceNode.disconnect();
      if (this.audioCtx && this.audioCtx.state !== 'closed') {
        this.audioCtx.close();
      }
    } catch (e) {
      // ignore
    }
    this.audioCtx = null;
    this.gainNode = null;
    this.sourceNode = null;
    this.currentMediaElement = null;
  }
}

export const audioEngine = new AudioEngine();
