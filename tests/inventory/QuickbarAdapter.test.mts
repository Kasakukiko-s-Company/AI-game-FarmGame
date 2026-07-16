import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const TILLING_CONTROLLER_URL = new URL(
  '../../assets/scripts/farming/TiledTillingController.ts',
  import.meta.url,
);
const QUICKBAR_VIEW_URL = new URL(
  '../../assets/scripts/ui/QuickbarView.ts',
  import.meta.url,
);

test('authoritative state owner applies semantic quickbar selection before actions', async () => {
  const plantingControllerUrl = new URL(
    '../../assets/scripts/farming/TiledPlantingController.ts',
    import.meta.url,
  );
  const wateringControllerUrl = new URL(
    '../../assets/scripts/farming/TiledWateringController.ts',
    import.meta.url,
  );
  const [source, plantingSource, wateringSource] = await Promise.all([
    readFile(TILLING_CONTROLLER_URL, 'utf8'),
    readFile(plantingControllerUrl, 'utf8'),
    readFile(wateringControllerUrl, 'utf8'),
  ]);

  assert.match(source, /applyQuickbarSelectionInput\(snapshot\)/);
  assert.match(source, /public\s+applyQuickbarSelectionInput\(/);
  assert.match(source, /directSlotIndex:\s*snapshot\.quickbarSlotIndex/);
  assert.match(source, /public\s+selectQuickbarSlot\(/);
  assert.match(source, /this\.resolveSelectedItem\(\)\.use\s*!==\s*'till'/);
  assert.match(source, /this\.resolveSelectedItem\(\)\.use\s*!==\s*'water'/);
  assert.match(source, /selected\.use\s*===\s*'plant'/);
  assert.match(plantingSource, /\.applyQuickbarSelectionInput\(snapshot\)/);
  assert.match(wateringSource, /\.applyQuickbarSelectionInput\(snapshot\)/);
});

test('quickbar view reads the existing inventory owner and follows the camera', async () => {
  const source = await readFile(QUICKBAR_VIEW_URL, 'utf8');

  assert.match(source, /@requireComponent\(Graphics\)/);
  assert.match(source, /setup\.source\.inventoryState/);
  assert.match(source, /createQuickbarProjection\(inventory\)/);
  assert.match(source, /setup\.cameraNode\.worldPosition/);
  assert.match(source, /view\.getVisibleSize\(\)/);
  assert.doesNotMatch(
    source,
    /private\s+(?:readonly\s+)?inventory\s*:/,
    'The HUD must not own a second inventory.',
  );
});
