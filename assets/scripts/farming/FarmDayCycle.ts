import type { CropDefinition } from '../data/GameDataTypes';
import type { TileCoordinate } from '../world/TileInteraction';
import type { FarmState } from './FarmState';

/** Authoritative day number paired with the farming state settled for that day. */
export interface FarmDayState {
  readonly currentDay: number;
  readonly farm: FarmState;
}

export type WaterTileStatus = 'watered' | 'already_watered' | 'not_tilled';

export interface WaterTileResult {
  readonly status: WaterTileStatus;
  readonly state: FarmDayState;
}

export type AdvanceFarmDayStatus = 'advanced' | 'invalid_crop';

export interface AdvanceFarmDayResult {
  readonly status: AdvanceFarmDayStatus;
  readonly state: FarmDayState;
}

export type SleepAtTileStatus =
  | 'slept'
  | 'not_at_sleep_point'
  | 'invalid_crop';

export interface SleepAtTileResult {
  readonly status: SleepAtTileStatus;
  readonly state: FarmDayState;
}

function findGrowthStageIndex(
  growthProgress: number,
  growthStages: ReadonlyArray<number>,
): number {
  let stageEndDay = 0;
  for (let stageIndex = 0; stageIndex < growthStages.length; stageIndex += 1) {
    stageEndDay += growthStages[stageIndex] ?? 0;
    if (growthProgress < stageEndDay) {
      return stageIndex;
    }
  }
  return Math.max(0, growthStages.length - 1);
}

function assertValidCurrentDay(currentDay: number): void {
  if (!Number.isInteger(currentDay) || currentDay <= 0) {
    throw new RangeError('currentDay must be a positive integer');
  }
}

/** Waters one tilled tile for the current day without mutating source state. */
export function waterTile(
  state: FarmDayState,
  target: TileCoordinate | null,
): WaterTileResult {
  assertValidCurrentDay(state.currentDay);
  const tileIndex = target === null
    ? -1
    : state.farm.tiles.findIndex(
      (tile) => tile.x === target.x && tile.y === target.y,
    );
  if (tileIndex < 0) {
    return { status: 'not_tilled', state };
  }

  const tile = state.farm.tiles[tileIndex];
  if (tile === undefined) {
    return { status: 'not_tilled', state };
  }
  if (tile.wateredOnDay === state.currentDay) {
    return { status: 'already_watered', state };
  }
  return {
    status: 'watered',
    state: {
      ...state,
      farm: {
        ...state.farm,
        tiles: state.farm.tiles.map((candidate, index) =>
          index === tileIndex
            ? { ...candidate, wateredOnDay: state.currentDay }
            : candidate),
      },
    },
  };
}

/** Settles crop growth for the current day and advances exactly one day. */
export function advanceFarmDay(
  state: FarmDayState,
  crops: ReadonlyArray<CropDefinition>,
): AdvanceFarmDayResult {
  assertValidCurrentDay(state.currentDay);
  const definitions = new Map(crops.map((crop) => [crop.id, crop]));
  const hasUnknownCrop = state.farm.tiles.some(
    (tile) => tile.crop !== null && !definitions.has(tile.crop.cropId),
  );
  if (hasUnknownCrop) {
    return { status: 'invalid_crop', state };
  }

  const tiles = state.farm.tiles.map((tile) => {
    const crop = tile.crop;
    if (crop === null || crop.lastGrowthDay >= state.currentDay) {
      return tile;
    }

    const definition = definitions.get(crop.cropId);
    if (definition === undefined) {
      return tile;
    }
    if (definition.requiresWater && tile.wateredOnDay !== state.currentDay) {
      return {
        ...tile,
        crop: {
          ...crop,
          lastGrowthDay: state.currentDay,
        },
      };
    }

    const maximumGrowth = definition.growthStages.reduce(
      (total, stageDays) => total + stageDays,
      0,
    );
    const growthProgress = Math.min(crop.growthProgress + 1, maximumGrowth);
    return {
      ...tile,
      crop: {
        ...crop,
        growthProgress,
        stageIndex: findGrowthStageIndex(growthProgress, definition.growthStages),
        lastGrowthDay: state.currentDay,
      },
    };
  });

  return {
    status: 'advanced',
    state: {
      currentDay: state.currentDay + 1,
      farm: {
        ...state.farm,
        tiles,
      },
    },
  };
}

/** Confirms sleep at the configured interaction tile and settles exactly one day. */
export function sleepAtTile(
  state: FarmDayState,
  target: TileCoordinate | null,
  sleepTile: TileCoordinate,
  crops: ReadonlyArray<CropDefinition>,
): SleepAtTileResult {
  assertValidCurrentDay(state.currentDay);
  if (
    target === null ||
    target.x !== sleepTile.x ||
    target.y !== sleepTile.y
  ) {
    return { status: 'not_at_sleep_point', state };
  }

  const result = advanceFarmDay(state, crops);
  if (result.status === 'invalid_crop') {
    return { status: 'invalid_crop', state };
  }

  return { status: 'slept', state: result.state };
}
