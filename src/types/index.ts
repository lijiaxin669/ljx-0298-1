export interface Blessing {
  id: number;
  text: string;
  category: string;
}

export interface LanternData {
  id: number;
  position: [number, number, number];
  blessingId: number;
  color: string;
  phase: number;
}

export interface SceneConfig {
  street: {
    length: number;
    width: number;
  };
  lanterns: {
    count: number;
    minSpacing: number;
    maxSpacing: number;
    minHeight: number;
    maxHeight: number;
  };
  player: {
    speed: number;
    mouseSensitivity: number;
  };
  tooltip: {
    triggerDistance: number;
  };
}

export type DayNightMode = 'day' | 'night';

export interface GameState {
  isLoaded: boolean;
  isPointerLocked: boolean;
  dayNightMode: DayNightMode;
  playerPosition: [number, number, number];
  playerRotation: [number, number];
  showBloom: boolean;
  fps: number;
  nearestLantern: LanternData | null;
  webGL2Supported: boolean;
  playerControl: PlayerControlMethods | null;
  camera: {
    projectionMatrix: number[];
    matrixWorldInverse: number[];
  } | null;
  viewportSize: { width: number; height: number } | null;
}

export interface PlayerControlMethods {
  setJoystickInput: (x: number, y: number) => void;
  setTouchRotation: (deltaX: number, deltaY: number) => void;
}

export interface GameActions {
  setLoaded: (loaded: boolean) => void;
  setPointerLocked: (locked: boolean) => void;
  setDayNightMode: (mode: DayNightMode) => void;
  setPlayerPosition: (pos: [number, number, number]) => void;
  setPlayerRotation: (rot: [number, number]) => void;
  setShowBloom: (show: boolean) => void;
  setFps: (fps: number) => void;
  setNearestLantern: (lantern: LanternData | null) => void;
  setWebGL2Supported: (supported: boolean) => void;
  setPlayerControl: (control: PlayerControlMethods | null) => void;
  setCamera: (camera: { projectionMatrix: number[]; matrixWorldInverse: number[] } | null) => void;
  setViewportSize: (size: { width: number; height: number } | null) => void;
}

export type GameStore = GameState & GameActions;
