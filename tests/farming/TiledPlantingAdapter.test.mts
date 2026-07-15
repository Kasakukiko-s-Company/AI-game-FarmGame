import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const PLANTING_CONTROLLER_URL = new URL(
  '../../assets/scripts/farming/TiledPlantingController.ts',
  import.meta.url,
);
const TILLING_CONTROLLER_URL = new URL(
  '../../assets/scripts/farming/TiledTillingController.ts',
  import.meta.url,
);

test('planting adapter consumes semantic secondary action through the state owner', async () => {
  const [plantingSource, tillingSource] = await Promise.all([
    readFile(PLANTING_CONTROLLER_URL, 'utf8'),
    readFile(TILLING_CONTROLLER_URL, 'utf8'),
  ]);

  assert.match(plantingSource, /@requireComponent\(TiledTillingController\)/);
  assert.match(plantingSource, /getInputSnapshot\(\)/);
  assert.match(plantingSource, /snapshot\.secondaryAction/);
  assert.match(plantingSource, /\.plantFacingCrop\(/);
  assert.doesNotMatch(
    plantingSource,
    /private\s+(?:readonly\s+)?farm\s*:/,
    'The adapter must not own a second FarmState.',
  );
  assert.match(
    tillingSource,
    /public\s+plantFacingCrop\(/,
    'The existing state owner must expose a command-specific planting seam.',
  );
});

test('planting input is edge-triggered and gives simultaneous hoe input precedence', async () => {
  const source = await readFile(PLANTING_CONTROLLER_URL, 'utf8');

  assert.match(source, /secondaryActionHeld/);
  assert.match(source, /if\s*\(snapshot\.primaryAction\)\s*\{[\s\S]*?return;/);
});

test('planting reads the current day from the authoritative farm state owner', async () => {
  const [plantingSource, tillingSource] = await Promise.all([
    readFile(PLANTING_CONTROLLER_URL, 'utf8'),
    readFile(TILLING_CONTROLLER_URL, 'utf8'),
  ]);

  assert.doesNotMatch(plantingSource, /public\s+currentDay\s*=/);
  assert.match(plantingSource, /\.plantFacingCrop\(\s*this\.seeds,\s*cropsFile\.crops/);
  assert.match(tillingSource, /plantCrop\([\s\S]*?this\.currentDayValue,/);
});
