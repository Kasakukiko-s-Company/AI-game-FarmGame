import type { FacingDirection } from '../../player/PlayerMovement';

export type { FacingDirection } from '../../player/PlayerMovement';

export const CURRENT_SAVE_VERSION = 1 as const;
export const MVP_SAVE_SLOT_ID = 'autosave';

export interface Vector2Data {
  readonly x: number;
  readonly y: number;
}

export interface PlayerSaveData {
  readonly mapId: string;
  readonly worldPosition: Vector2Data;
  readonly facing: FacingDirection;
}

export interface InventorySlotSaveData {
  readonly itemId: string;
  readonly quantity: number;
}

export interface InventorySaveData {
  readonly selectedSlotIndex: number;
  readonly slots: ReadonlyArray<InventorySlotSaveData | null>;
}

export interface CropSaveData {
  readonly cropId: string;
  readonly plantedOnDay: number;
  readonly growthProgress: number;
  readonly stageIndex: number;
  readonly lastGrowthDay: number;
}

export interface FarmTileSaveData {
  readonly x: number;
  readonly y: number;
  readonly isTilled: true;
  readonly wateredOnDay: number | null;
  readonly crop: CropSaveData | null;
}

export interface FarmSaveData {
  readonly mapId: string;
  readonly tiles: ReadonlyArray<FarmTileSaveData>;
}

/**
 * Version-one MVP snapshot. It contains only authoritative state that currently
 * exists in gameplay; platform storage and future migrations stay outside it.
 */
export interface SaveData {
  readonly saveVersion: typeof CURRENT_SAVE_VERSION;
  readonly savedAt: string;
  readonly player: PlayerSaveData;
  readonly currentDay: number;
  readonly inventory: InventorySaveData;
  readonly farm: FarmSaveData;
}
