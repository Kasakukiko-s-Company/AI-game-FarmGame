import type { MapDefinition } from '../data/GameDataTypes';
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

export interface TiledGridGeometry {
  readonly width: number;
  readonly height: number;
  readonly tileWidth: number;
  readonly tileHeight: number;
}

export type TiledBlockingQuery = (tileX: number, tiledRow: number) => boolean;

/** Combines JSON farm bounds with a Tiled top-down blocking-layer query. */
export function createTiledFarmabilityMap(
  definition: MapDefinition,
  geometry: TiledGridGeometry,
  isBlockingTile: TiledBlockingQuery,
): TileFarmabilityMap | null {
  if (
    geometry.width !== definition.widthTiles ||
    geometry.height !== definition.heightTiles ||
    geometry.tileWidth !== definition.tileSizePixels ||
    geometry.tileHeight !== definition.tileSizePixels
  ) {
    return null;
  }

  return {
    width: geometry.width,
    height: geometry.height,
    farmableArea: definition.farmableArea,
    isBlocked: (tileX, tileY) => isBlockingTile(
      tileX,
      geometry.height - 1 - tileY,
    ),
  };
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
