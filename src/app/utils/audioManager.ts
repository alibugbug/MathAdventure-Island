const audioBasePath = `${import.meta.env.BASE_URL}audio`;

export interface SoundConfig {
  path: string;
  volume: number;
  loop?: boolean;
}

export const soundEffects: Record<string, SoundConfig> = {
  // UI音效
  click: { path: `${audioBasePath}/ui_click.wav`, volume: 0.5 },
  hover: { path: `${audioBasePath}/ui_hover.wav`, volume: 0.3 },
  error: { path: `${audioBasePath}/ui_error.wav`, volume: 0.5 },
  select: { path: `${audioBasePath}/ui_click.wav`, volume: 0.35 },
  
  // 战斗音效
  attack: { path: `${audioBasePath}/attack.wav`, volume: 0.7 },
  hit: { path: `${audioBasePath}/hit.wav`, volume: 0.6 },
  damage: { path: `${audioBasePath}/damage.wav`, volume: 0.5 },
  victory: { path: `${audioBasePath}/victory.wav`, volume: 0.8 },
  defeat: { path: `${audioBasePath}/defeat.wav`, volume: 0.7 },
  
  // 解谜音效
  place_block: { path: `${audioBasePath}/place_block.wav`, volume: 0.4 },
  remove_block: { path: `${audioBasePath}/remove_block.wav`, volume: 0.4 },
  puzzle_complete: { path: `${audioBasePath}/level_up.wav`, volume: 0.32 },
  
  // 成就音效
  achievement_unlock: { path: `${audioBasePath}/level_up.wav`, volume: 0.8 },
  level_up: { path: `${audioBasePath}/level_up.wav`, volume: 0.7 },
  
  // 怪物音效
  monster_spawn: { path: `${audioBasePath}/monster_spawn.wav`, volume: 0.6 },
  monster_death: { path: `${audioBasePath}/monster_death.wav`, volume: 0.7 },
};

export const backgroundMusic: Record<string, SoundConfig> = {
  main_menu: { path: `${audioBasePath}/bg_main.wav`, volume: 0.3, loop: true },
  battle: { path: `${audioBasePath}/bg_battle.wav`, volume: 0.25, loop: true },
  puzzle: { path: `${audioBasePath}/bg_battle.wav`, volume: 0.18, loop: true },
  level: { path: `${audioBasePath}/bg_battle.wav`, volume: 0.18, loop: true },
};

let audioContext: AudioContext | null = null;
let currentBackgroundMusic: HTMLAudioElement | null = null;
let currentBackgroundTrack: BackgroundTrack | null = null;
let currentGeneratedTrack: BackgroundTrack | null = null;
let musicTimer: number | null = null;
let musicStep = 0;
let musicMaster: GainNode | null = null;

export type BaseBackgroundTrack =
  | 'home'
  | 'map'
  | 'count'
  | 'numberLine'
  | 'tenFrame'
  | 'add'
  | 'makeTen'
  | 'subtract'
  | 'compare'
  | 'word'
  | 'shape'
  | 'clock'
  | 'money'
  | 'review'
  | 'battle'
  | 'puzzle'
  | 'level'
  | 'main_menu';

export type BackgroundTrack = BaseBackgroundTrack | `lesson-${number}`;

interface GeneratedMusicConfig {
  bpm: number;
  volume: number;
  wave: OscillatorType;
  melody: number[];
  bass: number[];
  accentEvery?: number;
}

const noteFrequency: Record<string, number> = {
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G5: 783.99,
};

const melody = (notes: string[]) => notes.map(note => noteFrequency[note] || 0);

const generatedMusic: Record<BaseBackgroundTrack, GeneratedMusicConfig> = {
  home: {
    bpm: 92,
    volume: 0.035,
    wave: 'triangle',
    melody: melody(['C4', 'E4', 'G4', 'E4', 'A4', 'G4', 'E4', 'D4', 'C4', 'E4', 'G4', 'C5', 'B4', 'G4', 'E4', 'D4']),
    bass: melody(['C3', 'C3', 'G3', 'G3', 'A3', 'A3', 'F3', 'G3']),
  },
  map: {
    bpm: 86,
    volume: 0.032,
    wave: 'triangle',
    melody: melody(['G4', 'A4', 'B4', 'G4', 'E4', 'G4', 'D4', 'E4', 'G4', 'A4', 'C5', 'B4', 'G4', 'E4', 'D4', 'C4']),
    bass: melody(['G3', 'D3', 'E3', 'C3']),
  },
  count: {
    bpm: 88,
    volume: 0.03,
    wave: 'triangle',
    melody: melody(['C4', 'D4', 'E4', 'G4', 'E4', 'D4', 'C4', 'G4']),
    bass: melody(['C3', 'G3', 'C3', 'G3']),
  },
  numberLine: {
    bpm: 96,
    volume: 0.03,
    wave: 'triangle',
    melody: melody(['D4', 'E4', 'F4', 'G4', 'A4', 'G4', 'F4', 'E4']),
    bass: melody(['D3', 'A3', 'D3', 'A3']),
  },
  tenFrame: {
    bpm: 82,
    volume: 0.028,
    wave: 'sine',
    melody: melody(['E4', 'G4', 'B4', 'G4', 'E4', 'C4', 'D4', 'G4']),
    bass: melody(['C3', 'G3', 'E3', 'G3']),
  },
  add: {
    bpm: 112,
    volume: 0.032,
    wave: 'triangle',
    melody: melody(['C4', 'E4', 'G4', 'A4', 'G4', 'E4', 'G4', 'C5']),
    bass: melody(['C3', 'G3', 'A3', 'G3']),
  },
  makeTen: {
    bpm: 100,
    volume: 0.03,
    wave: 'triangle',
    melody: melody(['A4', 'G4', 'E4', 'C4', 'D4', 'E4', 'G4', 'A4']),
    bass: melody(['A3', 'E3', 'F3', 'G3']),
  },
  subtract: {
    bpm: 94,
    volume: 0.028,
    wave: 'triangle',
    melody: melody(['G4', 'E4', 'D4', 'C4', 'E4', 'D4', 'C4', 'G3']),
    bass: melody(['C3', 'F3', 'G3', 'C3']),
  },
  compare: {
    bpm: 102,
    volume: 0.03,
    wave: 'triangle',
    melody: melody(['E4', 'G4', 'E4', 'A4', 'G4', 'D4', 'E4', 'C4']),
    bass: melody(['E3', 'B3', 'C3', 'G3']),
  },
  word: {
    bpm: 90,
    volume: 0.028,
    wave: 'triangle',
    melody: melody(['F4', 'A4', 'G4', 'E4', 'F4', 'D4', 'C4', 'F4']),
    bass: melody(['F3', 'C3', 'D3', 'C3']),
  },
  shape: {
    bpm: 86,
    volume: 0.026,
    wave: 'sine',
    melody: melody(['C4', 'F4', 'A4', 'F4', 'C5', 'A4', 'F4', 'E4']),
    bass: melody(['F3', 'C3', 'F3', 'G3']),
  },
  clock: {
    bpm: 76,
    volume: 0.024,
    wave: 'sine',
    melody: melody(['C5', 'G4', 'E4', 'G4', 'C5', 'G4', 'D4', 'G4']),
    bass: melody(['C3', 'G3', 'C3', 'G3']),
  },
  money: {
    bpm: 96,
    volume: 0.03,
    wave: 'triangle',
    melody: melody(['G4', 'B4', 'D5', 'B4', 'A4', 'G4', 'E4', 'D4']),
    bass: melody(['G3', 'D3', 'E3', 'D3']),
  },
  review: {
    bpm: 104,
    volume: 0.032,
    wave: 'triangle',
    melody: melody(['C4', 'E4', 'G4', 'C5', 'B4', 'G4', 'A4', 'E4', 'F4', 'A4', 'C5', 'A4', 'G4', 'E4', 'D4', 'C4']),
    bass: melody(['C3', 'G3', 'A3', 'F3']),
  },
  battle: {
    bpm: 124,
    volume: 0.032,
    wave: 'triangle',
    melody: melody(['C4', 'G4', 'C5', 'G4', 'D4', 'A4', 'D5', 'A4']),
    bass: melody(['C3', 'C3', 'D3', 'D3']),
  },
  puzzle: {
    bpm: 84,
    volume: 0.026,
    wave: 'triangle',
    melody: melody(['E4', 'G4', 'B4', 'G4', 'D4', 'F4', 'A4', 'F4']),
    bass: melody(['E3', 'B3', 'D3', 'A3']),
  },
  level: {
    bpm: 96,
    volume: 0.028,
    wave: 'triangle',
    melody: melody(['C4', 'E4', 'G4', 'E4', 'D4', 'F4', 'A4', 'F4']),
    bass: melody(['C3', 'G3', 'D3', 'A3']),
  },
  main_menu: {
    bpm: 92,
    volume: 0.035,
    wave: 'triangle',
    melody: melody(['C4', 'E4', 'G4', 'E4', 'A4', 'G4', 'E4', 'D4', 'C4', 'E4', 'G4', 'C5', 'B4', 'G4', 'E4', 'D4']),
    bass: melody(['C3', 'C3', 'G3', 'G3', 'A3', 'A3', 'F3', 'G3']),
  },
};

const fileBackedMusic: Partial<Record<BaseBackgroundTrack, SoundConfig>> = {
  home: { path: `${audioBasePath}/bgm/TownTheme.mp3`, volume: 0.42, loop: true },
  map: { path: `${audioBasePath}/bgm/song18.mp3`, volume: 0.38, loop: true },
  main_menu: { path: `${audioBasePath}/bgm/TownTheme.mp3`, volume: 0.42, loop: true },
};

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

const playEnvelopeTone = (
  frequencies: number[],
  duration = 0.16,
  wave: OscillatorType = 'sine',
  volume = 0.05,
) => {
  try {
    const context = getAudioContext();
    context.resume().catch(() => {});
    const now = context.currentTime;
    const output = context.createGain();
    const filter = context.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, now);
    output.gain.setValueAtTime(0.0001, now);
    output.gain.exponentialRampToValueAtTime(volume, now + 0.012);
    output.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    output.connect(context.destination);
    filter.connect(output);

    frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = wave;
      oscillator.frequency.setValueAtTime(frequency, now + index * 0.045);
      oscillator.connect(filter);
      oscillator.start(now + index * 0.045);
      oscillator.stop(now + duration + 0.03);
    });

    window.setTimeout(() => output.disconnect(), (duration + 0.08) * 1000);
  } catch (error) {
    console.warn('Failed to play generated UI sound', error);
  }
};

const playTone = (
  context: AudioContext,
  destination: AudioNode,
  frequency: number,
  startTime: number,
  duration: number,
  wave: OscillatorType,
  gainValue: number,
) => {
  if (!frequency) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();

  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(920, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainValue, startTime + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.03);
};

const lessonModes: Array<keyof typeof generatedMusic> = [
  'tenFrame',
  'compare',
  'numberLine',
  'battle',
  'count',
  'add',
  'subtract',
  'review',
  'puzzle',
  'money',
  'shape',
  'clock',
];

const transpose = (notes: number[], ratio: number) => notes.map(note => note ? note * ratio : 0);

const getGeneratedMusicConfig = (track: BackgroundTrack): GeneratedMusicConfig => {
  if (track.startsWith('lesson-')) {
    const lessonId = Number(track.replace('lesson-', ''));
    const base = generatedMusic[lessonModes[(lessonId - 1) % lessonModes.length]] || generatedMusic.level;
    const region = Math.ceil(lessonId / 4);
    const tension = lessonId % 4 === 0 ? 1.1 : 1;
    const ratio = [1, 1.059, 1.122, 0.943, 1.189, 0.891][(region - 1) % 6];

    return {
      bpm: base.bpm + (lessonId % 4) * 6 + (lessonId % 4 === 0 ? 10 : 0),
      volume: Math.min(0.04, base.volume + 0.002 + region * 0.001),
      wave: lessonId % 3 === 0 ? 'square' : base.wave,
      melody: transpose(base.melody, ratio * tension),
      bass: transpose(base.bass, ratio),
      accentEvery: lessonId % 4 === 0 ? 4 : lessonId % 3 === 0 ? 8 : undefined,
    };
  }

  return generatedMusic[track] || generatedMusic.level;
};

const startGeneratedMusic = async (track: BackgroundTrack): Promise<void> => {
  const context = getAudioContext();
  await context.resume().catch(() => {});

  const config = getGeneratedMusicConfig(track);
  musicMaster = context.createGain();
  musicMaster.gain.setValueAtTime(0.0001, context.currentTime);
  musicMaster.gain.exponentialRampToValueAtTime(config.volume, context.currentTime + 0.35);
  musicMaster.connect(context.destination);

  musicStep = 0;
  const stepMs = (60_000 / config.bpm) / 2;

  const scheduleStep = () => {
    if (!musicMaster) return;
    const now = context.currentTime;
    const melodyNote = config.melody[musicStep % config.melody.length];
    const bassNote = config.bass[Math.floor(musicStep / 4) % config.bass.length];
    const isAccent = config.accentEvery ? musicStep % config.accentEvery === 0 : false;

    playTone(context, musicMaster, melodyNote, now, stepMs / 1000 * 1.45, config.wave, isAccent ? 0.032 : 0.026);

    if (musicStep % 4 === 0) {
      playTone(context, musicMaster, bassNote / 2, now, stepMs / 1000 * 3.2, 'sine', 0.018);
    }

    if (isAccent) {
      playTone(context, musicMaster, melodyNote * 1.5, now + 0.02, 0.16, 'sine', 0.01);
    }

    musicStep += 1;
  };

  scheduleStep();
  musicTimer = window.setInterval(scheduleStep, stepMs);
};

const startFileMusic = async (track: BackgroundTrack, config: SoundConfig): Promise<void> => {
  currentBackgroundMusic = new Audio(config.path);
  currentBackgroundMusic.loop = config.loop || false;
  currentBackgroundMusic.volume = 0;
  await currentBackgroundMusic.play().catch(() => {});

  const targetVolume = config.volume;
  let step = 0;
  const fadeTimer = window.setInterval(() => {
    if (!currentBackgroundMusic) {
      window.clearInterval(fadeTimer);
      return;
    }
    step += 1;
    currentBackgroundMusic.volume = Math.min(targetVolume, (targetVolume * step) / 12);
    if (step >= 12) window.clearInterval(fadeTimer);
  }, 40);
};

export const playSound = async (soundKey: string): Promise<void> => {
  try {
    if (soundKey === 'click' || soundKey === 'select' || soundKey === 'hover') {
      playEnvelopeTone(soundKey === 'hover' ? [440] : [392, 523.25], 0.09, 'sine', 0.018);
      return;
    }

    if (soundKey === 'success') {
      playEnvelopeTone([523.25, 659.25, 783.99], 0.18, 'sine', 0.045);
      return;
    }

    if (soundKey === 'coin') {
      playEnvelopeTone([659.25, 987.77], 0.13, 'square', 0.032);
      return;
    }

    if (soundKey === 'combo') {
      playEnvelopeTone([523.25, 659.25, 783.99, 987.77], 0.19, 'triangle', 0.046);
      return;
    }

    if (soundKey === 'boss_hit' || soundKey === 'hit') {
      playEnvelopeTone([220, 293.66, 392], 0.16, 'square', 0.04);
      return;
    }

    if (soundKey === 'attack') {
      playEnvelopeTone([392, 587.33], 0.12, 'sawtooth', 0.032);
      return;
    }

    if (soundKey === 'damage') {
      playEnvelopeTone([164.81, 130.81, 98], 0.2, 'sawtooth', 0.04);
      return;
    }

    if (soundKey === 'place_block' || soundKey === 'drop') {
      playEnvelopeTone([261.63, 329.63], 0.1, 'triangle', 0.026);
      return;
    }

    if (soundKey === 'unlock') {
      playEnvelopeTone([392, 523.25, 783.99], 0.22, 'triangle', 0.044);
      return;
    }

    if (soundKey === 'level_up' || soundKey === 'achievement_unlock' || soundKey === 'puzzle_complete' || soundKey === 'victory') {
      playEnvelopeTone([523.25, 659.25, 783.99, 1046.5], 0.26, 'triangle', 0.055);
      return;
    }

    if (soundKey === 'error' || soundKey === 'defeat') {
      playEnvelopeTone([196, 164.81], 0.18, 'triangle', 0.04);
      return;
    }

    const config = soundEffects[soundKey];
    if (!config) {
      console.warn(`Sound effect not found: ${soundKey}`);
      return;
    }

    const audio = new Audio(config.path);
    audio.volume = config.volume;
    await audio.play().catch(() => {});
  } catch (error) {
    console.warn(`Failed to play sound: ${soundKey}`, error);
  }
};

export const playUISound = (type: 'click' | 'hover' | 'success' | 'error' | 'select'): void => {
  playSound(type);
};

export const playBattleSound = (type: 'attack' | 'hit' | 'damage' | 'victory' | 'defeat'): void => {
  playSound(type);
};

export const playPuzzleSound = (type: 'place_block' | 'remove_block' | 'puzzle_complete'): void => {
  playSound(type);
};

export const playAchievementSound = (type: 'achievement_unlock' | 'level_up'): void => {
  playSound(type);
};

export const playMonsterSound = (type: 'monster_spawn' | 'monster_death'): void => {
  playSound(type);
};

export const playFeedbackSound = (type: 'coin' | 'combo' | 'boss_hit' | 'drop' | 'unlock'): void => {
  playSound(type);
};

export const playBackgroundMusic = async (track: BackgroundTrack): Promise<void> => {
  try {
    if (currentBackgroundTrack === track) {
      if (currentBackgroundMusic?.paused) {
        await currentBackgroundMusic.play().catch(() => {});
      }
      return;
    }
    stopBackgroundMusic();
    currentBackgroundTrack = track;

    const fileMusic = track.startsWith('lesson-') ? undefined : fileBackedMusic[track];
    if (fileMusic) {
      await startFileMusic(track, fileMusic);
      return;
    }

    currentGeneratedTrack = track;
    await startGeneratedMusic(track);
  } catch (error) {
    console.warn(`Failed to play background music: ${track}`, error);
  }
};

export const playLessonBackgroundMusic = async (lessonId: number): Promise<void> => {
  await playBackgroundMusic(`lesson-${lessonId}`);
};

export const stopBackgroundMusic = (): void => {
  if (musicTimer !== null) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }

  if (musicMaster && audioContext) {
    const master = musicMaster;
    master.gain.cancelScheduledValues(audioContext.currentTime);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), audioContext.currentTime);
    master.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.18);
    window.setTimeout(() => master.disconnect(), 220);
    musicMaster = null;
  }

  currentGeneratedTrack = null;
  currentBackgroundTrack = null;

  if (currentBackgroundMusic) {
    currentBackgroundMusic.pause();
    currentBackgroundMusic.currentTime = 0;
    currentBackgroundMusic = null;
  }
};

export const pauseBackgroundMusic = (): void => {
  if (currentBackgroundMusic) {
    currentBackgroundMusic.pause();
  }
  if (audioContext?.state === 'running') {
    audioContext.suspend().catch(() => {});
  }
};

export const resumeBackgroundMusic = (): void => {
  if (currentBackgroundMusic) {
    currentBackgroundMusic.play().catch(() => {});
  }
  if (audioContext?.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
};

export const setBackgroundMusicVolume = (volume: number): void => {
  if (currentBackgroundMusic) {
    currentBackgroundMusic.volume = Math.max(0, Math.min(1, volume));
  }
  if (musicMaster) {
    musicMaster.gain.value = Math.max(0.0001, Math.min(0.16, volume));
  }
};

export const initializeAudio = (): void => {
  getAudioContext();
};
