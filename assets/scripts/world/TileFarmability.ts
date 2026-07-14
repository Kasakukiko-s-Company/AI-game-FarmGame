import type { TileCoordinate } from './TileInteraction';

export interface TileRectangle {
  readonly min: TileCoordinate;
  readonly max: TileCoordinate;
}

/** Finite tile map data required to answer whether a tile can be farmed. */
export interface TileFarmabilityMap {
  readonly width: number;
  readonly height: number;
  readonly farmableArea: TileRectangle;
  isBlocked(tileX: number, tileY: number): boolean;
}

/** Returns whether a target tile is inside the configured area and not blocked. */
export function isTileFarmable(
  tile: TileCoordinate | null,
  map: TileFarmabilityMap,
): boolean {
  if (tile === null) {
    return false;
  }

  if (
    !Number.isInteger(tile.x) || !Number.isInteger(tile.y) ||
    tile.x < 0 || tile.x >= map.width ||
    tile.y < 0 || tile.y >= map.height
  ) {
    return false;
  }

  return tile.x >= map.farmableArea.min.x &&
    tile.x <= map.farmableArea.max.x &&
    tile.y >= map.farmableArea.min.y &&
    tile.y <= map.farmableArea.max.y &&
    !map.isBlocked(tile.x, tile.y);
}
