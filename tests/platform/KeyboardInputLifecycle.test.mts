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
