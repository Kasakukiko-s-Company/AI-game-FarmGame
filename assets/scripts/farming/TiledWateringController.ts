import {
  _decorator,
  Component,
  log,
  warn,
} from 'cc';
import { PlayerController } from '../player/PlayerController';
import {
  TiledTillingController,
  type FacingWaterTileResult,
} from './TiledTillingController';

const { ccclass, requireComponent } = _decorator;

/** Connects semantic watering input to the authoritative farm day state. */
@ccclass('TiledWateringController')
@requireComponent(TiledTillingController)
export class TiledWateringController extends Component {
  private controller: PlayerController | null = null;
  private stateOwner: TiledTillingController | null = null;
  private wateringActionHeld = false;
  private actionStatus: FacingWaterTileResult['status'] | 'idle' = 'idle';
  private didWarnInvalidSetup = false;

  public get lastActionStatus(): FacingWaterTileResult['status'] | 'idle' {
    return this.actionStatus;
  }

  protected override onEnable(): void {
    this.controller = this.getComponent(PlayerController);
    this.stateOwner = this.getComponent(TiledTillingController);
  }

  protected override onDisable(): void {
    this.wateringActionHeld = false;
    this.controller = null;
    this.stateOwner = null;
    this.didWarnInvalidSetup = false;
  }

  protected override update(): void {
    const snapshot = this.controller?.getInputSnapshot();
    if (snapshot === undefined) {
      return;
    }
    this.stateOwner?.applyQuickbarSelectionInput(snapshot);
    if (!snapshot.wateringAction) {
      this.wateringActionHeld = false;
      return;
    }
    if (this.wateringActionHeld) {
      return;
    }

    this.wateringActionHeld = true;
    if (snapshot.primaryAction || snapshot.secondaryAction) {
      return;
    }

    this.tryWaterFacingTile();
  }

  private tryWaterFacingTile(): void {
    const result = this.stateOwner?.waterFacingTile() ?? null;
    if (result === null) {
      this.warnInvalidSetupOnce();
      return;
    }

    this.didWarnInvalidSetup = false;
    this.actionStatus = result.status;
    log(
      `[TiledWateringController] ${result.status} tile ` +
      `(${result.target?.x ?? '-'}, ${result.target?.y ?? '-'}).`,
    );
  }

  private warnInvalidSetupOnce(): void {
    if (this.didWarnInvalidSetup) {
      return;
    }

    this.didWarnInvalidSetup = true;
    warn('[TiledWateringController] Configure the existing tilling state owner first.');
  }
}
