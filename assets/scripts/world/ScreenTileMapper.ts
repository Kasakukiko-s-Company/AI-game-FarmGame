import {
  _decorator,
  Camera,
  Component,
  TiledMap,
  UITransform,
  Vec3,
  warn,
} from 'cc';
import {
  worldToTile,
  type TileCoordinate,
  type TileGridGeometry,
} from './TileInteraction';

const { ccclass, property, requireComponent } = _decorator;

/** Raw game-window coordinates from Cocos pointer event getLocation(). */
export interface GameScreenPoint {
  readonly x: number;
  readonly y: number;
}

/** Maps raw Cocos game-screen coordinates to the finite bottom-left-origin tile grid. */
@ccclass('ScreenTileMapper')
@requireComponent(Camera)
export class ScreenTileMapper extends Component {
  @property({ type: TiledMap, tooltip: 'TiledMap whose grid should receive pointer input.' })
  public tiledMap: TiledMap | null = null;

  private readonly screenPosition = new Vec3();
  private readonly worldPosition = new Vec3();
  private readonly mapLocalPosition = new Vec3();
  private didWarnMissingSetup = false;

  protected override onDisable(): void {
    this.didWarnMissingSetup = false;
  }

  /** Converts a raw touch or mouse game-screen location, returning null outside the map. */
  public screenToTile(screenPoint: GameScreenPoint): TileCoordinate | null {
    if (!Number.isFinite(screenPoint.x) || !Number.isFinite(screenPoint.y)) {
      return null;
    }

    const setup = this.getSetup();
    if (setup === null) {
      this.warnMissingSetupOnce();
      return null;
    }

    this.didWarnMissingSetup = false;
    this.screenPosition.set(screenPoint.x, screenPoint.y, 0);
    setup.camera.screenToWorld(this.screenPosition, this.worldPosition);
    setup.mapTransform.convertToNodeSpaceAR(this.worldPosition, this.mapLocalPosition);

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

    return worldToTile(
      { x: this.mapLocalPosition.x, y: this.mapLocalPosition.y },
      grid,
    );
  }

  private getSetup(): {
    readonly camera: Camera;
    readonly map: TiledMap;
    readonly mapTransform: UITransform;
  } | null {
    const camera = this.getComponent(Camera);
    const map = this.tiledMap;
    const mapTransform = map?.getComponent(UITransform) ?? null;
    if (camera === null || map === null || mapTransform === null) {
      return null;
    }

    return { camera, map, mapTransform };
  }

  private warnMissingSetupOnce(): void {
    if (this.didWarnMissingSetup) {
      return;
    }

    this.didWarnMissingSetup = true;
    warn('[ScreenTileMapper] Add this component to Camera and assign Tiled Map.');
  }
}
