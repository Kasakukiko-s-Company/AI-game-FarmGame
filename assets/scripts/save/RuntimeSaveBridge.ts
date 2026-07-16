import {
  _decorator,
  Component,
  JsonAsset,
  warn,
} from 'cc';
import {
  captureRuntimeSave,
  prepareRuntimeRestore,
  type CaptureRuntimeSaveResult,
  type PrepareRuntimeRestoreResult,
} from '../core/save/RuntimeSaveState';
import type { SaveData } from '../core/save/SaveData';
import { decodeCropsData } from '../data/CropDataDecoder';
import type {
  CropDefinition,
  MapDefinition,
} from '../data/GameDataTypes';
import { TiledTillingController } from '../farming/TiledTillingController';
import { PlayerController } from '../player/PlayerController';

const { ccclass, property, requireComponent } = _decorator;

interface RuntimeSaveSetup {
  readonly player: PlayerController;
  readonly stateOwner: TiledTillingController;
  readonly map: MapDefinition;
  readonly crops: ReadonlyArray<CropDefinition>;
}

export type CaptureSnapshotResult =
  | CaptureRuntimeSaveResult
  | { readonly status: 'setup_missing'; readonly message: string };

export type RestoreSnapshotResult =
  | { readonly status: 'restored' }
  | Exclude<PrepareRuntimeRestoreResult, { readonly status: 'ready' }>
  | { readonly status: 'setup_missing'; readonly message: string }
  | { readonly status: 'apply_failed'; readonly message: string };

/**
 * Cocos adapter over the two existing runtime state owners. Platform save
 * implementations consume this small interface without knowing scene details.
 */
@ccclass('RuntimeSaveBridge')
@requireComponent(TiledTillingController)
export class RuntimeSaveBridge extends Component {
  @property({
    type: JsonAsset,
    tooltip: 'Validated assets/data/crops.json used to verify persisted crops.',
  })
  public cropsData: JsonAsset | null = null;

  private didWarnMissingSetup = false;

  /** Captures all current authoritative state as one validated save snapshot. */
  public captureSnapshot(savedAt = new Date()): CaptureSnapshotResult {
    const setup = this.getSetup();
    if (setup === null) {
      this.warnMissingSetupOnce();
      return {
        status: 'setup_missing',
        message: 'runtime save bridge is missing validated game data or owners',
      };
    }

    this.didWarnMissingSetup = false;
    const player = setup.player.captureRuntimeState();
    const farming = setup.stateOwner.captureRuntimeState();
    const timestamp = Number.isFinite(savedAt.getTime())
      ? savedAt.toISOString()
      : '';
    return captureRuntimeSave(
      {
        mapId: setup.map.id,
        playerWorldPosition: player.worldPosition,
        playerFacing: player.facing,
        farmDay: farming.farmDay,
        inventory: farming.inventory,
      },
      timestamp,
      {
        maps: [setup.map],
        items: setup.stateOwner.itemDefinitions,
        crops: setup.crops,
      },
    );
  }

  /** Validates first, then commits the complete runtime restore plan. */
  public restoreSnapshot(save: SaveData): RestoreSnapshotResult {
    const setup = this.getSetup();
    if (setup === null) {
      this.warnMissingSetupOnce();
      return {
        status: 'setup_missing',
        message: 'runtime save bridge is missing validated game data or owners',
      };
    }

    this.didWarnMissingSetup = false;
    const prepared = prepareRuntimeRestore(
      save,
      setup.map.id,
      {
        maps: [setup.map],
        items: setup.stateOwner.itemDefinitions,
        crops: setup.crops,
      },
    );
    if (prepared.status !== 'ready') {
      return prepared;
    }

    const farmingRestored = setup.stateOwner.restoreRuntimeState({
      farmDay: prepared.plan.farmDay,
      inventory: prepared.plan.inventory,
    });
    if (!farmingRestored) {
      return {
        status: 'apply_failed',
        message: 'validated farming state did not match the active runtime map',
      };
    }
    setup.player.restoreRuntimeState({
      worldPosition: prepared.plan.playerWorldPosition,
      facing: prepared.plan.playerFacing,
    });
    return { status: 'restored' };
  }

  protected override onDisable(): void {
    this.didWarnMissingSetup = false;
  }

  private getSetup(): RuntimeSaveSetup | null {
    const player = this.getComponent(PlayerController);
    const stateOwner = this.getComponent(TiledTillingController);
    const map = stateOwner?.currentMapDefinition ?? null;
    const cropsFile = decodeCropsData(this.cropsData?.json);
    if (
      player === null ||
      stateOwner === null ||
      map === null ||
      stateOwner.itemDefinitions.length === 0 ||
      cropsFile === null
    ) {
      return null;
    }

    return {
      player,
      stateOwner,
      map,
      crops: cropsFile.crops,
    };
  }

  private warnMissingSetupOnce(): void {
    if (this.didWarnMissingSetup) {
      return;
    }
    this.didWarnMissingSetup = true;
    warn(
      '[RuntimeSaveBridge] Assign crops.json and keep the existing runtime state owners valid.',
    );
  }
}
