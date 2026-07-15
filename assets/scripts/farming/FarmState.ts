import type { TileCoordinate } from '../world/TileInteraction';

/** Persistable state for one planted crop; growth is settled by day number. */
export interface CropState {
  readonly cropId: string;
  readonly plantedOnDay: number;
  readonly growthProgress: number;
  readonly stageIndex: number;
  readonly lastGrowthDay: number;
}

/** Persistable MVP state for a tile that has entered the farming system. */
export interface FarmTileState {
  readonly x: number;
  readonly y: number;
  readonly isTilled: true;
  readonly wateredOnDay: number | null;
  readonly crop: CropState | null;
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

/** Runtime farming state plus the semantic action button latch. */
export interface TillingSession {
  readonly farm: FarmState;
  readonly primaryActionHeld: boolean;
}

export interface TillingUpdateResult {
  readonly status: 'idle' | TillTileResult['status'];
  readonly session: TillingSession;
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

/** Applies one frame of semantic primary-action input to the farming session. */
export function updateTillingSession(
  session: TillingSession,
  primaryActionPressed: boolean,
  target: TileCoordinate | null,
  isFarmable: TileFarmabilityQuery,
): TillingUpdateResult {
  if (!primaryActionPressed) {
    return {
      status: 'idle',
      session: {
        ...session,
        primaryActionHeld: false,
      },
    };
  }

  if (session.primaryActionHeld) {
    return { status: 'idle', session };
  }

  const tilling = tillTile(session.farm, target, isFarmable);
  return {
    status: tilling.status,
    session: {
      farm: tilling.farm,
      primaryActionHeld: true,
    },
  };
}
