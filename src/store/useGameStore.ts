import { create } from 'zustand';
import { GameStore, DayNightMode, LanternData, PlayerControlMethods } from '../types';

export const useGameStore = create<GameStore>((set) => ({
  isLoaded: false,
  isPointerLocked: false,
  dayNightMode: 'night',
  playerPosition: [0, 1.7, 0],
  playerRotation: [0, 0],
  showBloom: true,
  fps: 60,
  nearestLantern: null,
  webGL2Supported: true,
  playerControl: null,
  camera: null,
  viewportSize: null,

  setLoaded: (loaded: boolean) => set({ isLoaded: loaded }),
  setPointerLocked: (locked: boolean) => set({ isPointerLocked: locked }),
  setDayNightMode: (mode: DayNightMode) => set({ dayNightMode: mode }),
  setPlayerPosition: (pos: [number, number, number]) => set({ playerPosition: pos }),
  setPlayerRotation: (rot: [number, number]) => set({ playerRotation: rot }),
  setShowBloom: (show: boolean) => set({ showBloom: show }),
  setFps: (fps: number) => set({ fps }),
  setNearestLantern: (lantern: LanternData | null) => set({ nearestLantern: lantern }),
  setWebGL2Supported: (supported: boolean) => set({ webGL2Supported: supported }),
  setPlayerControl: (control: PlayerControlMethods | null) => set({ playerControl: control }),
  setCamera: (camera) => set({ camera }),
  setViewportSize: (size) => set({ viewportSize: size }),
}));
