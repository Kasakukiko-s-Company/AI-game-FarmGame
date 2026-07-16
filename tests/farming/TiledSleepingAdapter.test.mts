import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const SLEEPING_CONTROLLER_URL = new URL(
  '../../assets/scripts/farming/TiledSleepingController.ts',
  import.meta.url,
);
const TILLING_CONTROLLER_URL = new URL(
  '../../assets/scripts/farming/TiledTillingController.ts',
  import.meta.url,
);

test('sleep adapter consumes semantic input through the authoritative day-state owner', async () => {
  const [sleepingSource, tillingSource] = await Promise.all([
    readFile(SLEEPING_CONTROLLER_URL, 'utf8'),
    readFile(TILLING_CONTROLLER_URL, 'utf8'),
  ]);

  assert.match(sleepingSource, /@requireComponent\(TiledTillingController\)/);
  assert.match(sleepingSource, /snapshot\.sleepAction/);
  assert.match(sleepingSource, /\.sleepFacingTile\(/);
  assert.match(sleepingSource, /this\.node\.setWorldPosition\(/);
  assert.match(sleepingSource, /public\s+subscribeSleepCompleted\(/);
  assert.match(
    sleepingSource,
    /this\.node\.setWorldPosition\([\s\S]*?this\.notifySleepCompleted\(/,
    'Autosave listeners must run only after the spawn teleport is committed.',
  );
  assert.doesNotMatch(
    sleepingSource,
    /private\s+(?:readonly\s+)?(?:farm|dayState)\s*:/,
    'The adapter must not own a second FarmState or FarmDayState.',
  );
  assert.match(tillingSource, /public\s+sleepFacingTile\(/);
  assert.match(tillingSource, /currentDayValue\s*=\s*result\.state\.currentDay/);
});

test('sleep input is edge-triggered and yields to every tool action', async () => {
  const source = await readFile(SLEEPING_CONTROLLER_URL, 'utf8');

  assert.match(source, /sleepActionHeld/);
  assert.match(
    source,
    /snapshot\.primaryAction\s*\|\|[\s\S]*?snapshot\.secondaryAction\s*\|\|[\s\S]*?snapshot\.wateringAction/,
  );
});
