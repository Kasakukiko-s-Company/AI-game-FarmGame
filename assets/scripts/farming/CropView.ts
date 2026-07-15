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
import type { FarmState } from './FarmState';
import { createCropPatches, type CropPatch } from './CropProjection';
import { TiledTillingController } from './TiledTillingController';

const { ccclass, property, requireComponent } = _decorator;

const SHADOW_COLOR = new Color(71, 55, 39, 150);
const STEM_COLOR = new Color(46, 105, 70, 255);
const LEAF_COLOR = new Color(61, 137, 88, 255);
const LEAF_HIGHLIGHT_COLOR = new Color(113, 185, 126, 255);
const BUD_COLOR = new Color(174, 211, 151, 255);

interface CropViewSetup {
  readonly source: TiledTillingController;
  readonly mapTransform: UITransform;
  readonly viewTransform: UITransform;
  readonly graphics: Graphics;
  readonly grid: TileGridGeometry;
}

/** Draws original geometry placeholders for crops in the authoritative farm state. */
@ccclass('CropView')
@requireComponent(Graphics)
export class CropView extends Component {
  @property({
    type: TiledTillingController,
    tooltip: 'Player TiledTillingController that owns the authoritative FarmState.',
  })
  public source: TiledTillingController | null = null;

  @property({
    type: TiledMap,
    tooltip: 'World TiledMap used to position crop placeholders.',
  })
  public tiledMap: TiledMap | null = null;

  private drawnFarm: FarmState | null = null;
  private didWarnMissingSetup = false;

  protected override onEnable(): void {
    this.drawnFarm = null;
  }

  protected override onDisable(): void {
    this.getComponent(Graphics)?.clear();
    this.drawnFarm = null;
    this.didWarnMissingSetup = false;
  }

  protected override lateUpdate(): void {
    const setup = this.getSetup();
    if (setup === null) {
      this.getComponent(Graphics)?.clear();
      this.drawnFarm = null;
      this.warnMissingSetupOnce();
      return;
    }

    this.didWarnMissingSetup = false;
    const farm = setup.source.farmState;
    if (farm === this.drawnFarm) {
      return;
    }

    this.drawnFarm = farm;
    this.redraw(setup, farm);
  }

  private redraw(setup: CropViewSetup, farm: FarmState): void {
    setup.graphics.clear();
    for (const patch of createCropPatches(farm, setup.grid)) {
      this.drawCrop(setup, patch);
    }
  }

  private drawCrop(setup: CropViewSetup, patch: CropPatch): void {
    const mapBase = new Vec3(patch.centerX, patch.bottom, 0);
    const worldBase = setup.mapTransform.convertToWorldSpaceAR(mapBase);
    const base = setup.viewTransform.convertToNodeSpaceAR(worldBase);
    const visualStage = Math.min(patch.stageIndex, 2);
    const stemHeight = Math.min(patch.height - 8, 8 + visualStage * 4);
    const groundY = base.y + 5;
    const stemTop = groundY + stemHeight;
    const leafWidth = 5 + visualStage;
    const leafHeight = 4 + visualStage;

    setup.graphics.fillColor = SHADOW_COLOR;
    setup.graphics.rect(base.x - 5, groundY - 2, 10, 2);
    setup.graphics.fill();

    setup.graphics.fillColor = STEM_COLOR;
    setup.graphics.rect(base.x - 1, groundY, 2, stemHeight);
    setup.graphics.fill();

    setup.graphics.fillColor = LEAF_COLOR;
    setup.graphics.rect(
      base.x - leafWidth,
      stemTop - leafHeight,
      leafWidth - 1,
      leafHeight,
    );
    setup.graphics.rect(
      base.x + 1,
      stemTop - leafHeight + 1,
      leafWidth - 1,
      leafHeight,
    );
    setup.graphics.fill();

    setup.graphics.fillColor = LEAF_HIGHLIGHT_COLOR;
    setup.graphics.rect(base.x - leafWidth + 1, stemTop - 2, 2, 1);
    setup.graphics.rect(base.x + 2, stemTop - 1, 2, 1);
    setup.graphics.fill();

    if (visualStage >= 1) {
      setup.graphics.fillColor = BUD_COLOR;
      const budSize = 3 + visualStage;
      setup.graphics.rect(
        base.x - Math.floor(budSize / 2),
        stemTop,
        budSize,
        budSize,
      );
      setup.graphics.fill();
    }
  }

  private getSetup(): CropViewSetup | null {
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
    warn('[CropView] Assign Source and Tiled Map on a UI_2D node.');
  }
}
