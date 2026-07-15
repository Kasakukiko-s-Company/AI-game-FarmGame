import type {
  CropDefinition,
  CropsDataFile,
  SeasonId,
} from './GameDataTypes';

const CROPS_DATA_SCHEMA_VERSION = 1;

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) > 0;
}

function isSeasonId(value: unknown): value is SeasonId {
  return value === 'all';
}

function decodeCropDefinition(value: unknown): CropDefinition | null {
  if (!isRecord(value)) {
    return null;
  }

  const growthStages = value.growthStages;
  const allowedSeasons = value.allowedSeasons;
  if (
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.seedItemId) ||
    !isNonEmptyString(value.harvestItemId) ||
    !Array.isArray(growthStages) ||
    growthStages.length === 0 ||
    !growthStages.every(isPositiveInteger) ||
    !isPositiveInteger(value.harvestQuantity) ||
    typeof value.requiresWater !== 'boolean' ||
    !Array.isArray(allowedSeasons) ||
    allowedSeasons.length === 0 ||
    !allowedSeasons.every(isSeasonId)
  ) {
    return null;
  }

  return {
    id: value.id,
    seedItemId: value.seedItemId,
    harvestItemId: value.harvestItemId,
    growthStages,
    harvestQuantity: value.harvestQuantity,
    requiresWater: value.requiresWater,
    allowedSeasons,
  };
}

/** Decodes the runtime JsonAsset without trusting its untyped JSON payload. */
export function decodeCropsData(value: unknown): CropsDataFile | null {
  if (
    !isRecord(value) ||
    value.schemaVersion !== CROPS_DATA_SCHEMA_VERSION ||
    !Array.isArray(value.crops)
  ) {
    return null;
  }

  const crops: CropDefinition[] = [];
  const cropIds = new Set<string>();
  const seedItemIds = new Set<string>();
  for (const valueCrop of value.crops) {
    const crop = decodeCropDefinition(valueCrop);
    if (
      crop === null ||
      cropIds.has(crop.id) ||
      seedItemIds.has(crop.seedItemId)
    ) {
      return null;
    }

    cropIds.add(crop.id);
    seedItemIds.add(crop.seedItemId);
    crops.push(crop);
  }

  return {
    schemaVersion: CROPS_DATA_SCHEMA_VERSION,
    crops,
  };
}
