import {
  _decorator,
  Component,
  log,
  warn,
} from 'cc';
import {
  AutosaveSession,
  type AutosaveLoadResult,
  type AutosaveWriteResult,
  type IRuntimeAutosavePort,
} from '../core/save/AutosaveSession';
import type { SaveData } from '../core/save/SaveData';
import {
  TiledSleepingController,
  type SleepCompletedEvent,
} from '../farming/TiledSleepingController';
import { createCocosLocalSaveService } from '../platform/CocosLocalSaveService';
import {
  RuntimeSaveBridge,
  type CaptureSnapshotResult,
  type RestoreSnapshotResult,
} from './RuntimeSaveBridge';

const { ccclass, property, requireComponent } = _decorator;

const DEFAULT_SAVE_NAMESPACE = 'farm-game';

/**
 * Scene composition root for the local MVP autosave. It starts one validated
 * load and saves only after a successful sleep/day transition.
 */
@ccclass('LocalAutosaveController')
@requireComponent(RuntimeSaveBridge)
export class LocalAutosaveController extends Component {
  @property({
    tooltip: 'Persistent key namespace shared by repeated launches of this build.',
  })
  public storageNamespace = DEFAULT_SAVE_NAMESPACE;

  private session: AutosaveSession | null = null;
  private sleeping: TiledSleepingController | null = null;
  private unsubscribeSleep: (() => void) | null = null;
  private readyToSave = false;
  private loadStatus: AutosaveLoadResult['status'] | 'idle' = 'idle';
  private saveStatus: AutosaveWriteResult['status'] | 'idle' = 'idle';

  public get lastLoadStatus(): AutosaveLoadResult['status'] | 'idle' {
    return this.loadStatus;
  }

  public get lastSaveStatus(): AutosaveWriteResult['status'] | 'idle' {
    return this.saveStatus;
  }

  protected override onEnable(): void {
    this.subscribeToSleepIfReady();
  }

  protected override start(): void {
    void this.initialize();
  }

  protected override onDisable(): void {
    this.unsubscribeSleep?.();
    this.unsubscribeSleep = null;
  }

  private async initialize(): Promise<void> {
    const bridge = this.getComponent(RuntimeSaveBridge);
    this.sleeping = this.getComponent(TiledSleepingController);
    const validation = bridge?.getSaveValidationCatalog() ?? null;
    if (bridge === null || this.sleeping === null || validation === null) {
      this.loadStatus = 'restore_failed';
      warn(
        '[LocalAutosaveController] Keep RuntimeSaveBridge and ' +
        'TiledSleepingController valid on the Player node.',
      );
      return;
    }

    const namespace = this.storageNamespace.trim() || DEFAULT_SAVE_NAMESPACE;
    const runtime = this.createRuntimePort(bridge);
    this.session = new AutosaveSession(
      createCocosLocalSaveService(namespace),
      validation,
      runtime,
    );

    const result = await this.session.load();
    this.loadStatus = result.status;
    if (result.status !== 'loaded' && result.status !== 'new_game') {
      warn(
        `[LocalAutosaveController] startup ${result.status}: ${result.message}`,
      );
      return;
    }

    this.readyToSave = true;
    log(`[LocalAutosaveController] startup ${result.status}.`);
    this.subscribeToSleepIfReady();
  }

  private createRuntimePort(bridge: RuntimeSaveBridge): IRuntimeAutosavePort {
    return {
      capture: (savedAt: Date) => (
        this.mapCaptureResult(bridge.captureSnapshot(savedAt))
      ),
      restore: (save: SaveData) => (
        this.mapRestoreResult(bridge.restoreSnapshot(save))
      ),
    };
  }

  private mapCaptureResult(
    result: CaptureSnapshotResult,
  ): ReturnType<IRuntimeAutosavePort['capture']> {
    return result.status === 'captured'
      ? result
      : { status: 'failed', message: result.message };
  }

  private mapRestoreResult(
    result: RestoreSnapshotResult,
  ): ReturnType<IRuntimeAutosavePort['restore']> {
    if (result.status === 'restored') {
      return result;
    }
    return {
      status: 'failed',
      message: 'message' in result
        ? result.message
        : `runtime restore rejected save: ${result.status}`,
    };
  }

  private subscribeToSleepIfReady(): void {
    if (
      !this.readyToSave ||
      this.session === null ||
      this.sleeping === null ||
      this.unsubscribeSleep !== null
    ) {
      return;
    }

    this.unsubscribeSleep = this.sleeping.subscribeSleepCompleted(
      (event: SleepCompletedEvent) => {
        void this.saveAfterSleep(event);
      },
    );
  }

  private async saveAfterSleep(event: SleepCompletedEvent): Promise<void> {
    const session = this.session;
    if (session === null) {
      return;
    }

    const result = await session.save(new Date());
    this.saveStatus = result.status;
    if (result.status === 'saved') {
      log(
        `[LocalAutosaveController] autosaved day ${event.currentDay} ` +
        `after sleep from day ${event.previousDay}.`,
      );
      return;
    }

    warn(
      `[LocalAutosaveController] autosave ${result.status}: ${result.message}`,
    );
  }
}
