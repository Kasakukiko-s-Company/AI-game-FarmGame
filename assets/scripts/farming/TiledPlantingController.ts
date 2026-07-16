import {
  _decorator,
  Component,
  JsonAsset,
  log,
  warn,
} from 'cc';
import { decodeCropsData } from '../data/CropDataDecoder';
import type { InventoryState } from '../inventory/InventoryState';
import { PlayerController } from '../player/PlayerController';
import type { CropInventoryActionStatus } from './CropInventoryActions';
import { TiledTillingController } from './TiledTillingController';

const { ccclass, property, requireComponent } = _decorator;

/** Connects semantic crop input to planting, harvesting and the shared state. */
@ccclass('TiledPlantingController')
@requireComponent(TiledTillingController)
export class TiledPlantingController extends Component {
  @property({ type: JsonAsset, tooltip: 'Validated assets/data/crops.json configuration.' })
  public cropsData: JsonAsset | null = null;

  private controller: PlayerController | null = null;
  private stateOwner: TiledTillingController | null = null;
  private secondaryActionHeld = false;
  private actionStatus: CropInventoryActionStatus | 'idle' = 'idle';
  private didWarnInvalidSetup = false;

  public get lastActionStatus(): CropInventoryActionStatus | 'idle' {
    return this.actionStatus;
  }

  protected override onEnable(): void {
    this.controller = this.getComponent(PlayerController);
    this.stateOwner = this.getComponent(TiledTillingController);
  }

  protected override onDisable(): void {
    this.secondaryActionHeld = false;
    this.controller = null;
    this.stateOwner = null;
    this.didWarnInvalidSetup = false;
  }

  protected override update(): void {
    const snapshot = this.controller?.getInputSnapshot();
    if (snapshot === undefined || !snapshot.secondaryAction) {
      this.secondaryActionHeld = false;
      return;
    }
    if (this.secondaryActionHeld) {
      return;
    }

    this.secondaryActionHeld = true;
    if (snapshot.primaryAction) {
      return;
    }

    this.tryUseFacingCropAction();
  }

  private tryUseFacingCropAction(): void {
    const cropsFile = decodeCropsData(this.cropsData?.json);
    if (this.stateOwner === null || cropsFile === null) {
      this.warnInvalidSetupOnce();
      return;
    }

    const result = this.stateOwner.useFacingCropAction(cropsFile.crops);
    if (result === null) {
      this.warnInvalidSetupOnce();
      return;
    }

    this.didWarnInvalidSetup = false;
    this.actionStatus = result.status;
    log(
      `[TiledPlantingController] ${result.status} tile ` +
      `(${result.target?.x ?? '-'}, ${result.target?.y ?? '-'}); ` +
      `inventory=${this.describeInventory(result.state.inventory)}.`,
    );
  }

  private describeInventory(inventory: InventoryState): string {
    return inventory.slots
      .map((stack) => stack === null ? '-' : `${stack.itemId}:${stack.quantity}`)
      .join('|');
  }

  private warnInvalidSetupOnce(): void {
    if (this.didWarnInvalidSetup) {
      return;
    }

    this.didWarnInvalidSetup = true;
    warn(
      '[TiledPlantingController] Assign crops.json and configure valid map/items state.',
    );
  }
}
