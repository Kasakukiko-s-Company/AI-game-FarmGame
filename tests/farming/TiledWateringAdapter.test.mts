import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const WATERING_CONTROLLER_URL = new URL(
  '../../assets/scripts/farming/TiledWateringController.ts',
  import.meta.url,
);
const TILLING_CONTROLLER_URL = new URL(
  '../../assets/scripts/farming/TiledTillingController.ts',
  import.meta.url,
);

test('watering adapter consumes semantic input through the authoritative day-state owner', async () => {
  const [wateringSource, tillingSource] = await Promise.all([
    readFile(WATERING_CONTROLLER_URL, 'utf8'),
    readFile(TILLING_CONTROLLER_URL, 'utf8'),
  ]);

  assert.match(wateringSource, /@requireComponent\(TiledTillingController\)/);
  assert.match(wateringSource, /getInputSnapshot\(\)/);
  assert.match(wateringSource, /snapshot\.wateringAction/);
  assert.match(wateringSource, /\.waterFacingTile\(\)/);
  assert.doesNotMatch(
    wateringSource,
    /private\s+(?:readonly\s+)?(?:farm|dayState)\s*:/,
    'The adapter must not own a second FarmState or FarmDayState.',
  );
  assert.match(tillingSource, /public\s+get\s+farmDayState\s*\(\)/);
  assert.match(tillingSource, /public\s+waterFacingTile\(\)/);
});

test('watering input is edge-triggered and yields to hoe and planting actions', async () => {
  const source = await readFile(WATERING_CONTROLLER_URL, 'utf8');

  assert.match(source, /wateringActionHeld/);
  assert.match(
    source,
    /if\s*\(snapshot\.primaryAction\s*\|\|\s*snapshot\.secondaryAction\)\s*\{[\s\S]*?return;/,
  );
});
