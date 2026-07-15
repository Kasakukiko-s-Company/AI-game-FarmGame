/** Platform capabilities exposed to application code at one stable seam. */

export type PlatformKind = 'desktop' | 'wechat';
export type LifecycleState = 'active' | 'background';
export type Unsubscribe = () => void;

export interface SafeAreaInsets {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

export interface InputSnapshot {
  readonly moveX: number;
  readonly moveY: number;
  readonly primaryAction: boolean;
  readonly secondaryAction: boolean;
  readonly wateringAction: boolean;
  readonly selectPrevious: boolean;
  readonly selectNext: boolean;
  readonly pause: boolean;
}

export type SaveReadResult =
  | { readonly status: 'found'; readonly payload: string }
  | { readonly status: 'missing' }
  | { readonly status: 'failed'; readonly message: string };

export type SaveWriteResult =
  | { readonly status: 'written' }
  | { readonly status: 'failed'; readonly message: string };

export type AnalyticsValue = string | number | boolean;
export type AnalyticsProperties = Readonly<Record<string, AnalyticsValue>>;

export interface IPlatformService {
  readonly kind: PlatformKind;
  getSafeArea(): SafeAreaInsets;
  subscribeLifecycle(listener: (state: LifecycleState) => void): Unsubscribe;
}

/** Stores an opaque serialized save so platform code never owns game rules. */
export interface ISaveService {
  read(slotId: string): Promise<SaveReadResult>;
  write(slotId: string, payload: string): Promise<SaveWriteResult>;
  remove(slotId: string): Promise<SaveWriteResult>;
}

export interface IInputService {
  getSnapshot(): InputSnapshot;
}

export interface IAudioService {
  playMusic(audioId: string): void;
  stopMusic(): void;
  playSound(audioId: string): void;
  setMuted(muted: boolean): void;
}

export interface IAnalyticsService {
  track(eventName: string, properties?: AnalyticsProperties): void;
}

export interface PlatformServices {
  readonly platform: IPlatformService;
  readonly saves: ISaveService;
  readonly input: IInputService;
  readonly audio: IAudioService;
  readonly analytics: IAnalyticsService;
}

export const ZERO_SAFE_AREA: SafeAreaInsets = Object.freeze({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});

export const NEUTRAL_INPUT: InputSnapshot = Object.freeze({
  moveX: 0,
  moveY: 0,
  primaryAction: false,
  secondaryAction: false,
  wateringAction: false,
  selectPrevious: false,
  selectNext: false,
  pause: false,
});
