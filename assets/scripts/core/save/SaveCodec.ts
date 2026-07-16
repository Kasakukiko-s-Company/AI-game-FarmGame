import type {
  CropDefinition,
  ItemDefinition,
  MapDefinition,
} from '../../data/GameDataTypes';
import { calculateCropGrowthStage } from '../../farming/CropPlanting';
import { MVP_INVENTORY_CAPACITY } from '../../inventory/InventoryState';
import {
  CURRENT_SAVE_VERSION,
  type CropSaveData,
  type FarmSaveData,
  type FarmTileSaveData,
  type InventorySaveData,
  type InventorySlotSaveData,
  type PlayerSaveData,
  type SaveData,
} from './SaveData';

export interface SaveValidationCatalog {
  readonly maps: ReadonlyArray<MapDefinition>;
  readonly items: ReadonlyArray<ItemDefinition>;
  readonly crops: ReadonlyArray<CropDefinition>;
}

export type DecodeSavePayloadResult =
  | { readonly status: 'decoded'; readonly save: SaveData }
  | { readonly status: 'invalid_json'; readonly message: string }
  | {
      readonly status: 'unsupported_version';
      readonly saveVersion: number;
      readonly message: string;
    }
  | { readonly status: 'invalid_data'; readonly message: string };

interface ValidationCatalogs {
  readonly maps: ReadonlyMap<string, MapDefinition>;
  readonly items: ReadonlyMap<string, ItemDefinition>;
  readonly crops: ReadonlyMap<string, CropDefinition>;
}

type ReadonlyRecord = Readonly<Record<string, unknown>>;

function isRecord(value: unknown): value is ReadonlyRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}

function createUniqueCatalog<T extends { readonly id: string }>(
  values: ReadonlyArray<T>,
  label: string,
): ReadonlyMap<string, T> {
  const catalog = new Map<string, T>();
  for (const value of values) {
    if (!isNonEmptyString(value.id)) {
      throw new RangeError(`${label} ID must not be empty`);
    }
    if (catalog.has(value.id)) {
      throw new RangeError(`duplicate ${label} definition: ${value.id}`);
    }
    catalog.set(value.id, value);
  }
  return catalog;
}

function createValidationCatalogs(
  validation: SaveValidationCatalog,
): ValidationCatalogs {
  return {
    maps: createUniqueCatalog(validation.maps, 'map'),
    items: createUniqueCatalog(validation.items, 'item'),
    crops: createUniqueCatalog(validation.crops, 'crop'),
  };
}

function decodePlayer(
  value: unknown,
  catalogs: ValidationCatalogs,
): PlayerSaveData | null {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.mapId) ||
    !catalogs.maps.has(value.mapId) ||
    !isRecord(value.worldPosition) ||
    !isFiniteNumber(value.worldPosition.x) ||
    !isFiniteNumber(value.worldPosition.y) ||
    (
      value.facing !== 'up' &&
      value.facing !== 'down' &&
      value.facing !== 'left' &&
      value.facing !== 'right'
    )
  ) {
    return null;
  }

  return {
    mapId: value.mapId,
    worldPosition: {
      x: value.worldPosition.x,
      y: value.worldPosition.y,
    },
    facing: value.facing,
  };
}

function decodeInventory(
  value: unknown,
  catalogs: ValidationCatalogs,
): InventorySaveData | null {
  if (
    !isRecord(value) ||
    !Array.isArray(value.slots) ||
    value.slots.length !== MVP_INVENTORY_CAPACITY ||
    !isNonNegativeInteger(value.selectedSlotIndex) ||
    value.selectedSlotIndex >= value.slots.length
  ) {
    return null;
  }

  const slots: Array<InventorySlotSaveData | null> = [];
  for (const slot of value.slots) {
    if (slot === null) {
      slots.push(null);
      continue;
    }
    if (
      !isRecord(slot) ||
      !isNonEmptyString(slot.itemId) ||
      !isPositiveInteger(slot.quantity)
    ) {
      return null;
    }
    const definition = catalogs.items.get(slot.itemId);
    if (definition === undefined || slot.quantity > definition.maxStack) {
      return null;
    }
    slots.push({ itemId: slot.itemId, quantity: slot.quantity });
  }

  return {
    selectedSlotIndex: value.selectedSlotIndex,
    slots,
  };
}

function isTileInsideMap(
  x: number,
  y: number,
  map: MapDefinition,
): boolean {
  return x >= 0 && x < map.widthTiles && y >= 0 && y < map.heightTiles;
}

function isTileFarmable(
  x: number,
  y: number,
  map: MapDefinition,
): boolean {
  return x >= map.farmableArea.min.x &&
    x <= map.farmableArea.max.x &&
    y >= map.farmableArea.min.y &&
    y <= map.farmableArea.max.y;
}

function decodeCrop(
  value: unknown,
  currentDay: number,
  catalogs: ValidationCatalogs,
): CropSaveData | null {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.cropId) ||
    !isPositiveInteger(value.plantedOnDay) ||
    value.plantedOnDay > currentDay ||
    !isNonNegativeInteger(value.growthProgress) ||
    !isNonNegativeInteger(value.stageIndex) ||
    !isNonNegativeInteger(value.lastGrowthDay) ||
    value.lastGrowthDay < value.plantedOnDay - 1 ||
    value.lastGrowthDay > currentDay
  ) {
    return null;
  }

  const definition = catalogs.crops.get(value.cropId);
  if (definition === undefined) {
    return null;
  }
  const maximumGrowth = definition.growthStages.reduce(
    (total, stageDays) => total + stageDays,
    0,
  );
  const settledDays = value.lastGrowthDay - value.plantedOnDay + 1;
  if (
    value.growthProgress > maximumGrowth ||
    value.growthProgress > settledDays
  ) {
    return null;
  }
  const stage = calculateCropGrowthStage(
    value.growthProgress,
    definition.growthStages,
  );
  if (value.stageIndex !== stage.stageIndex) {
    return null;
  }

  return {
    cropId: value.cropId,
    plantedOnDay: value.plantedOnDay,
    growthProgress: value.growthProgress,
    stageIndex: value.stageIndex,
    lastGrowthDay: value.lastGrowthDay,
  };
}

function decodeFarm(
  value: unknown,
  player: PlayerSaveData,
  currentDay: number,
  catalogs: ValidationCatalogs,
): FarmSaveData | null {
  if (
    !isRecord(value) ||
    value.mapId !== player.mapId ||
    !Array.isArray(value.tiles)
  ) {
    return null;
  }
  const map = catalogs.maps.get(player.mapId);
  if (map === undefined) {
    return null;
  }

  const coordinates = new Set<string>();
  const tiles: FarmTileSaveData[] = [];
  for (const tile of value.tiles) {
    if (
      !isRecord(tile) ||
      !isNonNegativeInteger(tile.x) ||
      !isNonNegativeInteger(tile.y) ||
      tile.isTilled !== true ||
      !isTileInsideMap(tile.x, tile.y, map) ||
      !isTileFarmable(tile.x, tile.y, map) ||
      (
        tile.wateredOnDay !== null &&
        (
          !isPositiveInteger(tile.wateredOnDay) ||
          tile.wateredOnDay > currentDay
        )
      )
    ) {
      return null;
    }
    const coordinateKey = `${tile.x},${tile.y}`;
    if (coordinates.has(coordinateKey)) {
      return null;
    }
    coordinates.add(coordinateKey);

    const crop = tile.crop === null
      ? null
      : decodeCrop(tile.crop, currentDay, catalogs);
    if (tile.crop !== null && crop === null) {
      return null;
    }
    tiles.push({
      x: tile.x,
      y: tile.y,
      isTilled: true,
      wateredOnDay: tile.wateredOnDay,
      crop,
    });
  }

  return { mapId: player.mapId, tiles };
}

function decodeSaveValue(
  value: unknown,
  validation: SaveValidationCatalog,
): DecodeSavePayloadResult {
  if (!isRecord(value)) {
    return { status: 'invalid_data', message: 'save root must be an object' };
  }
  if (!Number.isInteger(value.saveVersion)) {
    return {
      status: 'invalid_data',
      message: 'saveVersion must be an integer',
    };
  }
  if (value.saveVersion !== CURRENT_SAVE_VERSION) {
    return {
      status: 'unsupported_version',
      saveVersion: Number(value.saveVersion),
      message: `unsupported saveVersion: ${String(value.saveVersion)}`,
    };
  }
  if (!isIsoTimestamp(value.savedAt) || !isPositiveInteger(value.currentDay)) {
    return {
      status: 'invalid_data',
      message: 'save metadata is invalid',
    };
  }

  const catalogs = createValidationCatalogs(validation);
  const player = decodePlayer(value.player, catalogs);
  const inventory = decodeInventory(value.inventory, catalogs);
  if (player === null || inventory === null) {
    return {
      status: 'invalid_data',
      message: 'player or inventory state is invalid',
    };
  }
  const farm = decodeFarm(value.farm, player, value.currentDay, catalogs);
  if (farm === null) {
    return {
      status: 'invalid_data',
      message: 'farm state is invalid',
    };
  }

  return {
    status: 'decoded',
    save: {
      saveVersion: CURRENT_SAVE_VERSION,
      savedAt: value.savedAt,
      player,
      currentDay: value.currentDay,
      inventory,
      farm,
    },
  };
}

/** Decodes untrusted platform payload without throwing for ordinary corruption. */
export function decodeSavePayload(
  payload: string,
  validation: SaveValidationCatalog,
): DecodeSavePayloadResult {
  let value: unknown;
  try {
    value = JSON.parse(payload) as unknown;
  } catch (error: unknown) {
    return {
      status: 'invalid_json',
      message: error instanceof Error ? error.message : 'invalid JSON payload',
    };
  }
  return decodeSaveValue(value, validation);
}

/** Encodes only snapshots that the same version-one decoder can restore. */
export function encodeSavePayload(
  save: SaveData,
  validation: SaveValidationCatalog,
): string {
  const payload = JSON.stringify(save);
  const decoded = decodeSavePayload(payload, validation);
  if (decoded.status !== 'decoded') {
    throw new RangeError(`cannot encode invalid save: ${decoded.message}`);
  }
  return payload;
}
