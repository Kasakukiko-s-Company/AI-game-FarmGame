import type { CropDefinition } from '../data/GameDataTypes';
import type { TileCoordinate } from '../world/TileInteraction';
import type { CropState, FarmState } from './FarmState';

/** Temporary single-item seed stock; the stage 8 inventory will provide this data. */
export interface SeedStack {
  readonly itemId: string;
  readonly quantity: number;
}

export type PlantCropStatus =
  | 'planted'
  | 'no_seed'
  | 'not_tilled'
  | 'occupied'
  | 'invalid_seed';

export interface PlantCropResult {
  readonly status: PlantCropStatus;
  readonly farm: FarmState;
  readonly seeds: SeedStack;
}

export interface CropGrowthStage {
  readonly stageIndex: number;
  readonly isMature: boolean;
}

function assertValidGrowthStages(growthStages: ReadonlyArray<number>): void {
  if (
    growthStages.length === 0 ||
    growthStages.some((days) => !Number.isInteger(days) || days <= 0)
  ) {
    throw new RangeError('growthStages must contain positive integers');
  }
}

/** Resolves cumulative configured growth days to a zero-based visual stage. */
export function calculateCropGrowthStage(
  growthProgress: number,
  growthStages: ReadonlyArray<number>,
): CropGrowthStage {
  if (!Number.isInteger(growthProgress) || growthProgress < 0) {
    throw new RangeError('growthProgress must be a non-negative integer');
  }
  assertValidGrowthStages(growthStages);

  let stageEndDay = 0;
  for (let stageIndex = 0; stageIndex < growthStages.length; stageIndex += 1) {
    stageEndDay += growthStages[stageIndex] ?? 0;
    if (growthProgress < stageEndDay) {
      return { stageIndex, isMature: false };
    }
  }

  return {
    stageIndex: growthStages.length - 1,
    isMature: true,
  };
}

/**
 * Plants one configured crop and returns immutable farm and seed states.
 * Invalid domain counters throw; ordinary rejected actions return a status.
 */
export function plantCrop(
  farm: FarmState,
  target: TileCoordinate | null,
  seeds: SeedStack,
  currentDay: number,
  crops: ReadonlyArray<CropDefinition>,
): PlantCropResult {
  if (!Number.isInteger(currentDay) || currentDay <= 0) {
    throw new RangeError('currentDay must be a positive integer');
  }
  if (!Number.isInteger(seeds.quantity) || seeds.quantity < 0) {
    throw new RangeError('seed quantity must be a non-negative integer');
  }

  const cropDefinition = crops.find((crop) => crop.seedItemId === seeds.itemId);
  if (cropDefinition === undefined) {
    return { status: 'invalid_seed', farm, seeds };
  }
  if (seeds.quantity === 0) {
    return { status: 'no_seed', farm, seeds };
  }

  const tileIndex = target === null
    ? -1
    : farm.tiles.findIndex((tile) => tile.x === target.x && tile.y === target.y);
  if (tileIndex < 0) {
    return { status: 'not_tilled', farm, seeds };
  }

  const tile = farm.tiles[tileIndex];
  if (tile === undefined) {
    return { status: 'not_tilled', farm, seeds };
  }
  if (tile.crop !== null) {
    return { status: 'occupied', farm, seeds };
  }

  const initialStage = calculateCropGrowthStage(0, cropDefinition.growthStages);
  const crop: CropState = {
    cropId: cropDefinition.id,
    plantedOnDay: currentDay,
    growthProgress: 0,
    stageIndex: initialStage.stageIndex,
    // No day has been settled yet; stage 7 may settle the planting day once.
    lastGrowthDay: currentDay - 1,
  };

  return {
    status: 'planted',
    farm: {
      ...farm,
      tiles: farm.tiles.map((candidate, index) =>
        index === tileIndex ? { ...candidate, crop } : candidate),
    },
    seeds: {
      ...seeds,
      quantity: seeds.quantity - 1,
    },
  };
}
