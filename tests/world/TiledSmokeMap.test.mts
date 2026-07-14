import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const MAP_URL = new URL('../../assets/maps/mvp_farm.tmx', import.meta.url);
const TILE_URL = new URL('../../assets/maps/mvp_farm_ground.png', import.meta.url);

test('keeps the stage 3 Tiled import smoke map on the fixed MVP baseline', async () => {
  const [tmx, png] = await Promise.all([
    readFile(MAP_URL, 'utf8'),
    readFile(TILE_URL),
  ]);

  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16), 32);
  assert.equal(png.readUInt32BE(20), 32);

  assert.match(
    tmx,
    /<map[^>]*tiledversion="1\.12\.2"[^>]*orientation="orthogonal"[^>]*width="30"[^>]*height="30"[^>]*tilewidth="32"[^>]*tileheight="32"/,
  );
  assert.match(tmx, /<tileset[^>]*name="mvp_farm_tiles"[^>]*tilecount="1"/);
  assert.match(
    tmx,
    /<image source="mvp_farm_ground\.png" width="32" height="32"\/>/,
  );
  assert.match(tmx, /<layer[^>]*name="Ground"[^>]*width="30" height="30">/);
  assert.match(tmx, /<data encoding="csv">/);
  assert.doesNotMatch(tmx, /compression=/);

  const csv = tmx.match(/<data encoding="csv">([\s\S]*?)<\/data>/)?.[1];
  assert.ok(csv, 'Ground CSV data must be present');
  const gids = csv
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .map(Number);

  assert.equal(gids.length, 30 * 30);
  assert.ok(gids.every((gid) => gid === 1));
});
