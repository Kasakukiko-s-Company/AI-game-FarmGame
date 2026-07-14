import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const MAP_URL = new URL('../../assets/maps/mvp_farm.tmx', import.meta.url);
const TILE_URL = new URL('../../assets/maps/mvp_farm_ground.png', import.meta.url);
const STONE_URL = new URL('../../assets/maps/mvp_farm_stone.png', import.meta.url);

function readLayerGids(tmx: string, layerName: string): number[] {
  const layer = tmx.match(
    new RegExp(`<layer[^>]*name="${layerName}"[^>]*>[\\s\\S]*?<data encoding="csv">([\\s\\S]*?)<\\/data>`),
  );
  assert.ok(layer?.[1], `${layerName} CSV data must be present`);

  return layer[1]
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .map(Number);
}

test('keeps the stage 3 Tiled import smoke map on the fixed MVP baseline', async () => {
  const [tmx, png, stonePng] = await Promise.all([
    readFile(MAP_URL, 'utf8'),
    readFile(TILE_URL),
    readFile(STONE_URL),
  ]);

  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16), 32);
  assert.equal(png.readUInt32BE(20), 32);
  assert.equal(stonePng.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(stonePng.readUInt32BE(16), 32);
  assert.equal(stonePng.readUInt32BE(20), 32);

  assert.match(
    tmx,
    /<map[^>]*tiledversion="1\.12\.2"[^>]*orientation="orthogonal"[^>]*width="30"[^>]*height="30"[^>]*tilewidth="32"[^>]*tileheight="32"/,
  );
  assert.match(tmx, /<tileset[^>]*name="mvp_farm_tiles"[^>]*tilecount="1"/);
  assert.match(tmx, /<tileset firstgid="2" name="mvp_farm_stone"[^>]*tilecount="1"/);
  assert.match(
    tmx,
    /<image source="mvp_farm_ground\.png" width="32" height="32"\/>/,
  );
  assert.match(
    tmx,
    /<image source="mvp_farm_stone\.png" width="32" height="32"\/>/,
  );
  assert.match(tmx, /<layer[^>]*name="Ground"[^>]*width="30" height="30">/);
  assert.match(tmx, /<layer[^>]*name="Obstacles"[^>]*width="30" height="30">/);
  assert.match(tmx, /<layer[^>]*name="Blocking"[^>]*width="30" height="30"[^>]*visible="0">/);
  assert.match(tmx, /<data encoding="csv">/);
  assert.doesNotMatch(tmx, /compression=/);

  const ground = readLayerGids(tmx, 'Ground');
  const obstacles = readLayerGids(tmx, 'Obstacles');
  const blocking = readLayerGids(tmx, 'Blocking');
  assert.equal(ground.length, 30 * 30);
  assert.ok(ground.every((gid) => gid === 1));
  assert.deepEqual(blocking, obstacles);
  assert.equal(blocking.filter((gid) => gid === 2).length, 4);
  assert.equal(blocking.filter((gid) => gid === 0).length, 30 * 30 - 4);

  for (const row of [13, 14, 15, 16]) {
    assert.equal(blocking[row * 30 + 18], 2);
  }
});
