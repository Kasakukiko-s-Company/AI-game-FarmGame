import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { decodeCropsData } from '../../assets/scripts/data/CropDataDecoder.ts';

const CROPS_JSON_URL = new URL('../../assets/data/crops.json', import.meta.url);

test('decodes the real MVP crops.json document', async () => {
  const json: unknown = JSON.parse(await readFile(CROPS_JSON_URL, 'utf8'));
  const decoded = decodeCropsData(json);

  assert.notEqual(decoded, null);
  assert.equal(decoded?.schemaVersion, 1);
  assert.equal(decoded?.crops.length, 1);
  assert.equal(decoded?.crops[0]?.id, 'mistleaf');
  assert.equal(decoded?.crops[0]?.seedItemId, 'mistleaf_seed');
});

test('rejects malformed crop growth and unsupported schema versions', () => {
  assert.equal(decodeCropsData({ schemaVersion: 2, crops: [] }), null);
  assert.equal(
    decodeCropsData({
      schemaVersion: 1,
      crops: [{
        id: 'mistleaf',
        seedItemId: 'mistleaf_seed',
        harvestItemId: 'mistleaf_crop',
        growthStages: [1, 0],
        harvestQuantity: 1,
        requiresWater: true,
        allowedSeasons: ['all'],
      }],
    }),
    null,
  );
});

test('rejects ambiguous duplicate crop and seed identifiers', () => {
  const crop = {
    id: 'mistleaf',
    seedItemId: 'mistleaf_seed',
    harvestItemId: 'mistleaf_crop',
    growthStages: [1, 2],
    harvestQuantity: 1,
    requiresWater: true,
    allowedSeasons: ['all'],
  } as const;

  assert.equal(
    decodeCropsData({ schemaVersion: 1, crops: [crop, { ...crop }] }),
    null,
  );
  assert.equal(
    decodeCropsData({
      schemaVersion: 1,
      crops: [crop, { ...crop, id: 'another_crop' }],
    }),
    null,
  );
});
