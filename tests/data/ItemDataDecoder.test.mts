import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { decodeItemsData } from '../../assets/scripts/data/ItemDataDecoder.ts';

const ITEMS_JSON_URL = new URL('../../assets/data/items.json', import.meta.url);

test('decodes the real MVP items.json document', async () => {
  const json: unknown = JSON.parse(await readFile(ITEMS_JSON_URL, 'utf8'));
  const decoded = decodeItemsData(json);

  assert.equal(decoded?.schemaVersion, 1);
  assert.deepEqual(decoded?.items.map((item) => item.id), [
    'hoe_basic',
    'watering_can_basic',
    'mistleaf_seed',
    'mistleaf',
  ]);
  assert.equal(decoded?.items[0]?.toolId, 'hoe_basic');
  assert.equal(decoded?.items[2]?.cropId, 'mistleaf');
});

test('rejects malformed item fields and unsupported schema versions', () => {
  const validItem = {
    id: 'mistleaf',
    displayNameKey: 'item.mistleaf.name',
    type: 'crop',
    maxStack: 99,
    buyPrice: 0,
    sellPrice: 30,
  };

  assert.equal(decodeItemsData({ schemaVersion: 2, items: [] }), null);
  assert.equal(decodeItemsData({
    schemaVersion: 1,
    items: [{ ...validItem, maxStack: 0 }],
  }), null);
  assert.equal(decodeItemsData({
    schemaVersion: 1,
    items: [{ ...validItem, buyPrice: -1 }],
  }), null);
  assert.equal(decodeItemsData({
    schemaVersion: 1,
    items: [{ ...validItem, type: 'seed' }],
  }), null);
  assert.equal(decodeItemsData({
    schemaVersion: 1,
    items: [{ ...validItem, type: 'tool' }],
  }), null);
});

test('rejects duplicate item IDs', () => {
  const item = {
    id: 'mistleaf',
    displayNameKey: 'item.mistleaf.name',
    type: 'crop',
    maxStack: 99,
    buyPrice: 0,
    sellPrice: 30,
  };

  assert.equal(decodeItemsData({
    schemaVersion: 1,
    items: [item, { ...item }],
  }), null);
});
