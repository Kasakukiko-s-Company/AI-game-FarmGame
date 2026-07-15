import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import type { MapsDataFile } from '../../assets/scripts/data/GameDataTypes.ts';
import {
  createTiledFarmabilityMap,
  isTileFarmable,
} from '../../assets/scripts/world/TileFarmability.ts';

const MAPS_URL = new URL('../../assets/data/maps.json', import.meta.url);

test('adapts the configured farm area and top-down Blocking rows to bottom-origin tiles', async () => {
  const maps = JSON.parse(await readFile(MAPS_URL, 'utf8')) as MapsDataFile;
  const definition = maps.maps.find((map) => map.id === 'mvp_farm');
  assert.notEqual(definition, undefined);

  const farmability = createTiledFarmabilityMap(
    definition!,
    { width: 30, height: 30, tileWidth: 32, tileHeight: 32 },
    (tileX, tiledRow) => tileX === 9 && tiledRow === 19,
  );
  assert.notEqual(farmability, null);

  assert.deepEqual(
    {
      configuredCorner: isTileFarmable({ x: 5, y: 5 }, farmability!),
      configuredMaximum: isTileFarmable({ x: 14, y: 14 }, farmability!),
      outsideConfiguredArea: isTileFarmable({ x: 15, y: 14 }, farmability!),
      blockedBottomTile: isTileFarmable({ x: 9, y: 10 }, farmability!),
      neighborOfBlock: isTileFarmable({ x: 8, y: 10 }, farmability!),
    },
    {
      configuredCorner: true,
      configuredMaximum: true,
      outsideConfiguredArea: false,
      blockedBottomTile: false,
      neighborOfBlock: true,
    },
  );
});

test('rejects a Tiled map whose dimensions do not match the selected JSON map', async () => {
  const maps = JSON.parse(await readFile(MAPS_URL, 'utf8')) as MapsDataFile;
  const definition = maps.maps.find((map) => map.id === 'mvp_farm');
  assert.notEqual(definition, undefined);

  const wrongMapSize = createTiledFarmabilityMap(
    definition!,
    { width: 31, height: 30, tileWidth: 32, tileHeight: 32 },
    () => false,
  );
  const wrongTileSize = createTiledFarmabilityMap(
    definition!,
    { width: 30, height: 30, tileWidth: 16, tileHeight: 32 },
    () => false,
  );

  assert.deepEqual(
    { wrongMapSize, wrongTileSize },
    { wrongMapSize: null, wrongTileSize: null },
  );
});
