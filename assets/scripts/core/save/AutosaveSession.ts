import type { ISaveService } from '../../platform/PlatformContracts';
import type { SaveValidationCatalog } from './SaveCodec';
import type { SaveData } from './SaveData';
import {
  readAutosave,
  writeAutosave,
} from './SaveGame';

export type RuntimeCaptureResult =
  | { readonly status: 'captured'; readonly save: SaveData }
  | { readonly status: 'failed'; readonly message: string };

export type RuntimeRestoreResult =
  | { readonly status: 'restored' }
  | { readonly status: 'failed'; readonly message: string };

/** Small runtime seam; Cocos scene details remain outside the save module. */
export interface IRuntimeAutosavePort {
  capture(savedAt: Date): RuntimeCaptureResult;
  restore(save: SaveData): RuntimeRestoreResult;
}

export type AutosaveLoadResult =
  | { readonly status: 'new_game' }
  | { readonly status: 'loaded' }
  | {
      readonly status: 'invalid_save';
      readonly message: string;
    }
  | {
      readonly status: 'storage_failed' | 'restore_failed';
      readonly message: string;
    };

export type AutosaveWriteResult =
  | { readonly status: 'saved' }
  | {
      readonly status: 'not_ready' | 'capture_failed' | 'storage_failed';
      readonly message: string;
    };

/**
 * Owns the complete autosave transaction: fixed slot, decoding, validation,
 * startup restore and serialized writes. Failed startup reads block writes so
 * a damaged or temporarily inaccessible save cannot be silently overwritten.
 */
export class AutosaveSession {
  private loadPromise: Promise<AutosaveLoadResult> | null = null;
  private canWrite = false;
  private writeTail: Promise<void> = Promise.resolve();
  private readonly saves: ISaveService;
  private readonly validation: SaveValidationCatalog;
  private readonly runtime: IRuntimeAutosavePort;

  public constructor(
    saves: ISaveService,
    validation: SaveValidationCatalog,
    runtime: IRuntimeAutosavePort,
  ) {
    this.saves = saves;
    this.validation = validation;
    this.runtime = runtime;
  }

  public load(): Promise<AutosaveLoadResult> {
    if (this.loadPromise === null) {
      this.loadPromise = this.performLoad();
    }
    return this.loadPromise;
  }

  public save(savedAt = new Date()): Promise<AutosaveWriteResult> {
    const operation = this.writeTail.then(() => this.performSave(savedAt));
    this.writeTail = operation.then(
      () => undefined,
      () => undefined,
    );
    return operation;
  }

  private async performLoad(): Promise<AutosaveLoadResult> {
    const result = await readAutosave(this.saves, this.validation);
    if (result.status === 'missing') {
      this.canWrite = true;
      return { status: 'new_game' };
    }
    if (result.status === 'storage_failed') {
      return result;
    }
    if (result.status === 'invalid_save') {
      return {
        status: 'invalid_save',
        message: result.message,
      };
    }

    let restored: RuntimeRestoreResult;
    try {
      restored = this.runtime.restore(result.save);
    } catch (error: unknown) {
      return {
        status: 'restore_failed',
        message: this.describeError('runtime restore threw', error),
      };
    }
    if (restored.status === 'failed') {
      return {
        status: 'restore_failed',
        message: restored.message,
      };
    }

    this.canWrite = true;
    return { status: 'loaded' };
  }

  private async performSave(savedAt: Date): Promise<AutosaveWriteResult> {
    if (!this.canWrite) {
      return {
        status: 'not_ready',
        message: 'autosave is blocked until startup loading succeeds',
      };
    }

    let captured: RuntimeCaptureResult;
    try {
      captured = this.runtime.capture(savedAt);
    } catch (error: unknown) {
      return {
        status: 'capture_failed',
        message: this.describeError('runtime capture threw', error),
      };
    }
    if (captured.status === 'failed') {
      return {
        status: 'capture_failed',
        message: captured.message,
      };
    }

    try {
      return await writeAutosave(
        this.saves,
        captured.save,
        this.validation,
      );
    } catch (error: unknown) {
      return {
        status: 'capture_failed',
        message: this.describeError('save validation failed', error),
      };
    }
  }

  private describeError(context: string, error: unknown): string {
    const detail = error instanceof Error ? error.message : String(error);
    return `${context}: ${detail}`;
  }
}
