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

test('crop adapter consumes semantic secondary action through one state owner', async () => {
  const [plantingSource, tillingSource] = await Promise.all([
    readFile(PLANTING_CONTROLLER_URL, 'utf8'),
    readFile(TILLING_CONTROLLER_URL, 'utf8'),
  ]);

  assert.match(plantingSource, /@requireComponent\(TiledTillingController\)/);
  assert.match(plantingSource, /getInputSnapshot\(\)/);
  assert.match(plantingSource, /snapshot\.secondaryAction/);
  assert.match(plantingSource, /\.useFacingCropAction\(/);
  assert.doesNotMatch(
    plantingSource,
    /private\s+(?:readonly\s+)?(?:farm|inventory|seeds)\s*:/,
    'The input adapter must not own another farm, inventory or seed stack.',
  );
  assert.match(
    tillingSource,
    /public\s+useFacingCropAction\(/,
    'The existing state owner must expose one contextual crop command seam.',
  );
  assert.match(tillingSource, /private\s+inventoryValue\s*:/);
  assert.match(tillingSource, /public\s+get\s+inventoryState\s*\(\)/);
});

test('planting input is edge-triggered and gives simultaneous hoe input precedence', async () => {
  const source = await readFile(PLANTING_CONTROLLER_URL, 'utf8');

  assert.match(source, /secondaryActionHeld/);
  assert.match(source, /if\s*\(snapshot\.primaryAction\)\s*\{[\s\S]*?return;/);
});

test('crop actions use decoded items and the authoritative day and inventory', async () => {
  const [plantingSource, tillingSource] = await Promise.all([
    readFile(PLANTING_CONTROLLER_URL, 'utf8'),
    readFile(TILLING_CONTROLLER_URL, 'utf8'),
  ]);

  assert.doesNotMatch(plantingSource, /private\s+seeds\s*:/);
  assert.match(plantingSource, /\.useFacingCropAction\(cropsFile\.crops\)/);
  assert.match(tillingSource, /decodeItemsData\(this\.itemsData\?\.json\)/);
  assert.match(tillingSource, /useCropInventoryAction\([\s\S]*?this\.currentDayValue,/);
  assert.match(tillingSource, /this\.inventoryValue\s*=\s*result\.state\.inventory/);
});
