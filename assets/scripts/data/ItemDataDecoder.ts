import type {
  ItemDefinition,
  ItemsDataFile,
  ItemType,
} from './GameDataTypes';

const ITEMS_DATA_SCHEMA_VERSION = 1;

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0;
}

function isItemType(value: unknown): value is ItemType {
  return value === 'tool' ||
    value === 'seed' ||
    value === 'crop' ||
    value === 'material';
}

function decodeItemDefinition(value: unknown): ItemDefinition | null {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.displayNameKey) ||
    !isItemType(value.type) ||
    !isPositiveInteger(value.maxStack) ||
    !isNonNegativeInteger(value.buyPrice) ||
    !isNonNegativeInteger(value.sellPrice)
  ) {
    return null;
  }

  const cropId = value.cropId;
  const toolId = value.toolId;
  if (
    (cropId !== undefined && !isNonEmptyString(cropId)) ||
    (toolId !== undefined && !isNonEmptyString(toolId)) ||
    (value.type === 'seed' && !isNonEmptyString(cropId)) ||
    (value.type === 'tool' && !isNonEmptyString(toolId))
  ) {
    return null;
  }

  return {
    id: value.id,
    displayNameKey: value.displayNameKey,
    type: value.type,
    maxStack: value.maxStack,
    buyPrice: value.buyPrice,
    sellPrice: value.sellPrice,
    ...(cropId === undefined ? {} : { cropId }),
    ...(toolId === undefined ? {} : { toolId }),
  };
}

/** Decodes items.json without trusting the untyped Cocos JsonAsset payload. */
export function decodeItemsData(value: unknown): ItemsDataFile | null {
  if (
    !isRecord(value) ||
    value.schemaVersion !== ITEMS_DATA_SCHEMA_VERSION ||
    !Array.isArray(value.items)
  ) {
    return null;
  }

  const items: ItemDefinition[] = [];
  const itemIds = new Set<string>();
  for (const valueItem of value.items) {
    const item = decodeItemDefinition(valueItem);
    if (item === null || itemIds.has(item.id)) {
      return null;
    }

    itemIds.add(item.id);
    items.push(item);
  }

  return {
    schemaVersion: ITEMS_DATA_SCHEMA_VERSION,
    items,
  };
}
