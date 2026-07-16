import assert from 'node:assert/strict';
import test from 'node:test';
import type {
  CropDefinition,
  ItemDefinition,
  MapDefinition,
} from '../../assets/scripts/data/GameDataTypes.ts';
import type {
  IRuntimeAutosavePort,
  RuntimeCaptureResult,
  RuntimeRestoreResult,
} from '../../assets/scripts/core/save/AutosaveSession.ts';
import type { SaveData } from '../../assets/scripts/core/save/SaveData.ts';
import type {
  ISaveService,
  SaveReadResult,
  SaveWriteResult,
} from '../../assets/scripts/platform/PlatformContracts.ts';
import { registerProjectTypeScriptResolver } from '../support/registerProjectTypeScriptResolver.mts';

registerProjectTypeScriptResolver();

const { AutosaveSession } = await import(
  '../../assets/scripts/core/save/AutosaveSession.ts'
);
const { MVP_SAVE_SLOT_ID } = await import(
  '../../assets/scripts/core/save/SaveData.ts'
);
const { MemorySaveService } = await import(
  '../../assets/scripts/platform/PlatformAdapters.ts'
);

const MAP: MapDefinition = {
  id: 'mvp_farm',
  displayNameKey: 'map.mvp_farm.name',
  widthTiles: 30,
  heightTiles: 30,
  tileSizePixels: 32,
  spawnTile: { x: 15, y: 18 },
  sleepTile: { x: 15, y: 22 },
  farmableArea: {
    min: { x: 5, y: 5 },
    max: { x: 14, y: 14 },
  },
};

const ITEMS: ReadonlyArray<ItemDefinition> = [{
  id: 'hoe_basic',
  displayNameKey: 'tool.hoe_basic.name',
  type: 'tool',
  maxStack: 1,
  buyPrice: 0,
  sellPrice: 0,
  toolId: 'hoe_basic',
}];

const CROPS: ReadonlyArray<CropDefinition> = [{
  id: 'mistleaf',
  seedItemId: 'mistleaf_seed',
  harvestItemId: 'mistleaf',
  growthStages: [1, 1, 1],
  harvestQuantity: 1,
  requiresWater: true,
  allowedSeasons: ['all'],
}];

const VALIDATION = {
  maps: [MAP],
  items: ITEMS,
  crops: CROPS,
};

function createSave(savedAt = '2026-07-16T12:00:00.000Z'): SaveData {
  return {
    saveVersion: 1,
    savedAt,
    player: {
      mapId: 'mvp_farm',
      worldPosition: { x: 64, y: -32 },
      facing: 'down',
    },
    currentDay: 2,
    inventory: {
      selectedSlotIndex: 0,
      slots: [
        { itemId: 'hoe_basic', quantity: 1 },
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
    },
    farm: {
      mapId: 'mvp_farm',
      tiles: [],
    },
  };
}

class FakeRuntime implements IRuntimeAutosavePort {
  public captured: SaveData = createSave();
  public captureFailure: string | null = null;
  public restoreFailure: string | null = null;
  public restored: SaveData | null = null;

  public capture(savedAt: Date): RuntimeCaptureResult {
    if (this.captureFailure !== null) {
      return { status: 'failed', message: this.captureFailure };
    }
    return {
      status: 'captured',
      save: {
        ...this.captured,
        savedAt: savedAt.toISOString(),
      },
    };
  }

  public restore(save: SaveData): RuntimeRestoreResult {
    if (this.restoreFailure !== null) {
      return { status: 'failed', message: this.restoreFailure };
    }
    this.restored = save;
    return { status: 'restored' };
  }
}

class FailedSaveService implements ISaveService {
  public async read(_slotId: string): Promise<SaveReadResult> {
    return { status: 'failed', message: 'disk unavailable' };
  }

  public async write(
    _slotId: string,
    _payload: string,
  ): Promise<SaveWriteResult> {
    return { status: 'failed', message: 'disk unavailable' };
  }

  public async remove(_slotId: string): Promise<SaveWriteResult> {
    return { status: 'failed', message: 'disk unavailable' };
  }
}

test('starts a new game, saves, then restores the same autosave', async () => {
  const saves = new MemorySaveService();
  const firstRuntime = new FakeRuntime();
  const first = new AutosaveSession(saves, VALIDATION, firstRuntime);

  assert.deepEqual(await first.load(), { status: 'new_game' });
  assert.deepEqual(
    await first.save(new Date('2026-07-16T13:00:00.000Z')),
    { status: 'saved' },
  );

  const secondRuntime = new FakeRuntime();
  const second = new AutosaveSession(saves, VALIDATION, secondRuntime);
  assert.deepEqual(await second.load(), { status: 'loaded' });
  assert.equal(secondRuntime.restored?.savedAt, '2026-07-16T13:00:00.000Z');
  assert.equal(secondRuntime.restored?.currentDay, 2);
});

test('blocks writes before loading and after a damaged save', async () => {
  const saves = new MemorySaveService();
  const runtime = new FakeRuntime();
  const session = new AutosaveSession(saves, VALIDATION, runtime);

  assert.equal((await session.save()).status, 'not_ready');
  await saves.write(MVP_SAVE_SLOT_ID, '{');

  const damaged = new AutosaveSession(saves, VALIDATION, runtime);
  assert.equal((await damaged.load()).status, 'invalid_save');
  assert.equal((await damaged.save()).status, 'not_ready');
  assert.deepEqual(await saves.read(MVP_SAVE_SLOT_ID), {
    status: 'found',
    payload: '{',
  });
});

test('blocks writes when storage or runtime restoration fails', async () => {
  const failedStorage = new AutosaveSession(
    new FailedSaveService(),
    VALIDATION,
    new FakeRuntime(),
  );
  assert.deepEqual(await failedStorage.load(), {
    status: 'storage_failed',
    message: 'disk unavailable',
  });
  assert.equal((await failedStorage.save()).status, 'not_ready');

  const saves = new MemorySaveService();
  const seedRuntime = new FakeRuntime();
  const seed = new AutosaveSession(saves, VALIDATION, seedRuntime);
  await seed.load();
  await seed.save();

  const restoreRuntime = new FakeRuntime();
  restoreRuntime.restoreFailure = 'active map mismatch';
  const restore = new AutosaveSession(saves, VALIDATION, restoreRuntime);
  assert.deepEqual(await restore.load(), {
    status: 'restore_failed',
    message: 'active map mismatch',
  });
  assert.equal((await restore.save()).status, 'not_ready');
});

test('reports capture failures without mutating the existing save', async () => {
  const saves = new MemorySaveService();
  const runtime = new FakeRuntime();
  const session = new AutosaveSession(saves, VALIDATION, runtime);
  await session.load();
  await session.save(new Date('2026-07-16T14:00:00.000Z'));
  const before = await saves.read(MVP_SAVE_SLOT_ID);

  runtime.captureFailure = 'invalid runtime state';
  assert.deepEqual(await session.save(), {
    status: 'capture_failed',
    message: 'invalid runtime state',
  });
  assert.deepEqual(await saves.read(MVP_SAVE_SLOT_ID), before);
});

test('serializes rapid autosaves so the newest snapshot wins', async () => {
  const saves = new MemorySaveService();
  const runtime = new FakeRuntime();
  const session = new AutosaveSession(saves, VALIDATION, runtime);
  await session.load();

  const first = session.save(new Date('2026-07-16T15:00:00.000Z'));
  const second = session.save(new Date('2026-07-16T16:00:00.000Z'));
  assert.deepEqual(await Promise.all([first, second]), [
    { status: 'saved' },
    { status: 'saved' },
  ]);

  const restoredRuntime = new FakeRuntime();
  const restored = new AutosaveSession(saves, VALIDATION, restoredRuntime);
  await restored.load();
  assert.equal(restoredRuntime.restored?.savedAt, '2026-07-16T16:00:00.000Z');
});
