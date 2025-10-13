// Global audio manager to ensure only one audio plays at a time
class AudioManager {
  private currentAudio: HTMLAudioElement | null = null;
  private stopCallback: (() => void) | null = null;

  setCurrentAudio(audio: HTMLAudioElement, stopCallback: () => void) {
    // Stop previous audio if exists
    if (this.currentAudio && this.currentAudio !== audio) {
      this.currentAudio.pause();
      if (this.stopCallback) {
        this.stopCallback();
      }
    }

    this.currentAudio = audio;
    this.stopCallback = stopCallback;
  }

  clearCurrentAudio(audio: HTMLAudioElement) {
    if (this.currentAudio === audio) {
      this.currentAudio = null;
      this.stopCallback = null;
    }
  }
}

export const audioManager = new AudioManager();
