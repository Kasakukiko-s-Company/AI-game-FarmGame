export const GAME_DATA_SCHEMA_VERSION = 1;

export type ItemType = 'tool' | 'seed' | 'crop' | 'material';
export type ToolAction = 'till' | 'water';
export type SeasonId = 'all';

export interface TilePointData {
  readonly x: number;
  readonly y: number;
}

export interface TileRectangleData {
  readonly min: TilePointData;
  readonly max: TilePointData;
}

export interface ItemDefinition {
  readonly id: string;
  readonly displayNameKey: string;
  readonly type: ItemType;
  readonly maxStack: number;
  readonly buyPrice: number;
  readonly sellPrice: number;
  readonly cropId?: string;
  readonly toolId?: string;
}

export interface CropDefinition {
  readonly id: string;
  readonly seedItemId: string;
  readonly harvestItemId: string;
  readonly growthStages: ReadonlyArray<number>;
  readonly harvestQuantity: number;
  readonly requiresWater: boolean;
  readonly allowedSeasons: ReadonlyArray<SeasonId>;
}

export interface ToolDefinition {
  readonly id: string;
  readonly displayNameKey: string;
  readonly action: ToolAction;
  readonly rangeTiles: number;
}

export interface MapDefinition {
  readonly id: string;
  readonly displayNameKey: string;
  readonly widthTiles: number;
  readonly heightTiles: number;
  readonly tileSizePixels: number;
  readonly spawnTile: TilePointData;
  readonly sleepTile: TilePointData;
  readonly farmableArea: TileRectangleData;
}

export interface ItemsDataFile {
  readonly schemaVersion: number;
  readonly items: ReadonlyArray<ItemDefinition>;
}

export interface CropsDataFile {
  readonly schemaVersion: number;
  readonly crops: ReadonlyArray<CropDefinition>;
}

export interface ToolsDataFile {
  readonly schemaVersion: number;
  readonly tools: ReadonlyArray<ToolDefinition>;
}

export interface MapsDataFile {
  readonly schemaVersion: number;
  readonly maps: ReadonlyArray<MapDefinition>;
}

export interface LocalizationDataFile {
  readonly schemaVersion: number;
  readonly defaultLocale: string;
  readonly locales: Readonly<Record<string, Readonly<Record<string, string>>>>;
}

export interface GameDataBundle {
  readonly items: ItemsDataFile;
  readonly crops: CropsDataFile;
  readonly tools: ToolsDataFile;
  readonly maps: MapsDataFile;
  readonly localization: LocalizationDataFile;
}
