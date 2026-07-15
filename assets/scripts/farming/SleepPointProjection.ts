import type { TileGridGeometry } from '../world/TileInteraction';
import type { TilePointData } from '../data/GameDataTypes';

/** Render-only rectangle for the configured outdoor sleep interaction point. */
export interface SleepPointPatch {
  readonly tileX: number;
  readonly tileY: number;
  readonly left: number;
  readonly bottom: number;
  readonly width: number;
  readonly height: number;
}

/** Projects one valid sleep tile into TiledMap-local coordinates. */
export function createSleepPointPatch(
  tile: TilePointData,
  grid: TileGridGeometry,
): SleepPointPatch | null {
  if (
    !Number.isInteger(tile.x) || !Number.isInteger(tile.y) ||
    tile.x < 0 || tile.x >= grid.width ||
    tile.y < 0 || tile.y >= grid.height
  ) {
    return null;
  }

  return {
    tileX: tile.x,
    tileY: tile.y,
    left: grid.origin.x + tile.x * grid.tileWidth,
    bottom: grid.origin.y + tile.y * grid.tileHeight,
    width: grid.tileWidth,
    height: grid.tileHeight,
  };
}
