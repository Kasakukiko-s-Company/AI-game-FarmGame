import {
  _decorator,
  Color,
  Component,
  Graphics,
  Node,
  TiledMap,
  UITransform,
  Vec3,
  warn,
} from 'cc';
import { PlayerController } from '../player/PlayerController';
import {
  getFacingTile,
  tileToWorldCenter,
  type TileGridGeometry,
} from './TileInteraction';

const { ccclass, property, requireComponent } = _decorator;

const DEBUG_FILL_COLOR = new Color(241, 199, 92, 56);
const DEBUG_OUTLINE_COLOR = new Color(241, 199, 92, 255);

/** Draws a temporary one-tile highlight for the player's current interaction target. */
@ccclass('TileInteractionDebugView')
@requireComponent(Graphics)
export class TileInteractionDebugView extends Component {
  @property({ type: Node, tooltip: 'Player node whose position and facing select the tile.' })
  public target: Node | null = null;

  @property({ type: TiledMap, tooltip: 'TiledMap that defines the finite interaction grid.' })
  public tiledMap: TiledMap | null = null;

  private didWarnMissingSetup = false;

  protected override onDisable(): void {
    this.getComponent(Graphics)?.clear();
    this.didWarnMissingSetup = false;
  }

  protected override lateUpdate(): void {
    const setup = this.getSetup();
    if (setup === null) {
      this.getComponent(Graphics)?.clear();
      this.warnMissingSetupOnce();
      return;
    }

    this.didWarnMissingSetup = false;
    const mapSize = setup.map.getMapSize();
    const tileSize = setup.map.getTileSize();
    const grid: TileGridGeometry = {
      width: mapSize.width,
      height: mapSize.height,
      tileWidth: tileSize.width,
      tileHeight: tileSize.height,
      origin: {
        x: -setup.mapTransform.width * setup.mapTransform.anchorX,
        y: -setup.mapTransform.height * setup.mapTransform.anchorY,
      },
    };
    const playerLocal = setup.mapTransform.convertToNodeSpaceAR(
      setup.target.worldPosition,
    );
    const targetTile = getFacingTile(
      { x: playerLocal.x, y: playerLocal.y },
      setup.controller.facing,
      grid,
    );
    const targetCenter = targetTile === null
      ? null
      : tileToWorldCenter(targetTile, grid);

    setup.graphics.clear();
    if (targetCenter === null) {
      return;
    }

    const targetWorld = setup.mapTransform.convertToWorldSpaceAR(
      new Vec3(targetCenter.x, targetCenter.y, 0),
    );
    const targetLocal = setup.viewTransform.convertToNodeSpaceAR(targetWorld);
    const left = targetLocal.x - tileSize.width / 2;
    const bottom = targetLocal.y - tileSize.height / 2;

    setup.graphics.fillColor = DEBUG_FILL_COLOR;
    setup.graphics.rect(left, bottom, tileSize.width, tileSize.height);
    setup.graphics.fill();

    setup.graphics.strokeColor = DEBUG_OUTLINE_COLOR;
    setup.graphics.lineWidth = 2;
    setup.graphics.rect(left, bottom, tileSize.width, tileSize.height);
    setup.graphics.stroke();
  }

  private getSetup(): {
    readonly target: Node;
    readonly controller: PlayerController;
    readonly map: TiledMap;
    readonly mapTransform: UITransform;
    readonly viewTransform: UITransform;
    readonly graphics: Graphics;
  } | null {
    const target = this.target;
    const controller = target?.getComponent(PlayerController) ?? null;
    const map = this.tiledMap;
    const mapTransform = map?.getComponent(UITransform) ?? null;
    const viewTransform = this.getComponent(UITransform);
    const graphics = this.getComponent(Graphics);
    if (
      target === null || controller === null || map === null ||
      mapTransform === null || viewTransform === null || graphics === null
    ) {
      return null;
    }

    return { target, controller, map, mapTransform, viewTransform, graphics };
  }

  private warnMissingSetupOnce(): void {
    if (this.didWarnMissingSetup) {
      return;
    }

    this.didWarnMissingSetup = true;
    warn('[TileInteractionDebugView] Assign Target and Tiled Map on a UI_2D node.');
  }
}
