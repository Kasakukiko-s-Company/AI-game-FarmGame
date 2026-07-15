import {
  _decorator,
  Component,
  JsonAsset,
  log,
  TiledLayer,
  TiledMap,
  UITransform,
  warn,
} from 'cc';
import type {
  MapDefinition,
  TilePointData,
  TileRectangleData,
} from '../data/GameDataTypes';
import { PlayerController } from '../player/PlayerController';
import {
  updateTillingSession,
  type FarmState,
  type TillingSession,
  type TillingUpdateResult,
} from './FarmState';
import {
  createTiledFarmabilityMap,
  isTileFarmable,
  type TileFarmabilityMap,
} from '../world/TileFarmability';
import {
  getFacingTile,
  type TileGridGeometry,
} from '../world/TileInteraction';

const { ccclass, property, requireComponent } = _decorator;

interface TillingSetup {
  readonly controller: PlayerController;
  readonly map: TiledMap;
  readonly mapTransform: UITransform;
  readonly farmability: TileFarmabilityMap;
  readonly grid: TileGridGeometry;
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

  @property({ tooltip: 'Map definition ID selected from maps.json.' })
  public mapId = 'mvp_farm';

  @property({ tooltip: 'Name of the invisible Tiled tile layer used for blocking.' })
  public blockingLayerName = 'Blocking';

  private controller: PlayerController | null = null;
  private session: TillingSession = {
    farm: { mapId: 'mvp_farm', tiles: [] },
    primaryActionHeld: false,
  };
  private actionStatus: TillingUpdateResult['status'] = 'idle';
  private didWarnMissingSetup = false;

  public get farmState(): FarmState {
    return this.session.farm;
  }

  public get lastActionStatus(): TillingUpdateResult['status'] {
    return this.actionStatus;
  }

  /** Exposes the validated visual boundary without leaking the JSON document. */
  public get farmableArea(): TileRectangleData | null {
    return this.findMapDefinition()?.farmableArea ?? null;
  }

  protected override onLoad(): void {
    this.session = {
      farm: { mapId: this.mapId, tiles: [] },
      primaryActionHeld: false,
    };
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
    this.didWarnMissingSetup = false;
  }

  protected override update(): void {
    const primaryAction = this.controller?.getInputSnapshot().primaryAction ?? false;
    if (!primaryAction || this.session.primaryActionHeld) {
      this.session = updateTillingSession(
        this.session,
        primaryAction,
        null,
        () => false,
      ).session;
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
    const playerLocal = setup.mapTransform.convertToNodeSpaceAR(this.node.worldPosition);
    const target = getFacingTile(
      { x: playerLocal.x, y: playerLocal.y },
      setup.controller.facing,
      setup.grid,
    );
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
