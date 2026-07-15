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
import type { TileRectangleData } from '../data/GameDataTypes';
import type { FarmState } from './FarmState';
import type { FarmDayState } from './FarmDayCycle';
import { TiledTillingController } from './TiledTillingController';
import {
  createFarmableGroundPatches,
  createTilledSoilPatches,
  type TilledSoilPatch,
} from './TilledSoilProjection';
import { createWateredSoilPatches } from './WateredSoilProjection';

const { ccclass, property, requireComponent } = _decorator;

const FARMABLE_FILL_COLOR = new Color(157, 151, 91, 255);
const FARMABLE_OUTLINE_COLOR = new Color(119, 121, 70, 255);
const SOIL_FILL_COLOR = new Color(139, 92, 55, 255);
const SOIL_OUTLINE_COLOR = new Color(91, 58, 38, 255);
const FURROW_COLOR = new Color(111, 70, 42, 255);
const WET_SOIL_FILL_COLOR = new Color(85, 72, 63, 255);
const WET_SOIL_OUTLINE_COLOR = new Color(55, 50, 46, 255);
const WET_FURROW_COLOR = new Color(64, 86, 82, 255);
const WET_HIGHLIGHT_COLOR = new Color(125, 137, 123, 210);
const PATCH_INSET = 1;

interface SoilViewSetup {
  readonly source: TiledTillingController;
  readonly map: TiledMap;
  readonly mapTransform: UITransform;
  readonly viewTransform: UITransform;
  readonly graphics: Graphics;
  readonly grid: TileGridGeometry;
  readonly farmableArea: TileRectangleData;
}

/** Draws original placeholder soil patches from immutable farming state. */
@ccclass('TilledSoilView')
@requireComponent(Graphics)
export class TilledSoilView extends Component {
  @property({
    type: TiledTillingController,
    tooltip: 'Player TiledTillingController that owns the authoritative FarmState.',
  })
  public source: TiledTillingController | null = null;

  @property({
    type: TiledMap,
    tooltip: 'World TiledMap used to position soil patches.',
  })
  public tiledMap: TiledMap | null = null;

  private drawnFarm: FarmState | null = null;
  private drawnDay = 0;
  private didWarnMissingSetup = false;

  protected override onEnable(): void {
    this.drawnFarm = null;
    this.drawnDay = 0;
  }

  protected override onDisable(): void {
    this.getComponent(Graphics)?.clear();
    this.drawnFarm = null;
    this.drawnDay = 0;
    this.didWarnMissingSetup = false;
  }

  protected override lateUpdate(): void {
    const setup = this.getSetup();
    if (setup === null) {
      this.getComponent(Graphics)?.clear();
      this.drawnFarm = null;
      this.drawnDay = 0;
      this.warnMissingSetupOnce();
      return;
    }

    this.didWarnMissingSetup = false;
    const state = setup.source.farmDayState;
    if (state.farm === this.drawnFarm && state.currentDay === this.drawnDay) {
      return;
    }

    this.drawnFarm = state.farm;
    this.drawnDay = state.currentDay;
    this.redraw(setup, state);
  }

  private redraw(setup: SoilViewSetup, state: FarmDayState): void {
    const farmablePatches = createFarmableGroundPatches(
      setup.farmableArea,
      setup.grid,
    );
    const tilledPatches = createTilledSoilPatches(state.farm, setup.grid);
    const wateredPatches = createWateredSoilPatches(state, setup.grid);
    setup.graphics.clear();

    for (const patch of farmablePatches) {
      this.drawFarmablePatch(setup, patch);
    }
    for (const patch of tilledPatches) {
      this.drawTilledPatch(setup, patch);
    }
    for (const patch of wateredPatches) {
      this.drawWateredPatch(setup, patch);
    }
  }

  private getPatchRect(
    setup: SoilViewSetup,
    patch: TilledSoilPatch,
  ): {
    readonly left: number;
    readonly bottom: number;
    readonly width: number;
    readonly height: number;
  } {
    const mapCenter = new Vec3(
      patch.left + patch.width / 2,
      patch.bottom + patch.height / 2,
      0,
    );
    const worldCenter = setup.mapTransform.convertToWorldSpaceAR(mapCenter);
    const viewCenter = setup.viewTransform.convertToNodeSpaceAR(worldCenter);
    const left = viewCenter.x - patch.width / 2 + PATCH_INSET;
    const bottom = viewCenter.y - patch.height / 2 + PATCH_INSET;
    const width = patch.width - PATCH_INSET * 2;
    const height = patch.height - PATCH_INSET * 2;

    return { left, bottom, width, height };
  }

  private drawFarmablePatch(setup: SoilViewSetup, patch: TilledSoilPatch): void {
    const rect = this.getPatchRect(setup, patch);

    setup.graphics.fillColor = FARMABLE_FILL_COLOR;
    setup.graphics.rect(rect.left, rect.bottom, rect.width, rect.height);
    setup.graphics.fill();

    setup.graphics.strokeColor = FARMABLE_OUTLINE_COLOR;
    setup.graphics.lineWidth = 1;
    setup.graphics.rect(rect.left, rect.bottom, rect.width, rect.height);
    setup.graphics.stroke();
  }

  private drawTilledPatch(setup: SoilViewSetup, patch: TilledSoilPatch): void {
    const rect = this.getPatchRect(setup, patch);

    setup.graphics.fillColor = SOIL_FILL_COLOR;
    setup.graphics.rect(rect.left, rect.bottom, rect.width, rect.height);
    setup.graphics.fill();

    setup.graphics.strokeColor = SOIL_OUTLINE_COLOR;
    setup.graphics.lineWidth = 1;
    setup.graphics.rect(rect.left, rect.bottom, rect.width, rect.height);
    setup.graphics.stroke();

    setup.graphics.strokeColor = FURROW_COLOR;
    setup.graphics.lineWidth = 1;
    for (const ratio of [0.3, 0.5, 0.7]) {
      const furrowY = rect.bottom + rect.height * ratio;
      setup.graphics.moveTo(rect.left + 5, furrowY);
      setup.graphics.lineTo(rect.left + rect.width - 5, furrowY);
    }
    setup.graphics.stroke();
  }

  private drawWateredPatch(setup: SoilViewSetup, patch: TilledSoilPatch): void {
    const rect = this.getPatchRect(setup, patch);

    setup.graphics.fillColor = WET_SOIL_FILL_COLOR;
    setup.graphics.rect(rect.left, rect.bottom, rect.width, rect.height);
    setup.graphics.fill();

    setup.graphics.strokeColor = WET_SOIL_OUTLINE_COLOR;
    setup.graphics.lineWidth = 1;
    setup.graphics.rect(rect.left, rect.bottom, rect.width, rect.height);
    setup.graphics.stroke();

    setup.graphics.strokeColor = WET_FURROW_COLOR;
    for (const ratio of [0.3, 0.5, 0.7]) {
      const furrowY = rect.bottom + rect.height * ratio;
      setup.graphics.moveTo(rect.left + 5, furrowY);
      setup.graphics.lineTo(rect.left + rect.width - 5, furrowY);
    }
    setup.graphics.stroke();

    setup.graphics.strokeColor = WET_HIGHLIGHT_COLOR;
    setup.graphics.moveTo(rect.left + 6, rect.bottom + rect.height - 5);
    setup.graphics.lineTo(rect.left + 12, rect.bottom + rect.height - 5);
    setup.graphics.stroke();
  }

  private getSetup(): SoilViewSetup | null {
    const source = this.source;
    const map = this.tiledMap;
    const mapTransform = map?.getComponent(UITransform) ?? null;
    const viewTransform = this.getComponent(UITransform);
    const graphics = this.getComponent(Graphics);
    const farmableArea = source?.farmableArea ?? null;
    if (
      source === null || map === null || mapTransform === null ||
      viewTransform === null || graphics === null || farmableArea === null
    ) {
      return null;
    }

    const mapSize = map.getMapSize();
    const tileSize = map.getTileSize();
    return {
      source,
      map,
      mapTransform,
      viewTransform,
      graphics,
      farmableArea,
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
    warn('[TilledSoilView] Assign Source with maps data and Tiled Map on a UI_2D node.');
  }
}
