import type { FarmDayState } from '../../farming/FarmDayCycle';
import type { FarmState } from '../../farming/FarmState';
import type { InventoryState } from '../../inventory/InventoryState';
import type { FacingDirection } from '../../player/PlayerMovement';
import {
  decodeSavePayload,
  type SaveValidationCatalog,
} from './SaveCodec';
import {
  CURRENT_SAVE_VERSION,
  type SaveData,
  type Vector2Data,
} from './SaveData';

/** One detached view of the authoritative runtime state needed by save version one. */
export interface RuntimeSaveSource {
  readonly mapId: string;
  readonly playerWorldPosition: Vector2Data;
  readonly playerFacing: FacingDirection;
  readonly farmDay: FarmDayState;
  readonly inventory: InventoryState;
}

/** Fully validated state that a Cocos adapter can commit without parsing JSON. */
export interface RuntimeRestorePlan {
  readonly mapId: string;
  readonly playerWorldPosition: Vector2Data;
  readonly playerFacing: FacingDirection;
  readonly farmDay: FarmDayState;
  readonly inventory: InventoryState;
}

export type CaptureRuntimeSaveResult =
  | { readonly status: 'captured'; readonly save: SaveData }
  | { readonly status: 'invalid_runtime'; readonly message: string };

export type PrepareRuntimeRestoreResult =
  | { readonly status: 'ready'; readonly plan: RuntimeRestorePlan }
  | {
      readonly status: 'invalid_save';
      readonly reason: 'invalid_json' | 'invalid_data' | 'unsupported_version';
      readonly message: string;
    }
  | {
      readonly status: 'map_mismatch';
      readonly activeMapId: string;
      readonly savedMapId: string;
    };

function cloneFarm(farm: FarmState): FarmState {
  return {
    mapId: farm.mapId,
    tiles: farm.tiles.map((tile) => ({
      x: tile.x,
      y: tile.y,
      isTilled: true,
      wateredOnDay: tile.wateredOnDay,
      crop: tile.crop === null
        ? null
        : {
            cropId: tile.crop.cropId,
            plantedOnDay: tile.crop.plantedOnDay,
            growthProgress: tile.crop.growthProgress,
            stageIndex: tile.crop.stageIndex,
            lastGrowthDay: tile.crop.lastGrowthDay,
          },
    })),
  };
}

function cloneInventory(inventory: InventoryState): InventoryState {
  return {
    selectedSlotIndex: inventory.selectedSlotIndex,
    slots: inventory.slots.map((slot) => slot === null
      ? null
      : { itemId: slot.itemId, quantity: slot.quantity }),
  };
}

function serializeForValidation(value: unknown): string | null {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

/**
 * Captures a detached version-one snapshot and validates it through the same
 * decoder used for untrusted platform payloads.
 */
export function captureRuntimeSave(
  source: RuntimeSaveSource,
  savedAt: string,
  validation: SaveValidationCatalog,
): CaptureRuntimeSaveResult {
  const candidate: SaveData = {
    saveVersion: CURRENT_SAVE_VERSION,
    savedAt,
    player: {
      mapId: source.mapId,
      worldPosition: {
        x: source.playerWorldPosition.x,
        y: source.playerWorldPosition.y,
      },
      facing: source.playerFacing,
    },
    currentDay: source.farmDay.currentDay,
    inventory: cloneInventory(source.inventory),
    farm: cloneFarm(source.farmDay.farm),
  };
  const payload = serializeForValidation(candidate);
  if (payload === null) {
    return {
      status: 'invalid_runtime',
      message: 'runtime snapshot is not JSON serializable',
    };
  }

  const decoded = decodeSavePayload(payload, validation);
  if (decoded.status !== 'decoded') {
    return {
      status: 'invalid_runtime',
      message: decoded.message,
    };
  }
  return { status: 'captured', save: decoded.save };
}

/**
 * Validates a snapshot and returns one detached restore plan. No runtime owner
 * is mutated until the caller has received a `ready` result.
 */
export function prepareRuntimeRestore(
  save: SaveData,
  activeMapId: string,
  validation: SaveValidationCatalog,
): PrepareRuntimeRestoreResult {
  const payload = serializeForValidation(save);
  if (payload === null) {
    return {
      status: 'invalid_save',
      reason: 'invalid_data',
      message: 'save snapshot is not JSON serializable',
    };
  }

  const decoded = decodeSavePayload(payload, validation);
  if (decoded.status !== 'decoded') {
    return {
      status: 'invalid_save',
      reason: decoded.status,
      message: decoded.message,
    };
  }
  if (decoded.save.player.mapId !== activeMapId) {
    return {
      status: 'map_mismatch',
      activeMapId,
      savedMapId: decoded.save.player.mapId,
    };
  }

  return {
    status: 'ready',
    plan: {
      mapId: decoded.save.player.mapId,
      playerWorldPosition: {
        x: decoded.save.player.worldPosition.x,
        y: decoded.save.player.worldPosition.y,
      },
      playerFacing: decoded.save.player.facing,
      farmDay: {
        currentDay: decoded.save.currentDay,
        farm: cloneFarm(decoded.save.farm),
      },
      inventory: cloneInventory(decoded.save.inventory),
    },
  };
}
