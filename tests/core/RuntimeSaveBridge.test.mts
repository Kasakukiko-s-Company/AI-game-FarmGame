import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const BRIDGE_URL = new URL(
  '../../assets/scripts/save/RuntimeSaveBridge.ts',
  import.meta.url,
);
const PLAYER_URL = new URL(
  '../../assets/scripts/player/PlayerController.ts',
  import.meta.url,
);
const FARMING_URL = new URL(
  '../../assets/scripts/farming/TiledTillingController.ts',
  import.meta.url,
);

test('runtime bridge coordinates existing state owners through one small interface', async () => {
  const [bridge, player, farming] = await Promise.all([
    readFile(BRIDGE_URL, 'utf8'),
    readFile(PLAYER_URL, 'utf8'),
    readFile(FARMING_URL, 'utf8'),
  ]);

  assert.match(bridge, /public\s+captureSnapshot\(/);
  assert.match(bridge, /public\s+restoreSnapshot\(/);
  assert.match(bridge, /captureRuntimeSave\(/);
  assert.match(bridge, /prepareRuntimeRestore\(/);
  assert.match(bridge, /setup\.player\.captureRuntimeState\(\)/);
  assert.match(bridge, /setup\.stateOwner\.captureRuntimeState\(\)/);
  assert.match(bridge, /setup\.stateOwner\.restoreRuntimeState\(/);
  assert.match(bridge, /setup\.player\.restoreRuntimeState\(/);
  assert.doesNotMatch(
    bridge,
    /private\s+(?:readonly\s+)?(?:farm|inventory|currentDay|playerPosition)\s*:/,
    'The bridge must not own a second copy of gameplay state.',
  );
  assert.doesNotMatch(bridge, /\b(?:wx|localStorage|Steamworks)\b/);
  assert.match(player, /public\s+captureRuntimeState\(/);
  assert.match(player, /public\s+restoreRuntimeState\(/);
  assert.match(farming, /public\s+captureRuntimeState\(/);
  assert.match(farming, /public\s+restoreRuntimeState\(/);
});

test('runtime restore clears transient farming input latches', async () => {
  const source = await readFile(FARMING_URL, 'utf8');

  assert.match(
    source,
    /restoreRuntimeState[\s\S]*?primaryActionHeld:\s*false/,
  );
  assert.match(
    source,
    /restoreRuntimeState[\s\S]*?RELEASED_QUICKBAR_SELECTION/,
  );
  assert.match(
    source,
    /restoreRuntimeState[\s\S]*?actionStatus\s*=\s*'idle'/,
  );
});
