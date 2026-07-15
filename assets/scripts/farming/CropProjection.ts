import type { TileGridGeometry } from '../world/TileInteraction';
import type { FarmState } from './FarmState';

/** One planted crop expressed in TiledMap-local render coordinates. */
export interface CropPatch {
  readonly tileX: number;
  readonly tileY: number;
  readonly centerX: number;
  readonly bottom: number;
  readonly width: number;
  readonly height: number;
  readonly cropId: string;
  readonly stageIndex: number;
}

/** Projects valid planted state without mutating or repairing the farm model. */
export function createCropPatches(
  farm: FarmState,
  grid: TileGridGeometry,
): ReadonlyArray<CropPatch> {
  const patches: CropPatch[] = [];

  for (const tile of farm.tiles) {
    const crop = tile.crop;
    if (
      crop === null ||
      crop.cropId.trim().length === 0 ||
      !Number.isInteger(crop.stageIndex) || crop.stageIndex < 0 ||
      !Number.isInteger(tile.x) || !Number.isInteger(tile.y) ||
      tile.x < 0 || tile.x >= grid.width ||
      tile.y < 0 || tile.y >= grid.height
    ) {
      continue;
    }

    patches.push({
      tileX: tile.x,
      tileY: tile.y,
      centerX: grid.origin.x + (tile.x + 0.5) * grid.tileWidth,
      bottom: grid.origin.y + tile.y * grid.tileHeight,
      width: grid.tileWidth,
      height: grid.tileHeight,
      cropId: crop.cropId,
      stageIndex: crop.stageIndex,
    });
  }

  return patches;
}
