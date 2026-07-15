import {
  _decorator,
  Color,
  Component,
  Graphics,
  TiledMap,
  UITransform,
  Vec3,
  warn,
} from 'cc';
import type { TileGridGeometry } from '../world/TileInteraction';
import { createSleepPointPatch, type SleepPointPatch } from './SleepPointProjection';
import { TiledTillingController } from './TiledTillingController';

const { ccclass, property, requireComponent } = _decorator;

const MAT_COLOR = new Color(49, 67, 86, 230);
const MAT_EDGE_COLOR = new Color(220, 185, 99, 255);
const PILLOW_COLOR = new Color(190, 205, 199, 255);
const MOON_COLOR = new Color(244, 211, 116, 255);

interface SleepPointViewSetup {
  readonly source: TiledTillingController;
  readonly mapTransform: UITransform;
  readonly viewTransform: UITransform;
  readonly graphics: Graphics;
  readonly grid: TileGridGeometry;
}

/** Draws an original outdoor rest marker from the configured sleep tile. */
@ccclass('SleepPointView')
@requireComponent(Graphics)
export class SleepPointView extends Component {
  @property({
    type: TiledTillingController,
    tooltip: 'Player state owner that exposes the validated sleep tile.',
  })
  public source: TiledTillingController | null = null;

  @property({
    type: TiledMap,
    tooltip: 'World TiledMap used to position the outdoor rest marker.',
  })
  public tiledMap: TiledMap | null = null;

  private drawnTileKey = '';
  private didWarnMissingSetup = false;

  protected override onEnable(): void {
    this.drawnTileKey = '';
  }

  protected override onDisable(): void {
    this.getComponent(Graphics)?.clear();
    this.drawnTileKey = '';
    this.didWarnMissingSetup = false;
  }

  protected override lateUpdate(): void {
    const setup = this.getSetup();
    const sleepTile = setup?.source.sleepTile ?? null;
    if (setup === null || sleepTile === null) {
      this.getComponent(Graphics)?.clear();
      this.drawnTileKey = '';
      this.warnMissingSetupOnce();
      return;
    }

    const tileKey = `${sleepTile.x}:${sleepTile.y}`;
    if (tileKey === this.drawnTileKey) {
      return;
    }

    const patch = createSleepPointPatch(sleepTile, setup.grid);
    if (patch === null) {
      setup.graphics.clear();
      this.drawnTileKey = '';
      this.warnMissingSetupOnce();
      return;
    }

    this.didWarnMissingSetup = false;
    this.drawnTileKey = tileKey;
    this.redraw(setup, patch);
  }

  private redraw(setup: SleepPointViewSetup, patch: SleepPointPatch): void {
    const mapCenter = new Vec3(
      patch.left + patch.width / 2,
      patch.bottom + patch.height / 2,
      0,
    );
    const worldCenter = setup.mapTransform.convertToWorldSpaceAR(mapCenter);
    const center = setup.viewTransform.convertToNodeSpaceAR(worldCenter);
    const left = center.x - patch.width / 2 + 4;
    const bottom = center.y - patch.height / 2 + 4;
    const width = patch.width - 8;
    const height = patch.height - 8;

    setup.graphics.clear();
    setup.graphics.fillColor = MAT_COLOR;
    setup.graphics.rect(left, bottom, width, height);
    setup.graphics.fill();

    setup.graphics.strokeColor = MAT_EDGE_COLOR;
    setup.graphics.lineWidth = 2;
    setup.graphics.rect(left, bottom, width, height);
    setup.graphics.stroke();

    setup.graphics.fillColor = PILLOW_COLOR;
    setup.graphics.rect(left + 4, bottom + height - 7, width - 8, 4);
    setup.graphics.fill();

    setup.graphics.fillColor = MOON_COLOR;
    setup.graphics.circle(left + width - 6, bottom + 6, 3);
    setup.graphics.fill();
  }

  private getSetup(): SleepPointViewSetup | null {
    const source = this.source;
    const map = this.tiledMap;
    const mapTransform = map?.getComponent(UITransform) ?? null;
    const viewTransform = this.getComponent(UITransform);
    const graphics = this.getComponent(Graphics);
    if (
      source === null || map === null || mapTransform === null ||
      viewTransform === null || graphics === null
    ) {
      return null;
    }

    const mapSize = map.getMapSize();
    const tileSize = map.getTileSize();
    return {
      source,
      mapTransform,
      viewTransform,
      graphics,
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

  private warnMissingSetupOnce(): void {
    if (this.didWarnMissingSetup) {
      return;
    }

    this.didWarnMissingSetup = true;
    warn('[SleepPointView] Assign Source and Tiled Map on a UI_2D node.');
  }
}
