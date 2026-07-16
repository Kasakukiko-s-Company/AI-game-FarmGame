import assert from 'node:assert/strict';
import test from 'node:test';
import type {
  CropDefinition,
  ItemDefinition,
  MapDefinition,
} from '../../assets/scripts/data/GameDataTypes.ts';
import type { SaveData } from '../../assets/scripts/core/save/SaveData.ts';
import type {
  ISaveService,
  SaveReadResult,
  SaveWriteResult,
} from '../../assets/scripts/platform/PlatformContracts.ts';
import { registerProjectTypeScriptResolver } from '../support/registerProjectTypeScriptResolver.mts';

registerProjectTypeScriptResolver();

const {
  decodeSavePayload,
  encodeSavePayload,
} = await import('../../assets/scripts/core/save/SaveCodec.ts');
const {
  readAutosave,
  removeAutosave,
  writeAutosave,
} = await import('../../assets/scripts/core/save/SaveGame.ts');
const { MemorySaveService } = await import(
  '../../assets/scripts/platform/PlatformAdapters.ts'
);

const MAPS: ReadonlyArray<MapDefinition> = [{
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
}];

const ITEMS: ReadonlyArray<ItemDefinition> = [
  {
    id: 'hoe_basic',
    displayNameKey: 'tool.hoe_basic.name',
    type: 'tool',
    maxStack: 1,
    buyPrice: 0,
    sellPrice: 0,
    toolId: 'hoe_basic',
  },
  {
    id: 'watering_can_basic',
    displayNameKey: 'tool.watering_can_basic.name',
    type: 'tool',
    maxStack: 1,
    buyPrice: 0,
    sellPrice: 0,
    toolId: 'watering_can_basic',
  },
  {
    id: 'mistleaf_seed',
    displayNameKey: 'item.mistleaf_seed.name',
    type: 'seed',
    maxStack: 99,
    buyPrice: 20,
    sellPrice: 10,
    cropId: 'mistleaf',
  },
  {
    id: 'mistleaf',
    displayNameKey: 'item.mistleaf.name',
    type: 'crop',
    maxStack: 99,
    buyPrice: 0,
    sellPrice: 30,
  },
];

const CROPS: ReadonlyArray<CropDefinition> = [{
  id: 'mistleaf',
  seedItemId: 'mistleaf_seed',
  harvestItemId: 'mistleaf',
  growthStages: [1, 1, 1],
  harvestQuantity: 1,
  requiresWater: true,
  allowedSeasons: ['all'],
}];

const VALIDATION = { maps: MAPS, items: ITEMS, crops: CROPS };

function validSave(): SaveData {
  return {
    saveVersion: 1,
    savedAt: '2026-07-16T08:00:00.000Z',
    player: {
      mapId: 'mvp_farm',
      worldPosition: { x: 16, y: -24 },
      facing: 'left',
    },
    currentDay: 3,
    inventory: {
      selectedSlotIndex: 2,
      slots: [
        { itemId: 'hoe_basic', quantity: 1 },
        { itemId: 'watering_can_basic', quantity: 1 },
        { itemId: 'mistleaf_seed', quantity: 2 },
        { itemId: 'mistleaf', quantity: 1 },
        null,
        null,
        null,
        null,
      ],
    },
    farm: {
      mapId: 'mvp_farm',
      tiles: [{
        x: 7,
        y: 8,
        isTilled: true,
        wateredOnDay: 3,
        crop: {
          cropId: 'mistleaf',
          plantedOnDay: 1,
          growthProgress: 2,
          stageIndex: 2,
          lastGrowthDay: 2,
        },
      }],
    },
  };
}

function mutateSave(
  change: (copy: Record<string, unknown>) => void,
): string {
  const copy = JSON.parse(JSON.stringify(validSave())) as Record<string, unknown>;
  change(copy);
  return JSON.stringify(copy);
}

class FailedSaveService implements ISaveService {
  public async read(_slotId: string): Promise<SaveReadResult> {
    return { status: 'failed', message: 'read denied' };
  }

  public async write(
    _slotId: string,
    _payload: string,
  ): Promise<SaveWriteResult> {
    return { status: 'failed', message: 'write denied' };
  }

  public async remove(_slotId: string): Promise<SaveWriteResult> {
    return { status: 'failed', message: 'remove denied' };
  }
}

test('round-trips one valid version-one snapshot', () => {
  const source = validSave();
  const payload = encodeSavePayload(source, VALIDATION);
  const decoded = decodeSavePayload(payload, VALIDATION);

  assert.deepEqual(decoded, { status: 'decoded', save: source });
  assert.notEqual(
    decoded.status === 'decoded' ? decoded.save : null,
    source,
    'The decoder must reconstruct trusted state instead of returning caller data.',
  );
});

test('distinguishes malformed JSON and unsupported versions', () => {
  const invalidJson = decodeSavePayload('{', VALIDATION);
  const unsupported = decodeSavePayload(
    mutateSave((copy) => {
      copy.saveVersion = 2;
    }),
    VALIDATION,
  );

  assert.equal(invalidJson.status, 'invalid_json');
  assert.deepEqual(unsupported, {
    status: 'unsupported_version',
    saveVersion: 2,
    message: 'unsupported saveVersion: 2',
  });
});

test('rejects invalid metadata, player state and mismatched maps', () => {
  const invalidTimestamp = decodeSavePayload(
    mutateSave((copy) => {
      copy.savedAt = 'today';
    }),
    VALIDATION,
  );
  const invalidPosition = decodeSavePayload(
    mutateSave((copy) => {
      const player = copy.player as Record<string, unknown>;
      player.worldPosition = { x: 'NaN', y: 0 };
    }),
    VALIDATION,
  );
  const mismatchedMap = decodeSavePayload(
    mutateSave((copy) => {
      const farm = copy.farm as Record<string, unknown>;
      farm.mapId = 'other_map';
    }),
    VALIDATION,
  );

  assert.equal(invalidTimestamp.status, 'invalid_data');
  assert.equal(invalidPosition.status, 'invalid_data');
  assert.equal(mismatchedMap.status, 'invalid_data');
});

test('rejects damaged inventory slots and selections', () => {
  const oversizedStack = decodeSavePayload(
    mutateSave((copy) => {
      const inventory = copy.inventory as Record<string, unknown>;
      const slots = inventory.slots as Array<Record<string, unknown> | null>;
      const hoe = slots[0];
      if (hoe !== null && hoe !== undefined) {
        hoe.quantity = 2;
      }
    }),
    VALIDATION,
  );
  const unknownItem = decodeSavePayload(
    mutateSave((copy) => {
      const inventory = copy.inventory as Record<string, unknown>;
      const slots = inventory.slots as Array<Record<string, unknown> | null>;
      const seed = slots[2];
      if (seed !== null && seed !== undefined) {
        seed.itemId = 'missing_item';
      }
    }),
    VALIDATION,
  );
  const invalidSelection = decodeSavePayload(
    mutateSave((copy) => {
      const inventory = copy.inventory as Record<string, unknown>;
      inventory.selectedSlotIndex = 8;
    }),
    VALIDATION,
  );

  assert.equal(oversizedStack.status, 'invalid_data');
  assert.equal(unknownItem.status, 'invalid_data');
  assert.equal(invalidSelection.status, 'invalid_data');
});

test('rejects duplicate, out-of-farm and future-watered tiles', () => {
  const duplicate = decodeSavePayload(
    mutateSave((copy) => {
      const farm = copy.farm as Record<string, unknown>;
      const tiles = farm.tiles as unknown[];
      tiles.push(JSON.parse(JSON.stringify(tiles[0])) as unknown);
    }),
    VALIDATION,
  );
  const outOfFarm = decodeSavePayload(
    mutateSave((copy) => {
      const farm = copy.farm as Record<string, unknown>;
      const tiles = farm.tiles as Array<Record<string, unknown>>;
      const tile = tiles[0];
      if (tile !== undefined) {
        tile.x = 20;
      }
    }),
    VALIDATION,
  );
  const futureWater = decodeSavePayload(
    mutateSave((copy) => {
      const farm = copy.farm as Record<string, unknown>;
      const tiles = farm.tiles as Array<Record<string, unknown>>;
      const tile = tiles[0];
      if (tile !== undefined) {
        tile.wateredOnDay = 4;
      }
    }),
    VALIDATION,
  );

  assert.equal(duplicate.status, 'invalid_data');
  assert.equal(outOfFarm.status, 'invalid_data');
  assert.equal(futureWater.status, 'invalid_data');
});

test('rejects unknown crops and inconsistent growth stages', () => {
  const unknownCrop = decodeSavePayload(
    mutateSave((copy) => {
      const farm = copy.farm as Record<string, unknown>;
      const tiles = farm.tiles as Array<Record<string, unknown>>;
      const crop = tiles[0]?.crop as Record<string, unknown>;
      crop.cropId = 'missing_crop';
    }),
    VALIDATION,
  );
  const wrongStage = decodeSavePayload(
    mutateSave((copy) => {
      const farm = copy.farm as Record<string, unknown>;
      const tiles = farm.tiles as Array<Record<string, unknown>>;
      const crop = tiles[0]?.crop as Record<string, unknown>;
      crop.stageIndex = 0;
    }),
    VALIDATION,
  );

  assert.equal(unknownCrop.status, 'invalid_data');
  assert.equal(wrongStage.status, 'invalid_data');
});

test('rejects crop progress that could not occur in the settled day timeline', () => {
  const impossibleProgress = decodeSavePayload(
    mutateSave((copy) => {
      const farm = copy.farm as Record<string, unknown>;
      const tiles = farm.tiles as Array<Record<string, unknown>>;
      const crop = tiles[0]?.crop as Record<string, unknown>;
      crop.plantedOnDay = 3;
      crop.lastGrowthDay = 2;
      crop.growthProgress = 1;
      crop.stageIndex = 1;
    }),
    VALIDATION,
  );

  assert.equal(impossibleProgress.status, 'invalid_data');
});

test('writes, reads and removes the single autosave slot through the save seam', async () => {
  const saves = new MemorySaveService();
  const source = validSave();

  assert.deepEqual(await readAutosave(saves, VALIDATION), { status: 'missing' });
  assert.deepEqual(await writeAutosave(saves, source, VALIDATION), {
    status: 'saved',
  });
  assert.deepEqual(await readAutosave(saves, VALIDATION), {
    status: 'loaded',
    save: source,
  });
  assert.deepEqual(await removeAutosave(saves), { status: 'removed' });
  assert.deepEqual(await readAutosave(saves, VALIDATION), { status: 'missing' });
});

test('returns explicit storage failures without pretending they are missing saves', async () => {
  const saves = new FailedSaveService();

  assert.deepEqual(await writeAutosave(saves, validSave(), VALIDATION), {
    status: 'storage_failed',
    message: 'write denied',
  });
  assert.deepEqual(await readAutosave(saves, VALIDATION), {
    status: 'storage_failed',
    message: 'read denied',
  });
  assert.deepEqual(await removeAutosave(saves), {
    status: 'storage_failed',
    message: 'remove denied',
  });
});
