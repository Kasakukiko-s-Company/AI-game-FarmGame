import {
  DesktopPlatformService,
  NoopAnalyticsService,
  NoopAudioService,
  WeChatPlatformService,
} from './PlatformAdapters';
import type {
  IAnalyticsService,
  IAudioService,
  IInputService,
  ISaveService,
  PlatformServices,
  SafeAreaInsets,
} from './PlatformContracts';

export type PlatformBuildTarget =
  | {
      readonly kind: 'steam-windows';
    }
  | {
      readonly kind: 'wechat-minigame';
      readonly safeArea?: SafeAreaInsets;
    };

/** Platform adapters that must be selected before shared game code starts. */
export interface PlatformAdapterSet {
  readonly saves: ISaveService;
  readonly input: IInputService;
  readonly audio?: IAudioService;
  readonly analytics?: IAnalyticsService;
}

/**
 * The single composition root for release targets. Persistent saves and real
 * input are mandatory so a release cannot silently fall back to development
 * adapters. Optional capabilities receive harmless MVP defaults.
 */
export function composePlatformServices(
  target: PlatformBuildTarget,
  adapters: PlatformAdapterSet,
): PlatformServices {
  const shared = {
    saves: adapters.saves,
    input: adapters.input,
    audio: adapters.audio ?? new NoopAudioService(),
    analytics: adapters.analytics ?? new NoopAnalyticsService(),
  };

  switch (target.kind) {
    case 'steam-windows':
      return Object.freeze({
        platform: new DesktopPlatformService('steam'),
        ...shared,
      });
    case 'wechat-minigame':
      return Object.freeze({
        platform: new WeChatPlatformService(target.safeArea),
        ...shared,
      });
  }
}
