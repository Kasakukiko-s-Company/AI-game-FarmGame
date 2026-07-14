import type { FacingDirection } from '../player/PlayerMovement';

export interface WorldPoint {
  readonly x: number;
  readonly y: number;
}

export interface TileCoordinate {
  readonly x: number;
  readonly y: number;
}

/** Finite bottom-left-origin tile grid shared by interaction rules. */
export interface TileGridGeometry {
  readonly width: number;
  readonly height: number;
  readonly tileWidth: number;
  readonly tileHeight: number;
  readonly origin: WorldPoint;
}

/** Converts a world position to a tile, returning null instead of clamping outside the map. */
export function worldToTile(
  point: WorldPoint,
  grid: TileGridGeometry,
): TileCoordinate | null {
  const tileX = Math.floor((point.x - grid.origin.x) / grid.tileWidth);
  const tileY = Math.floor((point.y - grid.origin.y) / grid.tileHeight);
  if (tileX < 0 || tileX >= grid.width || tileY < 0 || tileY >= grid.height) {
    return null;
  }

  return { x: tileX, y: tileY };
}

/** Converts an in-bounds integer tile to its world-space center. */
export function tileToWorldCenter(
  tile: TileCoordinate,
  grid: TileGridGeometry,
): WorldPoint | null {
  if (
    !Number.isInteger(tile.x) || !Number.isInteger(tile.y) ||
    tile.x < 0 || tile.x >= grid.width || tile.y < 0 || tile.y >= grid.height
  ) {
    return null;
  }

  return {
    x: grid.origin.x + (tile.x + 0.5) * grid.tileWidth,
    y: grid.origin.y + (tile.y + 0.5) * grid.tileHeight,
  };
}

/** Selects the one-tile interaction target directly in front of the player. */
export function getFacingTile(
  playerPosition: WorldPoint,
  facing: FacingDirection,
  grid: TileGridGeometry,
): TileCoordinate | null {
  const playerTile = worldToTile(playerPosition, grid);
  if (playerTile === null) {
    return null;
  }

  let targetX = playerTile.x;
  let targetY = playerTile.y;
  switch (facing) {
    case 'up':
      targetY += 1;
      break;
    case 'down':
      targetY -= 1;
      break;
    case 'left':
      targetX -= 1;
      break;
    case 'right':
      targetX += 1;
      break;
  }

  const target = { x: targetX, y: targetY };
  return tileToWorldCenter(target, grid) === null ? null : target;
}
