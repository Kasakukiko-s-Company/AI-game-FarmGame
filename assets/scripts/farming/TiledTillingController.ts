import {
  _decorator,
  Component,
  JsonAsset,
  log,
  TiledLayer,
  TiledMap,
  UITransform,
  Vec3,
  warn,
} from 'cc';
import type {
  CropDefinition,
  ItemDefinition,
  MapDefinition,
  TilePointData,
  TileRectangleData,
} from '../data/GameDataTypes';
import { decodeItemsData } from '../data/ItemDataDecoder';
import {
  addInventoryItem,
  createInventory,
  selectInventorySlot,
  type InventoryState,
  type ItemStack,
  type SelectInventorySlotResult,
} from '../inventory/InventoryState';
import {
  RELEASED_QUICKBAR_SELECTION,
  resolveSelectedQuickbarItem,
  updateQuickbarSelection as reduceQuickbarSelection,
  type QuickbarItemUse,
  type QuickbarSelectionLatch,
} from '../inventory/Quickbar';
import type { InputSnapshot } from '../platform/PlatformContracts';
import { PlayerController } from '../player/PlayerController';
import {
  updateTillingSession,
  type FarmState,
  type TillingSession,
  type TillingUpdateResult,
} from './FarmState';
import {
  sleepAtTile,
  waterTile,
  type FarmDayState,
  type SleepAtTileResult,
  type WaterTileResult,
} from './FarmDayCycle';
import {
  createTiledFarmabilityMap,
  isTileFarmable,
  type TileFarmabilityMap,
} from '../world/TileFarmability';
import {
  getFacingTile,
  tileToWorldCenter,
  type TileCoordinate,
  type TileGridGeometry,
  type WorldPoint,
} from '../world/TileInteraction';
import {
  useCropInventoryAction,
  type CropInventoryActionResult,
} from './CropInventoryActions';

const { ccclass, property, requireComponent } = _decorator;

interface TillingSetup {
  readonly controller: PlayerController;
  readonly definition: MapDefinition;
  readonly map: TiledMap;
  readonly mapTransform: UITransform;
  readonly farmability: TileFarmabilityMap;
  readonly grid: TileGridGeometry;
}

export interface FacingCropInventoryActionResult extends CropInventoryActionResult {
  readonly target: TileCoordinate | null;
}

export type FacingWaterTileResult =
  | (WaterTileResult & { readonly target: TileCoordinate | null })
  | {
      readonly status: 'wrong_tool';
      readonly state: FarmDayState;
      readonly target: TileCoordinate | null;
    };

export interface FacingSleepResult extends SleepAtTileResult {
  readonly target: TileCoordinate | null;
  readonly spawnWorldPosition: WorldPoint | null;
}

export type TillingActionStatus = TillingUpdateResult['status'] | 'wrong_tool';

export interface FarmingRuntimeState {
  readonly farmDay: FarmDayState;
  readonly inventory: InventoryState;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null;
}

function isTilePoint(value: unknown): value is TilePointData {
  if (!isRecord(value)) {
    return false;
  }

  return Number.isInteger(value.x) && Number.isInteger(value.y);
}

function isMapDefinition(value: unknown): value is MapDefinition {
  if (!isRecord(value) || !isRecord(value.farmableArea)) {
    return false;
  }

  return typeof value.id === 'string' &&
    typeof value.displayNameKey === 'string' &&
    Number.isInteger(value.widthTiles) &&
    Number.isInteger(value.heightTiles) &&
    Number.isInteger(value.tileSizePixels) &&
    isTilePoint(value.spawnTile) &&
    isTilePoint(value.sleepTile) &&
    isTilePoint(value.farmableArea.min) &&
    isTilePoint(value.farmableArea.max);
}

/** Connects semantic tool input to the real Tiled map and pure farming state. */
@ccclass('TiledTillingController')
@requireComponent(PlayerController)
export class TiledTillingController extends Component {
  @property({ type: TiledMap, tooltip: 'TiledMap that owns the farm and Blocking layer.' })
  public tiledMap: TiledMap | null = null;

  @property({ type: JsonAsset, tooltip: 'Validated assets/data/maps.json configuration.' })
  public mapsData: JsonAsset | null = null;

  @property({ type: JsonAsset, tooltip: 'Validated assets/data/items.json configuration.' })
  public itemsData: JsonAsset | null = null;

  @property({ tooltip: 'Map definition ID selected from maps.json.' })
  public mapId = 'mvp_farm';

  @property({ tooltip: 'Name of the invisible Tiled tile layer used for blocking.' })
  public blockingLayerName = 'Blocking';

  @property({ min: 1, step: 1, tooltip: 'Initial positive game day owned by this farm state.' })
  public startingDay = 1;

  @property({ tooltip: 'Starting hoe item ID from items.json.' })
  public startingHoeItemId = 'hoe_basic';

  @property({ tooltip: 'Starting watering can item ID from items.json.' })
  public startingWateringCanItemId = 'watering_can_basic';

  @property({ tooltip: 'Starting seed item ID used by the contextual crop action.' })
  public startingSeedItemId = 'mistleaf_seed';

  @property({ min: 0, step: 1, tooltip: 'Starting seed quantity placed in the real inventory.' })
  public startingSeedQuantity = 3;

  private controller: PlayerController | null = null;
  private session: TillingSession = {
    farm: { mapId: 'mvp_farm', tiles: [] },
    primaryActionHeld: false,
  };
  private actionStatus: TillingActionStatus = 'idle';
  private currentDayValue = 1;
  private inventoryValue: InventoryState = createInventory();
  private itemDefinitionsValue: ReadonlyArray<ItemDefinition> | null = null;
  private quickbarSelectionLatch: QuickbarSelectionLatch =
    RELEASED_QUICKBAR_SELECTION;
  private didWarnMissingSetup = false;

  public get farmState(): FarmState {
    return this.session.farm;
  }

  /** Exposes the single authoritative day and farm snapshot to read-only views. */
  public get farmDayState(): FarmDayState {
    return {
      currentDay: this.currentDayValue,
      farm: this.session.farm,
    };
  }

  public get lastActionStatus(): TillingActionStatus {
    return this.actionStatus;
  }

  /** Exposes the single authoritative inventory snapshot to read-only views. */
  public get inventoryState(): InventoryState {
    return this.inventoryValue;
  }

  /** Exposes validated item definitions to read-only quickbar views. */
  public get itemDefinitions(): ReadonlyArray<ItemDefinition> {
    return this.itemDefinitionsValue ?? [];
  }

  /** Exposes only the active validated map needed by runtime save validation. */
  public get currentMapDefinition(): MapDefinition | null {
    return this.findMapDefinition();
  }

  /** Captures the farming-owned portion of a runtime save snapshot. */
  public captureRuntimeState(): FarmingRuntimeState {
    return {
      farmDay: this.farmDayState,
      inventory: this.inventoryValue,
    };
  }

  /**
   * Commits a fully validated restore plan and clears transient input latches.
   * Returns false without mutation when the save targets another map.
   */
  public restoreRuntimeState(state: FarmingRuntimeState): boolean {
    if (
      state.farmDay.farm.mapId !== this.mapId ||
      !Number.isInteger(state.farmDay.currentDay) ||
      state.farmDay.currentDay <= 0
    ) {
      return false;
    }

    this.currentDayValue = state.farmDay.currentDay;
    this.session = {
      farm: state.farmDay.farm,
      primaryActionHeld: false,
    };
    this.inventoryValue = state.inventory;
    this.quickbarSelectionLatch = RELEASED_QUICKBAR_SELECTION;
    this.actionStatus = 'idle';
    return true;
  }

  /** Returns the gameplay use of the currently selected quickbar item. */
  public get selectedQuickbarItemUse(): QuickbarItemUse {
    return this.resolveSelectedItem().use;
  }

  /** Absolute selection seam used by future touch quickbar adapters. */
  public selectQuickbarSlot(slotIndex: number): SelectInventorySlotResult {
    const result = selectInventorySlot(this.inventoryValue, slotIndex);
    this.inventoryValue = result.inventory;
    return result;
  }

  /** Exposes the validated visual boundary without leaking the JSON document. */
  public get farmableArea(): TileRectangleData | null {
    return this.findMapDefinition()?.farmableArea ?? null;
  }

  /** Exposes only the configured interaction point needed by a read-only view. */
  public get sleepTile(): TilePointData | null {
    return this.findMapDefinition()?.sleepTile ?? null;
  }

  /** Applies contextual planting or harvesting to the authoritative state. */
  public useFacingCropAction(
    crops: ReadonlyArray<CropDefinition>,
  ): FacingCropInventoryActionResult | null {
    const setup = this.getSetup();
    const items = this.itemDefinitionsValue;
    if (setup === null || items === null) {
      return null;
    }

    const target = this.getFacingTarget(setup);
    const selected = resolveSelectedQuickbarItem(
      this.inventoryValue,
      items,
      this.startingHoeItemId,
      this.startingWateringCanItemId,
    );
    const result = useCropInventoryAction(
      {
        farm: this.session.farm,
        inventory: this.inventoryValue,
      },
      target,
      selected.use === 'plant' ? selected.stack?.itemId ?? null : null,
      this.currentDayValue,
      crops,
      items,
    );
    this.session = {
      ...this.session,
      farm: result.state.farm,
    };
    this.inventoryValue = result.state.inventory;
    return { ...result, target };
  }

  /** Applies watering to the facing tile through the authoritative day state. */
  public waterFacingTile(): FacingWaterTileResult | null {
    const setup = this.getSetup();
    if (setup === null) {
      return null;
    }

    const target = this.getFacingTarget(setup);
    if (this.resolveSelectedItem().use !== 'water') {
      return {
        status: 'wrong_tool',
        state: this.farmDayState,
        target,
      };
    }
    const result = waterTile(this.farmDayState, target);
    this.session = {
      ...this.session,
      farm: result.state.farm,
    };
    return { ...result, target };
  }

  /** Settles one day at the configured sleep point and supplies the safe spawn. */
  public sleepFacingTile(
    crops: ReadonlyArray<CropDefinition>,
  ): FacingSleepResult | null {
    const setup = this.getSetup();
    if (setup === null) {
      return null;
    }

    const spawnLocal = tileToWorldCenter(setup.definition.spawnTile, setup.grid);
    if (spawnLocal === null) {
      return null;
    }

    const spawnWorld = setup.mapTransform.convertToWorldSpaceAR(
      new Vec3(spawnLocal.x, spawnLocal.y, 0),
    );
    const target = this.getFacingTarget(setup);
    const result = sleepAtTile(
      this.farmDayState,
      target,
      setup.definition.sleepTile,
      crops,
    );
    if (result.status === 'slept') {
      this.currentDayValue = result.state.currentDay;
      this.session = {
        ...this.session,
        farm: result.state.farm,
      };
    }

    return {
      ...result,
      target,
      spawnWorldPosition: result.status === 'slept'
        ? { x: spawnWorld.x, y: spawnWorld.y }
        : null,
    };
  }

  protected override onLoad(): void {
    this.currentDayValue = Number.isInteger(this.startingDay) && this.startingDay > 0
      ? this.startingDay
      : 1;
    this.session = {
      farm: { mapId: this.mapId, tiles: [] },
      primaryActionHeld: false,
    };
    this.quickbarSelectionLatch = RELEASED_QUICKBAR_SELECTION;
    this.initializeInventory();
  }

  protected override onEnable(): void {
    this.controller = this.getComponent(PlayerController);
  }

  protected override onDisable(): void {
    this.session = {
      ...this.session,
      primaryActionHeld: false,
    };
    this.controller = null;
    this.quickbarSelectionLatch = RELEASED_QUICKBAR_SELECTION;
    this.didWarnMissingSetup = false;
  }

  protected override update(): void {
    const snapshot = this.controller?.getInputSnapshot();
    if (snapshot === undefined) {
      return;
    }
    this.applyQuickbarSelectionInput(snapshot);

    const primaryAction = snapshot.primaryAction;
    if (!primaryAction || this.session.primaryActionHeld) {
      this.session = updateTillingSession(
        this.session,
        primaryAction,
        null,
        () => false,
      ).session;
      return;
    }

    if (this.resolveSelectedItem().use !== 'till') {
      this.session = updateTillingSession(
        this.session,
        true,
        null,
        () => false,
      ).session;
      this.actionStatus = 'wrong_tool';
      log('[TiledTillingController] wrong_tool; select the hoe quickbar slot.');
      return;
    }

    const setup = this.getSetup();
    if (setup === null) {
      this.session = updateTillingSession(
        this.session,
        true,
        null,
        () => false,
      ).session;
      this.actionStatus = 'not_farmable';
      this.warnMissingSetupOnce();
      return;
    }

    this.didWarnMissingSetup = false;
    const target = this.getFacingTarget(setup);
    const result = updateTillingSession(
      this.session,
      true,
      target,
      (tile) => isTileFarmable(tile, setup.farmability),
    );
    this.session = result.session;
    this.actionStatus = result.status;
    log(
      `[TiledTillingController] ${result.status} tile ` +
      `(${target?.x ?? '-'}, ${target?.y ?? '-'}).`,
    );
  }

  /** Idempotently applies this frame's selection before sibling action adapters run. */
  public applyQuickbarSelectionInput(snapshot: InputSnapshot): void {
    const result = reduceQuickbarSelection(
      this.inventoryValue,
      this.quickbarSelectionLatch,
      {
        directSlotIndex: snapshot.quickbarSlotIndex,
        selectPrevious: snapshot.selectPrevious,
        selectNext: snapshot.selectNext,
      },
    );
    this.inventoryValue = result.inventory;
    this.quickbarSelectionLatch = result.latch;
    if (result.status === 'selected') {
      const selected = this.resolveSelectedItem();
      log(
        `[TiledTillingController] selected quickbar slot ` +
        `${result.inventory.selectedSlotIndex + 1}; ` +
        `item=${selected.stack?.itemId ?? '-'}.`,
      );
    }
  }

  private resolveSelectedItem(): ReturnType<typeof resolveSelectedQuickbarItem> {
    return resolveSelectedQuickbarItem(
      this.inventoryValue,
      this.itemDefinitionsValue ?? [],
      this.startingHoeItemId,
      this.startingWateringCanItemId,
    );
  }

  private getSetup(): TillingSetup | null {
    const controller = this.controller;
    const map = this.tiledMap;
    const mapTransform = map?.getComponent(UITransform) ?? null;
    const blockingLayer = map?.getLayer(this.blockingLayerName) ?? null;
    const definition = this.findMapDefinition();
    if (
      controller === null || map === null || mapTransform === null ||
      blockingLayer === null || definition === null
    ) {
      return null;
    }

    const mapSize = map.getMapSize();
    const tileSize = map.getTileSize();
    const farmability = createTiledFarmabilityMap(
      definition,
      {
        width: mapSize.width,
        height: mapSize.height,
        tileWidth: tileSize.width,
        tileHeight: tileSize.height,
      },
      (tileX, tiledRow) => this.isBlockingTile(blockingLayer, tileX, tiledRow),
    );
    if (farmability === null) {
      return null;
    }

    return {
      controller,
      definition,
      map,
      mapTransform,
      farmability,
      grid: {
        width: mapSize.width,
        height: mapSize.height,
        tileWidth: tileSize.width,
        tileHeight: tileSize.height,
        origin: {
          x: -mapTransform.width * mapTransform.anchorX,
          y: -mapTransform.height * mapTransform.anchorY,
        },
      },
    };
  }

  private initializeInventory(): void {
    this.inventoryValue = createInventory();
    this.itemDefinitionsValue = null;

    const itemsFile = decodeItemsData(this.itemsData?.json);
    const startingSeedQuantity = this.startingSeedQuantity;
    if (
      itemsFile === null ||
      !Number.isInteger(startingSeedQuantity) ||
      startingSeedQuantity < 0 ||
      !this.hasStartingItemType(itemsFile.items, this.startingHoeItemId, 'tool') ||
      !this.hasStartingItemType(
        itemsFile.items,
        this.startingWateringCanItemId,
        'tool',
      ) ||
      !this.hasStartingItemType(itemsFile.items, this.startingSeedItemId, 'seed')
    ) {
      warn(
        '[TiledTillingController] Assign valid items.json and starting inventory IDs.',
      );
      return;
    }

    const startingItems: ItemStack[] = [
      { itemId: this.startingHoeItemId, quantity: 1 },
      { itemId: this.startingWateringCanItemId, quantity: 1 },
      ...(startingSeedQuantity === 0
        ? []
        : [{ itemId: this.startingSeedItemId, quantity: startingSeedQuantity }]),
    ];
    let inventory = this.inventoryValue;
    for (const stack of startingItems) {
      const addition = addInventoryItem(inventory, stack, itemsFile.items);
      if (addition.status !== 'added') {
        warn(
          '[TiledTillingController] Starting inventory does not fit or references an invalid item.',
        );
        return;
      }
      inventory = addition.inventory;
    }

    this.inventoryValue = inventory;
    this.itemDefinitionsValue = itemsFile.items;
  }

  private hasStartingItemType(
    items: ReadonlyArray<ItemDefinition>,
    itemId: string,
    type: ItemDefinition['type'],
  ): boolean {
    return items.some((item) => item.id === itemId && item.type === type);
  }

  private getFacingTarget(setup: TillingSetup): TileCoordinate | null {
    const playerLocal = setup.mapTransform.convertToNodeSpaceAR(this.node.worldPosition);
    return getFacingTile(
      { x: playerLocal.x, y: playerLocal.y },
      setup.controller.facing,
      setup.grid,
    );
  }

  private findMapDefinition(): MapDefinition | null {
    const json: unknown = this.mapsData?.json;
    if (!isRecord(json) || !Array.isArray(json.maps)) {
      return null;
    }

    return json.maps.find(
      (candidate: unknown) => isMapDefinition(candidate) && candidate.id === this.mapId,
    ) as MapDefinition | undefined ?? null;
  }

  private isBlockingTile(layer: TiledLayer, tileX: number, tiledRow: number): boolean {
    return (layer.getTileGIDAt(tileX, tiledRow) ?? 0) > 0;
  }

  private warnMissingSetupOnce(): void {
    if (this.didWarnMissingSetup) {
      return;
    }

    this.didWarnMissingSetup = true;
    warn(
      '[TiledTillingController] Assign World, maps.json and a matching Blocking layer.',
    );
  }
}
