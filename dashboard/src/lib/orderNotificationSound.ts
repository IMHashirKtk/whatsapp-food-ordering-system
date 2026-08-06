import { ORDER_SOUND_MUTED_KEY } from "./constants";

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined" || !window.AudioContext) {
    return null;
  }

  return new window.AudioContext();
};

let audioContext: AudioContext | null = null;

const getOrCreateAudioContext = () => {
  if (!audioContext) {
    audioContext = getAudioContext();
  }

  return audioContext;
};

export function readOrderSoundMuted(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(ORDER_SOUND_MUTED_KEY) === "true";
  } catch {
    return false;
  }
}

export function persistOrderSoundMuted(isMuted: boolean): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      ORDER_SOUND_MUTED_KEY,
      String(isMuted),
    );
  } catch {
    return;
  }
}

export async function unlockOrderNotificationSound(): Promise<void> {
  const context = getOrCreateAudioContext();

  if (!context || context.state !== "suspended") {
    return;
  }

  try {
    await context.resume();
  } catch {
    return;
  }
}

export async function playOrderNotificationSound(): Promise<void> {
  const context = getOrCreateAudioContext();

  if (!context) {
    return;
  }

  try {
    await unlockOrderNotificationSound();

    if (context.state === "suspended") {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startTime = context.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, startTime);
    gain.gain.setValueAtTime(0.12, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.14);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.14);
  } catch {
    return;
  }
}
