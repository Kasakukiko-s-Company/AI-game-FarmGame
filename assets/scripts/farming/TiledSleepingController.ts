import {
  _decorator,
  Component,
  JsonAsset,
  log,
  warn,
} from 'cc';
import { decodeCropsData } from '../data/CropDataDecoder';
import { PlayerController } from '../player/PlayerController';
import type { SleepAtTileStatus } from './FarmDayCycle';
import { TiledTillingController } from './TiledTillingController';

const { ccclass, property, requireComponent } = _decorator;

/** Connects semantic sleep confirmation to one authoritative day transition. */
@ccclass('TiledSleepingController')
@requireComponent(TiledTillingController)
export class TiledSleepingController extends Component {
  @property({ type: JsonAsset, tooltip: 'Validated assets/data/crops.json configuration.' })
  public cropsData: JsonAsset | null = null;

  private controller: PlayerController | null = null;
  private stateOwner: TiledTillingController | null = null;
  private sleepActionHeld = false;
  private actionStatus: SleepAtTileStatus | 'idle' = 'idle';
  private didWarnInvalidSetup = false;

  public get lastActionStatus(): SleepAtTileStatus | 'idle' {
    return this.actionStatus;
  }

  protected override onEnable(): void {
    this.controller = this.getComponent(PlayerController);
    this.stateOwner = this.getComponent(TiledTillingController);
  }

  protected override onDisable(): void {
    this.sleepActionHeld = false;
    this.controller = null;
    this.stateOwner = null;
    this.didWarnInvalidSetup = false;
  }

  protected override update(): void {
    const snapshot = this.controller?.getInputSnapshot();
    if (snapshot === undefined || !snapshot.sleepAction) {
      this.sleepActionHeld = false;
      return;
    }
    if (this.sleepActionHeld) {
      return;
    }

    this.sleepActionHeld = true;
    if (
      snapshot.primaryAction ||
      snapshot.secondaryAction ||
      snapshot.wateringAction
    ) {
      return;
    }

    this.trySleepAtFacingTile();
  }

  private trySleepAtFacingTile(): void {
    const cropsFile = decodeCropsData(this.cropsData?.json);
    if (this.stateOwner === null || cropsFile === null) {
      this.warnInvalidSetupOnce();
      return;
    }

    const previousDay = this.stateOwner.farmDayState.currentDay;
    const result = this.stateOwner.sleepFacingTile(cropsFile.crops);
    if (result === null) {
      this.warnInvalidSetupOnce();
      return;
    }

    this.didWarnInvalidSetup = false;
    this.actionStatus = result.status;
    if (result.status === 'slept' && result.spawnWorldPosition !== null) {
      const position = this.node.worldPosition;
      this.node.setWorldPosition(
        result.spawnWorldPosition.x,
        result.spawnWorldPosition.y,
        position.z,
      );
      log(
        `[TiledSleepingController] slept day ${previousDay} -> ` +
        `${result.state.currentDay}; target=(${result.target?.x ?? '-'}, ` +
        `${result.target?.y ?? '-'}).`,
      );
      return;
    }

    log(
      `[TiledSleepingController] ${result.status} tile ` +
      `(${result.target?.x ?? '-'}, ${result.target?.y ?? '-'}); ` +
      `day=${result.state.currentDay}.`,
    );
  }

  private warnInvalidSetupOnce(): void {
    if (this.didWarnInvalidSetup) {
      return;
    }

    this.didWarnInvalidSetup = true;
    warn(
      '[TiledSleepingController] Assign crops.json and configure the existing map/day owner.',
    );
  }
}
