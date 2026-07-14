import {
  IAnalyticsService,
  IAudioService,
  IInputService,
  IPlatformService,
  ISaveService,
  InputSnapshot,
  LifecycleState,
  NEUTRAL_INPUT,
  SafeAreaInsets,
  SaveReadResult,
  SaveWriteResult,
  Unsubscribe,
  ZERO_SAFE_AREA,
} from './PlatformContracts';

const noOpUnsubscribe: Unsubscribe = () => undefined;

/** Desktop platform identity; native lifecycle wiring belongs to a later stage. */
export class DesktopPlatformService implements IPlatformService {
  public readonly kind = 'desktop' as const;

  public getSafeArea(): SafeAreaInsets {
    return ZERO_SAFE_AREA;
  }

  public subscribeLifecycle(_listener: (state: LifecycleState) => void): Unsubscribe {
    return noOpUnsubscribe;
  }
}

/** WeChat identity without touching the global wx object from shared code. */
export class WeChatPlatformService implements IPlatformService {
  public readonly kind = 'wechat' as const;

  public constructor(private readonly safeArea: SafeAreaInsets = ZERO_SAFE_AREA) {}

  public getSafeArea(): SafeAreaInsets {
    return this.safeArea;
  }

  public subscribeLifecycle(_listener: (state: LifecycleState) => void): Unsubscribe {
    return noOpUnsubscribe;
  }
}

/** Test/development adapter. It is intentionally not a persistent player save. */
export class MemorySaveService implements ISaveService {
  private readonly slots = new Map<string, string>();

  public async read(slotId: string): Promise<SaveReadResult> {
    const payload = this.slots.get(slotId);
    return payload === undefined ? { status: 'missing' } : { status: 'found', payload };
  }

  public async write(slotId: string, payload: string): Promise<SaveWriteResult> {
    this.slots.set(slotId, payload);
    return { status: 'written' };
  }

  public async remove(slotId: string): Promise<SaveWriteResult> {
    this.slots.delete(slotId);
    return { status: 'written' };
  }
}

/** Neutral input keeps bootstrap code independent from unfinished controls. */
export class NeutralInputService implements IInputService {
  public getSnapshot(): InputSnapshot {
    return NEUTRAL_INPUT;
  }
}

export class NoopAudioService implements IAudioService {
  public playMusic(_audioId: string): void {}
  public stopMusic(): void {}
  public playSound(_audioId: string): void {}
  public setMuted(_muted: boolean): void {}
}

export class NoopAnalyticsService implements IAnalyticsService {
  public track(_eventName: string): void {}
}
