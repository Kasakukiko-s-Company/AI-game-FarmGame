import assert from 'node:assert/strict';
import test from 'node:test';
import {
  tillTile,
  type FarmState,
} from '../../assets/scripts/farming/FarmState.ts';
import {
  isTileFarmable,
  type TileFarmabilityMap,
} from '../../assets/scripts/world/TileFarmability.ts';

const FARM_MAP: TileFarmabilityMap = {
  width: 30,
  height: 30,
  farmableArea: {
    min: { x: 5, y: 5 },
    max: { x: 14, y: 14 },
  },
  isBlocked: () => false,
};

const EMPTY_FARM: FarmState = {
  mapId: 'mvp_farm',
  tiles: [],
};

const queryFarmability = (tile: { readonly x: number; readonly y: number } | null): boolean =>
  isTileFarmable(tile, FARM_MAP);

test('tills one farmable empty tile without mutating the source farm', () => {
  const result = tillTile(EMPTY_FARM, { x: 5, y: 5 }, queryFarmability);

  assert.deepEqual(
    { result, source: EMPTY_FARM },
    {
      result: {
        status: 'tilled',
        farm: {
          mapId: 'mvp_farm',
          tiles: [
            {
              x: 5,
              y: 5,
              isTilled: true,
              wateredOnDay: null,
              crop: null,
            },
          ],
        },
      },
      source: {
        mapId: 'mvp_farm',
        tiles: [],
      },
    },
  );
});

test('keeps the farm unchanged when the same tile is tilled again', () => {
  const first = tillTile(EMPTY_FARM, { x: 6, y: 7 }, queryFarmability);
  const repeated = tillTile(first.farm, { x: 6, y: 7 }, queryFarmability);

  assert.deepEqual(
    { status: repeated.status, tiles: repeated.farm.tiles },
    {
      status: 'already_tilled',
      tiles: [
        {
          x: 6,
          y: 7,
          isTilled: true,
          wateredOnDay: null,
          crop: null,
        },
      ],
    },
  );
});

test('rejects missing, blocked, and out-of-area targets without changing the farm', () => {
  const blockedMap: TileFarmabilityMap = {
    ...FARM_MAP,
    isBlocked: (tileX, tileY) => tileX === 9 && tileY === 10,
  };
  const queryBlockedMap = (
    tile: { readonly x: number; readonly y: number } | null,
  ): boolean => isTileFarmable(tile, blockedMap);

  const results = [
    tillTile(EMPTY_FARM, null, queryBlockedMap),
    tillTile(EMPTY_FARM, { x: 4, y: 5 }, queryBlockedMap),
    tillTile(EMPTY_FARM, { x: 9, y: 10 }, queryBlockedMap),
    tillTile(EMPTY_FARM, { x: 30, y: 0 }, queryBlockedMap),
  ];

  assert.deepEqual(
    {
      statuses: results.map((result) => result.status),
      farms: results.map((result) => result.farm),
    },
    {
      statuses: [
        'not_farmable',
        'not_farmable',
        'not_farmable',
        'not_farmable',
      ],
      farms: [EMPTY_FARM, EMPTY_FARM, EMPTY_FARM, EMPTY_FARM],
    },
  );
});
