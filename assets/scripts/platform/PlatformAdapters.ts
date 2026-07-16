import type {
  IAnalyticsService,
  IAudioService,
  IInputService,
  IPlatformService,
  ISaveService,
  InputSnapshot,
  LifecycleState,
  PlatformDescriptor,
  SafeAreaInsets,
  SaveReadResult,
  SaveWriteResult,
  Unsubscribe,
  WindowsDistributionChannel,
} from './PlatformContracts';
import {
  NEUTRAL_INPUT,
  ZERO_SAFE_AREA,
} from './PlatformContracts';

const noOpUnsubscribe: Unsubscribe = () => undefined;

/** Desktop platform identity; native lifecycle wiring belongs to a later stage. */
export class DesktopPlatformService implements IPlatformService {
  public readonly descriptor: PlatformDescriptor;

  public constructor(distribution: WindowsDistributionChannel = 'standalone') {
    this.descriptor = Object.freeze({
      runtime: 'windows-native',
      distribution,
    });
  }

  public getSafeArea(): SafeAreaInsets {
    return ZERO_SAFE_AREA;
  }

  public subscribeLifecycle(_listener: (state: LifecycleState) => void): Unsubscribe {
    return noOpUnsubscribe;
  }
}

/** WeChat identity without touching the global wx object from shared code. */
export class WeChatPlatformService implements IPlatformService {
  public readonly descriptor: PlatformDescriptor = Object.freeze({
    runtime: 'wechat-minigame',
    distribution: 'wechat',
  });
  private readonly safeArea: SafeAreaInsets;

  public constructor(safeArea: SafeAreaInsets = ZERO_SAFE_AREA) {
    this.safeArea = safeArea;
  }

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

/**
 * Minimal key-value surface implemented by Cocos local storage and by tests.
 * The platform adapter owns namespacing so game code only sees save slot IDs.
 */
export interface LocalKeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Persistent opaque save adapter over a platform-provided key-value store. */
export class LocalKeyValueSaveService implements ISaveService {
  private readonly storage: LocalKeyValueStorage;
  private readonly namespace: string;

  public constructor(
    storage: LocalKeyValueStorage,
    namespace = 'farm-game',
  ) {
    this.storage = storage;
    this.namespace = namespace;
  }

  public async read(slotId: string): Promise<SaveReadResult> {
    const key = this.createKey(slotId);
    if (key === null) {
      return { status: 'failed', message: 'save slot ID must not be empty' };
    }

    try {
      const payload = this.storage.getItem(key);
      return payload === null
        ? { status: 'missing' }
        : { status: 'found', payload };
    } catch (error: unknown) {
      return {
        status: 'failed',
        message: this.describeStorageError('read', error),
      };
    }
  }

  public async write(slotId: string, payload: string): Promise<SaveWriteResult> {
    const key = this.createKey(slotId);
    if (key === null) {
      return { status: 'failed', message: 'save slot ID must not be empty' };
    }

    try {
      this.storage.setItem(key, payload);
      return { status: 'written' };
    } catch (error: unknown) {
      return {
        status: 'failed',
        message: this.describeStorageError('write', error),
      };
    }
  }

  public async remove(slotId: string): Promise<SaveWriteResult> {
    const key = this.createKey(slotId);
    if (key === null) {
      return { status: 'failed', message: 'save slot ID must not be empty' };
    }

    try {
      this.storage.removeItem(key);
      return { status: 'written' };
    } catch (error: unknown) {
      return {
        status: 'failed',
        message: this.describeStorageError('remove', error),
      };
    }
  }

  private createKey(slotId: string): string | null {
    const normalizedSlotId = slotId.trim();
    if (normalizedSlotId.length === 0) {
      return null;
    }

    const normalizedNamespace = this.namespace.trim() || 'farm-game';
    return `${normalizedNamespace}:${normalizedSlotId}`;
  }

  private describeStorageError(operation: string, error: unknown): string {
    const detail = error instanceof Error ? error.message : String(error);
    return `local save ${operation} failed: ${detail}`;
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
