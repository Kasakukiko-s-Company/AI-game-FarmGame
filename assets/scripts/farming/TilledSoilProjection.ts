import type { TileGridGeometry } from '../world/TileInteraction';
import type { TileRectangleData } from '../data/GameDataTypes';
import type { FarmState } from './FarmState';

/** One tilled tile expressed as a rectangle in TiledMap-local coordinates. */
export interface TilledSoilPatch {
  readonly tileX: number;
  readonly tileY: number;
  readonly left: number;
  readonly bottom: number;
  readonly width: number;
  readonly height: number;
}

function createPatch(
  tileX: number,
  tileY: number,
  grid: TileGridGeometry,
): TilledSoilPatch {
  return {
    tileX,
    tileY,
    left: grid.origin.x + tileX * grid.tileWidth,
    bottom: grid.origin.y + tileY * grid.tileHeight,
    width: grid.tileWidth,
    height: grid.tileHeight,
  };
}

/** Projects the inclusive configured farmable rectangle into map-local patches. */
export function createFarmableGroundPatches(
  area: TileRectangleData,
  grid: TileGridGeometry,
): ReadonlyArray<TilledSoilPatch> {
  if (
    !Number.isInteger(area.min.x) || !Number.isInteger(area.min.y) ||
    !Number.isInteger(area.max.x) || !Number.isInteger(area.max.y) ||
    area.min.x > area.max.x || area.min.y > area.max.y
  ) {
    return [];
  }

  const minX = Math.max(0, area.min.x);
  const minY = Math.max(0, area.min.y);
  const maxX = Math.min(grid.width - 1, area.max.x);
  const maxY = Math.min(grid.height - 1, area.max.y);
  const patches: TilledSoilPatch[] = [];

  for (let tileY = minY; tileY <= maxY; tileY += 1) {
    for (let tileX = minX; tileX <= maxX; tileX += 1) {
      patches.push(createPatch(tileX, tileY, grid));
    }
  }

  return patches;
}

/** Projects authoritative farming state into render-only map-local patches. */
export function createTilledSoilPatches(
  farm: FarmState,
  grid: TileGridGeometry,
): ReadonlyArray<TilledSoilPatch> {
  const patches: TilledSoilPatch[] = [];

  for (const tile of farm.tiles) {
    if (
      !tile.isTilled ||
      !Number.isInteger(tile.x) || !Number.isInteger(tile.y) ||
      tile.x < 0 || tile.x >= grid.width ||
      tile.y < 0 || tile.y >= grid.height
    ) {
      continue;
    }

    patches.push(createPatch(tile.x, tile.y, grid));
  }

  return patches;
}
