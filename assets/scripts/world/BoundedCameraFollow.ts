import {
  _decorator,
  Camera,
  Component,
  Node,
  TiledMap,
  UITransform,
  Vec3,
  warn,
} from 'cc';
import {
  calculateBoundedCameraCenter,
  type CameraWorldBounds,
} from './CameraBounds';

const { ccclass, property, requireComponent } = _decorator;

/** Follows a target after movement while keeping the orthographic view inside the Tiled map. */
@ccclass('BoundedCameraFollow')
@requireComponent(Camera)
export class BoundedCameraFollow extends Component {
  @property({ type: Node, tooltip: 'World-space node followed by this camera.' })
  public target: Node | null = null;

  @property({ type: TiledMap, tooltip: 'TiledMap whose world bounds constrain the camera.' })
  public tiledMap: TiledMap | null = null;

  private camera: Camera | null = null;
  private didWarnMissingSetup = false;

  protected override onEnable(): void {
    this.camera = this.getComponent(Camera);
  }

  protected override onDisable(): void {
    this.camera = null;
  }

  protected override lateUpdate(): void {
    const setup = this.getFollowSetup();
    if (setup === null) {
      this.warnMissingSetupOnce();
      return;
    }

    const aspect = setup.camera.camera.aspect;
    const viewportHeight = setup.camera.orthoHeight * 2;
    const viewportWidth = viewportHeight * aspect;
    if (
      !Number.isFinite(viewportWidth) || viewportWidth <= 0 ||
      !Number.isFinite(viewportHeight) || viewportHeight <= 0
    ) {
      this.warnMissingSetupOnce();
      return;
    }

    this.didWarnMissingSetup = false;
    const targetPosition = setup.target.worldPosition;
    const cameraCenter = calculateBoundedCameraCenter(
      { x: targetPosition.x, y: targetPosition.y },
      this.calculateWorldBounds(setup.transform),
      { width: viewportWidth, height: viewportHeight },
    );
    const currentPosition = this.node.worldPosition;
    this.node.setWorldPosition(cameraCenter.x, cameraCenter.y, currentPosition.z);
  }

  private getFollowSetup(): {
    readonly camera: Camera;
    readonly target: Node;
    readonly transform: UITransform;
  } | null {
    const camera = this.camera;
    const target = this.target;
    const transform = this.tiledMap?.getComponent(UITransform) ?? null;
    if (camera === null || target === null || transform === null) {
      return null;
    }

    return { camera, target, transform };
  }

  private calculateWorldBounds(transform: UITransform): CameraWorldBounds {
    const minimumLocalX = -transform.width * transform.anchorX;
    const maximumLocalX = transform.width * (1 - transform.anchorX);
    const minimumLocalY = -transform.height * transform.anchorY;
    const maximumLocalY = transform.height * (1 - transform.anchorY);
    const corners = [
      transform.convertToWorldSpaceAR(new Vec3(minimumLocalX, minimumLocalY, 0)),
      transform.convertToWorldSpaceAR(new Vec3(minimumLocalX, maximumLocalY, 0)),
      transform.convertToWorldSpaceAR(new Vec3(maximumLocalX, minimumLocalY, 0)),
      transform.convertToWorldSpaceAR(new Vec3(maximumLocalX, maximumLocalY, 0)),
    ];

    return {
      minimumX: Math.min(...corners.map((corner) => corner.x)),
      maximumX: Math.max(...corners.map((corner) => corner.x)),
      minimumY: Math.min(...corners.map((corner) => corner.y)),
      maximumY: Math.max(...corners.map((corner) => corner.y)),
    };
  }

  private warnMissingSetupOnce(): void {
    if (this.didWarnMissingSetup) {
      return;
    }

    this.didWarnMissingSetup = true;
    warn('[BoundedCameraFollow] Assign Target and Tiled Map on a Camera node.');
  }
}
