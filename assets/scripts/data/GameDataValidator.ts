import {
  GAME_DATA_SCHEMA_VERSION,
  GameDataBundle,
  MapDefinition,
  TilePointData,
} from './GameDataTypes';

export interface DataValidationIssue {
  readonly path: string;
  readonly message: string;
}

function validateUniqueIds(
  path: string,
  values: ReadonlyArray<{ readonly id: string }>,
  issues: DataValidationIssue[],
): void {
  const seen = new Set<string>();
  values.forEach((value, index) => {
    if (value.id.length === 0) {
      issues.push({ path: `${path}[${index}].id`, message: 'ID must not be empty.' });
    } else if (seen.has(value.id)) {
      issues.push({ path: `${path}[${index}].id`, message: `Duplicate ID: ${value.id}` });
    }
    seen.add(value.id);
  });
}

function isTileInsideMap(point: TilePointData, map: MapDefinition): boolean {
  return point.x >= 0 && point.y >= 0 && point.x < map.widthTiles && point.y < map.heightTiles;
}

/** Validates cross-file invariants after JSON has been structurally decoded. */
export function validateGameData(data: GameDataBundle): ReadonlyArray<DataValidationIssue> {
  const issues: DataValidationIssue[] = [];
  const files = [data.items, data.crops, data.tools, data.maps, data.localization];
  files.forEach((file, index) => {
    if (file.schemaVersion !== GAME_DATA_SCHEMA_VERSION) {
      issues.push({
        path: `files[${index}].schemaVersion`,
        message: `Expected schema version ${GAME_DATA_SCHEMA_VERSION}.`,
      });
    }
  });

  validateUniqueIds('items', data.items.items, issues);
  validateUniqueIds('crops', data.crops.crops, issues);
  validateUniqueIds('tools', data.tools.tools, issues);
  validateUniqueIds('maps', data.maps.maps, issues);

  const itemById = new Map(data.items.items.map((item) => [item.id, item]));
  const cropById = new Map(data.crops.crops.map((crop) => [crop.id, crop]));
  const toolById = new Map(data.tools.tools.map((tool) => [tool.id, tool]));

  data.items.items.forEach((item, index) => {
    if (!Number.isInteger(item.maxStack) || item.maxStack <= 0) {
      issues.push({ path: `items[${index}].maxStack`, message: 'maxStack must be a positive integer.' });
    }
    if (item.type === 'seed' && (item.cropId === undefined || !cropById.has(item.cropId))) {
      issues.push({ path: `items[${index}].cropId`, message: 'Seed must reference an existing crop.' });
    }
    if (item.type === 'tool' && (item.toolId === undefined || !toolById.has(item.toolId))) {
      issues.push({ path: `items[${index}].toolId`, message: 'Tool item must reference an existing tool.' });
    }
  });

  data.crops.crops.forEach((crop, index) => {
    const seed = itemById.get(crop.seedItemId);
    const harvest = itemById.get(crop.harvestItemId);
    if (seed?.type !== 'seed') {
      issues.push({ path: `crops[${index}].seedItemId`, message: 'Crop seed must reference a seed item.' });
    }
    if (harvest?.type !== 'crop') {
      issues.push({ path: `crops[${index}].harvestItemId`, message: 'Harvest must reference a crop item.' });
    }
    if (crop.growthStages.length === 0 || crop.growthStages.some((days) => !Number.isInteger(days) || days <= 0)) {
      issues.push({ path: `crops[${index}].growthStages`, message: 'Growth stages must contain positive integer days.' });
    }
    if (!Number.isInteger(crop.harvestQuantity) || crop.harvestQuantity <= 0) {
      issues.push({ path: `crops[${index}].harvestQuantity`, message: 'Harvest quantity must be a positive integer.' });
    }
  });

  data.maps.maps.forEach((map, index) => {
    if (map.widthTiles <= 0 || map.heightTiles <= 0 || map.tileSizePixels <= 0) {
      issues.push({ path: `maps[${index}]`, message: 'Map dimensions and tile size must be positive.' });
    }
    if (!isTileInsideMap(map.spawnTile, map)) {
      issues.push({ path: `maps[${index}].spawnTile`, message: 'Spawn tile must be inside the map.' });
    }
    if (!isTileInsideMap(map.sleepTile, map)) {
      issues.push({ path: `maps[${index}].sleepTile`, message: 'Sleep tile must be inside the map.' });
    }
    if (
      !isTileInsideMap(map.farmableArea.min, map) ||
      !isTileInsideMap(map.farmableArea.max, map) ||
      map.farmableArea.min.x > map.farmableArea.max.x ||
      map.farmableArea.min.y > map.farmableArea.max.y
    ) {
      issues.push({ path: `maps[${index}].farmableArea`, message: 'Farmable area must be an ordered rectangle inside the map.' });
    }
  });

  const defaultLocale = data.localization.locales[data.localization.defaultLocale];
  if (defaultLocale === undefined) {
    issues.push({ path: 'localization.defaultLocale', message: 'Default locale must exist.' });
  } else {
    const displayKeys = [
      ...data.items.items.map((item) => item.displayNameKey),
      ...data.tools.tools.map((tool) => tool.displayNameKey),
      ...data.maps.maps.map((map) => map.displayNameKey),
    ];
    displayKeys.forEach((key) => {
      if (defaultLocale[key] === undefined) {
        issues.push({ path: `localization.${data.localization.defaultLocale}.${key}`, message: 'Missing localized text.' });
      }
    });
  }

  return issues;
}
