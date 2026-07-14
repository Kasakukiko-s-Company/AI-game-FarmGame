import {
  _decorator,
  Color,
  Component,
  EventMouse,
  EventTouch,
  Graphics,
  input,
  Input,
  Node,
  TiledMap,
  UITransform,
  Vec2,
  Vec3,
  warn,
} from 'cc';
import { PlayerController } from '../player/PlayerController';
import { ScreenTileMapper } from './ScreenTileMapper';
import {
  getFacingTile,
  tileToWorldCenter,
  type TileCoordinate,
  type TileGridGeometry,
} from './TileInteraction';

const { ccclass, property, requireComponent } = _decorator;

const DEBUG_FILL_COLOR = new Color(241, 199, 92, 56);
const DEBUG_OUTLINE_COLOR = new Color(241, 199, 92, 255);
const POINTER_FILL_COLOR = new Color(83, 188, 255, 56);
const POINTER_OUTLINE_COLOR = new Color(83, 188, 255, 255);

interface DebugViewSetup {
  readonly target: Node;
  readonly controller: PlayerController;
  readonly map: TiledMap;
  readonly mapTransform: UITransform;
  readonly viewTransform: UITransform;
  readonly graphics: Graphics;
}

/** Draws a temporary one-tile highlight for the player's current interaction target. */
@ccclass('TileInteractionDebugView')
@requireComponent(Graphics)
export class TileInteractionDebugView extends Component {
  @property({ type: Node, tooltip: 'Player node whose position and facing select the tile.' })
  public target: Node | null = null;

  @property({ type: TiledMap, tooltip: 'TiledMap that defines the finite interaction grid.' })
  public tiledMap: TiledMap | null = null;

  @property({ type: ScreenTileMapper, tooltip: 'Optional screen/touch mapper for pointer debug.' })
  public screenTileMapper: ScreenTileMapper | null = null;

  private didWarnMissingSetup = false;
  private pointerTile: TileCoordinate | null = null;
  private readonly pointerLocation = new Vec2();

  protected override onEnable(): void {
    input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
  }

  protected override onDisable(): void {
    input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    this.getComponent(Graphics)?.clear();
    this.pointerTile = null;
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

    setup.graphics.clear();
    this.drawTile(setup, grid, targetTile, DEBUG_FILL_COLOR, DEBUG_OUTLINE_COLOR);
    this.drawTile(setup, grid, this.pointerTile, POINTER_FILL_COLOR, POINTER_OUTLINE_COLOR);
  }

  private readonly onTouchEnd = (event: EventTouch): void => {
    this.updatePointerTile(event.getLocation(this.pointerLocation));
  };

  private readonly onMouseUp = (event: EventMouse): void => {
    this.updatePointerTile(event.getLocation(this.pointerLocation));
  };

  private updatePointerTile(screenPoint: Vec2): void {
    this.pointerTile = this.screenTileMapper?.screenToTile(screenPoint) ?? null;
  }

  private drawTile(
    setup: DebugViewSetup,
    grid: TileGridGeometry,
    tile: TileCoordinate | null,
    fillColor: Color,
    outlineColor: Color,
  ): void {
    if (tile === null) {
      return;
    }

    const targetCenter = tileToWorldCenter(tile, grid);
    if (targetCenter === null) {
      return;
    }

    const tileSize = setup.map.getTileSize();
    const targetWorld = setup.mapTransform.convertToWorldSpaceAR(
      new Vec3(targetCenter.x, targetCenter.y, 0),
    );
    const targetLocal = setup.viewTransform.convertToNodeSpaceAR(targetWorld);
    const left = targetLocal.x - tileSize.width / 2;
    const bottom = targetLocal.y - tileSize.height / 2;

    setup.graphics.fillColor = fillColor;
    setup.graphics.rect(left, bottom, tileSize.width, tileSize.height);
    setup.graphics.fill();

    setup.graphics.strokeColor = outlineColor;
    setup.graphics.lineWidth = 2;
    setup.graphics.rect(left, bottom, tileSize.width, tileSize.height);
    setup.graphics.stroke();
  }

  private getSetup(): DebugViewSetup | null {
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
