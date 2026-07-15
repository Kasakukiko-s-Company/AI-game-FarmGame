import type { TileCoordinate } from '../world/TileInteraction';

/** Persistable MVP state for a tile that has entered the farming system. */
export interface FarmTileState {
  readonly x: number;
  readonly y: number;
  readonly isTilled: true;
  readonly wateredOnDay: null;
  readonly crop: null;
}

/** Authoritative farming state; ordinary untouched ground is absent from tiles. */
export interface FarmState {
  readonly mapId: string;
  readonly tiles: ReadonlyArray<FarmTileState>;
}

export type TileFarmabilityQuery = (tile: TileCoordinate | null) => boolean;

export interface TillTileResult {
  readonly status: 'tilled' | 'already_tilled' | 'not_farmable';
  readonly farm: FarmState;
}

/** Returns new farming state after tilling one valid empty tile. */
export function tillTile(
  farm: FarmState,
  target: TileCoordinate | null,
  isFarmable: TileFarmabilityQuery,
): TillTileResult {
  if (target === null || !isFarmable(target)) {
    return { status: 'not_farmable', farm };
  }

  const isAlreadyTilled = farm.tiles.some(
    (tile) => tile.x === target.x && tile.y === target.y,
  );
  if (isAlreadyTilled) {
    return { status: 'already_tilled', farm };
  }

  return {
    status: 'tilled',
    farm: {
      ...farm,
      tiles: [
        ...farm.tiles,
        {
          x: target.x,
          y: target.y,
          isTilled: true,
          wateredOnDay: null,
          crop: null,
        },
      ],
    },
  };
}
