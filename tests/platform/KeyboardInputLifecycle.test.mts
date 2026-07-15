import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const BRIDGE_SOURCE_URL = new URL(
  '../../assets/scripts/platform/KeyboardInputBridge.ts',
  import.meta.url,
);

test('clears held movement keys whenever the preview canvas is resized', async () => {
  const source = await readFile(BRIDGE_SOURCE_URL, 'utf8');

  assert.match(
    source,
    /view\.on\(\s*['"]canvas-resize['"]\s*,\s*this\.resetHeldKeys\s*,\s*this\s*\)/,
    'KeyboardInputBridge must reset held keys when the preview resolution changes.',
  );
  assert.match(
    source,
    /view\.off\(\s*['"]canvas-resize['"]\s*,\s*this\.resetHeldKeys\s*,\s*this\s*\)/,
    'KeyboardInputBridge must unregister the resize listener when disabled.',
  );
  assert.match(
    source,
    /resetHeldKeys[\s\S]*?this\.heldKeys\.clear\(\)/,
    'The resize handler must clear every held movement key.',
  );
});

test('maps E to the semantic secondary action used for planting', async () => {
  const source = await readFile(BRIDGE_SOURCE_URL, 'utf8');

  assert.match(
    source,
    /secondaryAction:\s*this\.isHeld\(KeyCode\.KEY_E\)/,
    'KeyboardInputBridge must expose E through InputSnapshot.secondaryAction.',
  );
  assert.match(
    source,
    /keyCode\s*===\s*KeyCode\.KEY_E/,
    'KeyboardInputBridge must retain KEY_E key-down events.',
  );
});

test('maps F to the semantic watering action', async () => {
  const source = await readFile(BRIDGE_SOURCE_URL, 'utf8');

  assert.match(
    source,
    /wateringAction:\s*this\.isHeld\(KeyCode\.KEY_F\)/,
    'KeyboardInputBridge must expose F through InputSnapshot.wateringAction.',
  );
  assert.match(
    source,
    /keyCode\s*===\s*KeyCode\.KEY_F/,
    'KeyboardInputBridge must retain KEY_F key-down events.',
  );
});

test('maps Enter to the semantic sleep action', async () => {
  const source = await readFile(BRIDGE_SOURCE_URL, 'utf8');

  assert.match(
    source,
    /sleepAction:\s*this\.isHeld\(KeyCode\.ENTER\)/,
    'KeyboardInputBridge must expose Enter through InputSnapshot.sleepAction.',
  );
  assert.match(
    source,
    /keyCode\s*===\s*KeyCode\.ENTER/,
    'KeyboardInputBridge must retain ENTER key-down events.',
  );
});
