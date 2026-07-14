import {
  _decorator,
  Component,
  TiledLayer,
  TiledMap,
  UITransform,
  Vec3,
  warn,
} from 'cc';
import {
  type IPlayerCollisionService,
  type PlayerColliderBounds,
  PlayerController,
} from '../player/PlayerController';
import type { MovementVector } from '../player/PlayerMovement';
import {
  convertBottomTileYToTiledRow,
  resolveGridMovement,
  type TileCollisionMap,
} from './GridCollision';

const { ccclass, property, requireComponent } = _decorator;

/** Adapts a named Tiled blocking layer to the platform-independent grid rules. */
@ccclass('TiledCollisionBridge')
@requireComponent(PlayerController)
export class TiledCollisionBridge extends Component implements IPlayerCollisionService {
  @property({ type: TiledMap, tooltip: 'TiledMap component that owns the Blocking layer.' })
  public tiledMap: TiledMap | null = null;

  @property({ tooltip: 'Name of the invisible Tiled tile layer used for collision.' })
  public blockingLayerName = 'Blocking';

  private controller: PlayerController | null = null;
  private didWarnMissingSetup = false;

  protected override onEnable(): void {
    this.controller = this.getComponent(PlayerController);
    this.controller?.setCollisionService(this);
  }

  protected override onDisable(): void {
    this.controller?.clearCollisionService(this);
    this.controller = null;
  }

  public resolveMovement(
    startWorld: MovementVector,
    requestedWorld: MovementVector,
    bounds: PlayerColliderBounds,
  ): MovementVector {
    const setup = this.getCollisionSetup();
    if (setup === null) {
      this.warnMissingSetupOnce();
      return requestedWorld;
    }

    this.didWarnMissingSetup = false;
    const startWorldPoint = new Vec3(startWorld.x, startWorld.y, 0);
    const requestedWorldPoint = new Vec3(
      startWorld.x + requestedWorld.x,
      startWorld.y + requestedWorld.y,
      0,
    );
    const localStart = setup.transform.convertToNodeSpaceAR(startWorldPoint);
    const localEnd = setup.transform.convertToNodeSpaceAR(requestedWorldPoint);
    const mapSize = setup.map.getMapSize();
    const tileSize = setup.map.getTileSize();
    const collisionMap: TileCollisionMap = {
      width: mapSize.width,
      height: mapSize.height,
      tileWidth: tileSize.width,
      tileHeight: tileSize.height,
      origin: {
        x: -setup.transform.width * setup.transform.anchorX,
        y: -setup.transform.height * setup.transform.anchorY,
      },
      isBlocked: (tileX, tileY) => {
        const tiledY = convertBottomTileYToTiledRow(tileY, mapSize.height);
        return (setup.layer.getTileGIDAt(tileX, tiledY) ?? 0) > 0;
      },
    };
    const result = resolveGridMovement(
      { x: localStart.x, y: localStart.y },
      { x: localEnd.x - localStart.x, y: localEnd.y - localStart.y },
      bounds,
      collisionMap,
    );
    const resolvedWorld = setup.transform.convertToWorldSpaceAR(
      new Vec3(result.position.x, result.position.y, localStart.z),
    );

    return {
      x: resolvedWorld.x - startWorld.x,
      y: resolvedWorld.y - startWorld.y,
    };
  }

  private getCollisionSetup(): {
    readonly map: TiledMap;
    readonly layer: TiledLayer;
    readonly transform: UITransform;
  } | null {
    const map = this.tiledMap;
    const layer = map?.getLayer(this.blockingLayerName) ?? null;
    const transform = map?.getComponent(UITransform) ?? null;
    if (map === null || layer === null || transform === null) {
      return null;
    }

    return { map, layer, transform };
  }

  private warnMissingSetupOnce(): void {
    if (this.didWarnMissingSetup) {
      return;
    }

    this.didWarnMissingSetup = true;
    warn(
      `[TiledCollisionBridge] Assign a TiledMap containing layer "${this.blockingLayerName}".`,
    );
  }
}
