import type { TileGridGeometry } from '../world/TileInteraction';
import type { FarmDayState } from './FarmDayCycle';
import type { TilledSoilPatch } from './TilledSoilProjection';

/** Projects tiles watered today into the existing map-local soil rectangles. */
export function createWateredSoilPatches(
  state: FarmDayState,
  grid: TileGridGeometry,
): ReadonlyArray<TilledSoilPatch> {
  if (!Number.isInteger(state.currentDay) || state.currentDay <= 0) {
    return [];
  }

  const patches: TilledSoilPatch[] = [];
  for (const tile of state.farm.tiles) {
    if (
      tile.wateredOnDay !== state.currentDay ||
      !Number.isInteger(tile.x) || !Number.isInteger(tile.y) ||
      tile.x < 0 || tile.x >= grid.width ||
      tile.y < 0 || tile.y >= grid.height
    ) {
      continue;
    }

    patches.push({
      tileX: tile.x,
      tileY: tile.y,
      left: grid.origin.x + tile.x * grid.tileWidth,
      bottom: grid.origin.y + tile.y * grid.tileHeight,
      width: grid.tileWidth,
      height: grid.tileHeight,
    });
  }
  return patches;
}
