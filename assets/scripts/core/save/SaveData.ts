export const CURRENT_SAVE_VERSION = 1;
export const MVP_SAVE_SLOT_ID = 'autosave';

export type FacingDirection = 'up' | 'down' | 'left' | 'right';

export interface Vector2Data {
  readonly x: number;
  readonly y: number;
}

export interface PlayerSaveData {
  readonly mapId: string;
  readonly position: Vector2Data;
  readonly facing: FacingDirection;
}

export interface ClockSaveData {
  readonly currentDay: number;
  readonly timeOfDay: number;
}

export interface InventorySlotSaveData {
  readonly itemId: string;
  readonly quantity: number;
}

export interface InventorySaveData {
  readonly capacity: number;
  readonly selectedSlot: number;
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
  readonly isTilled: boolean;
  readonly wateredOnDay: number | null;
  readonly crop: CropSaveData | null;
}

export interface FarmSaveData {
  readonly mapId: string;
  readonly tiles: ReadonlyArray<FarmTileSaveData>;
}

export interface SettingsSaveData {
  readonly musicVolume: number;
  readonly soundVolume: number;
  readonly muted: boolean;
}

export interface SaveData {
  readonly saveVersion: number;
  readonly savedAt: string;
  readonly player: PlayerSaveData;
  readonly clock: ClockSaveData;
  readonly inventory: InventorySaveData;
  readonly farm: FarmSaveData;
  readonly settings: SettingsSaveData;
}

export interface NewSaveDataOptions {
  readonly savedAt: string;
  readonly mapId: string;
  readonly playerPosition: Vector2Data;
  readonly inventoryCapacity?: number;
}

/** Creates domain state only; persistence and current time are injected by callers. */
export function createNewSaveData(options: NewSaveDataOptions): SaveData {
  const inventoryCapacity = options.inventoryCapacity ?? 12;

  if (!Number.isInteger(inventoryCapacity) || inventoryCapacity <= 0) {
    throw new Error('inventoryCapacity must be a positive integer');
  }

  return {
    saveVersion: CURRENT_SAVE_VERSION,
    savedAt: options.savedAt,
    player: {
      mapId: options.mapId,
      position: options.playerPosition,
      facing: 'down',
    },
    clock: {
      currentDay: 1,
      timeOfDay: 480,
    },
    inventory: {
      capacity: inventoryCapacity,
      selectedSlot: 0,
      slots: Array.from({ length: inventoryCapacity }, () => null),
    },
    farm: {
      mapId: options.mapId,
      tiles: [],
    },
    settings: {
      musicVolume: 1,
      soundVolume: 1,
      muted: false,
    },
  };
}
