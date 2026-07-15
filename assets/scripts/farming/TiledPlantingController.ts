import {
  _decorator,
  Component,
  JsonAsset,
  log,
  warn,
} from 'cc';
import { decodeCropsData } from '../data/CropDataDecoder';
import { PlayerController } from '../player/PlayerController';
import type { PlantCropStatus, SeedStack } from './CropPlanting';
import { TiledTillingController } from './TiledTillingController';

const { ccclass, property, requireComponent } = _decorator;

/** Connects semantic planting input to configured crops and the shared farm state. */
@ccclass('TiledPlantingController')
@requireComponent(TiledTillingController)
export class TiledPlantingController extends Component {
  @property({ type: JsonAsset, tooltip: 'Validated assets/data/crops.json configuration.' })
  public cropsData: JsonAsset | null = null;

  @property({ tooltip: 'Temporary seed item used before the inventory stage.' })
  public seedItemId = 'mistleaf_seed';

  @property({ min: 0, step: 1, tooltip: 'Temporary starting seed quantity.' })
  public startingSeedQuantity = 3;

  @property({ min: 1, step: 1, tooltip: 'Current game day before the time system exists.' })
  public currentDay = 1;

  private controller: PlayerController | null = null;
  private stateOwner: TiledTillingController | null = null;
  private seeds: SeedStack = { itemId: 'mistleaf_seed', quantity: 3 };
  private secondaryActionHeld = false;
  private actionStatus: PlantCropStatus | 'idle' = 'idle';
  private didWarnInvalidSetup = false;

  public get remainingSeedQuantity(): number {
    return this.seeds.quantity;
  }

  public get lastActionStatus(): PlantCropStatus | 'idle' {
    return this.actionStatus;
  }

  protected override onLoad(): void {
    this.seeds = {
      itemId: this.seedItemId,
      quantity: this.startingSeedQuantity,
    };
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

    this.tryPlantFacingTile();
  }

  private tryPlantFacingTile(): void {
    const cropsFile = decodeCropsData(this.cropsData?.json);
    if (
      this.stateOwner === null ||
      cropsFile === null ||
      this.seedItemId.trim().length === 0 ||
      !Number.isInteger(this.seeds.quantity) ||
      this.seeds.quantity < 0 ||
      !Number.isInteger(this.currentDay) ||
      this.currentDay <= 0
    ) {
      this.warnInvalidSetupOnce();
      return;
    }

    const result = this.stateOwner.plantFacingCrop(
      this.seeds,
      this.currentDay,
      cropsFile.crops,
    );
    if (result === null) {
      this.warnInvalidSetupOnce();
      return;
    }

    this.didWarnInvalidSetup = false;
    this.seeds = result.seeds;
    this.actionStatus = result.status;
    log(
      `[TiledPlantingController] ${result.status} tile ` +
      `(${result.target?.x ?? '-'}, ${result.target?.y ?? '-'}); ` +
      `seeds=${result.seeds.quantity}.`,
    );
  }

  private warnInvalidSetupOnce(): void {
    if (this.didWarnInvalidSetup) {
      return;
    }

    this.didWarnInvalidSetup = true;
    warn(
      '[TiledPlantingController] Assign crops.json and configure a valid seed, day and tilling source.',
    );
  }
}
