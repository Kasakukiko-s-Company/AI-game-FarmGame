import { _decorator, Component } from 'cc';
import {
  NEUTRAL_INPUT,
  type IInputService,
  type InputSnapshot,
} from '../platform/PlatformContracts';
import {
  calculatePlayerMovement,
  FacingDirection,
  type MovementVector,
} from './PlayerMovement';

const { ccclass, property } = _decorator;

export interface PlayerColliderBounds {
  readonly halfWidth: number;
  readonly halfHeight: number;
}

/** Seam implemented by world adapters so movement rules do not depend on Tiled or Cocos physics. */
export interface IPlayerCollisionService {
  resolveMovement(
    startWorld: MovementVector,
    requestedWorld: MovementVector,
    bounds: PlayerColliderBounds,
  ): MovementVector;
}

/** Applies semantic movement input to a node without listening to physical controls. */
@ccclass('PlayerController')
export class PlayerController extends Component {
  @property({ min: 1, step: 1, tooltip: 'Movement speed in logical pixels per second.' })
  public moveSpeed = 96;

  @property({ min: 1, step: 1, tooltip: 'Horizontal half-size of the player collision box.' })
  public collisionHalfWidth = 8;

  @property({ min: 1, step: 1, tooltip: 'Vertical half-size of the player collision box.' })
  public collisionHalfHeight = 11;

  private inputService: IInputService | null = null;
  private collisionService: IPlayerCollisionService | null = null;
  private currentFacing: FacingDirection = 'down';

  public get facing(): FacingDirection {
    return this.currentFacing;
  }

  public setInputService(inputService: IInputService): void {
    this.inputService = inputService;
  }

  public clearInputService(inputService: IInputService): void {
    if (this.inputService === inputService) {
      this.inputService = null;
    }
  }

  /** Exposes the shared semantic snapshot without leaking physical key codes. */
  public getInputSnapshot(): InputSnapshot {
    return this.inputService?.getSnapshot() ?? NEUTRAL_INPUT;
  }

  public setCollisionService(collisionService: IPlayerCollisionService): void {
    this.collisionService = collisionService;
  }

  public clearCollisionService(collisionService: IPlayerCollisionService): void {
    if (this.collisionService === collisionService) {
      this.collisionService = null;
    }
  }

  protected override update(deltaTime: number): void {
    if (this.inputService === null) {
      return;
    }

    const input = this.getInputSnapshot();
    const step = calculatePlayerMovement(
      input.moveX,
      input.moveY,
      this.currentFacing,
      this.moveSpeed,
      deltaTime,
    );

    this.currentFacing = step.facing;
    if (!step.isMoving || (step.displacement.x === 0 && step.displacement.y === 0)) {
      return;
    }

    const position = this.node.worldPosition;
    const displacement = this.collisionService?.resolveMovement(
      { x: position.x, y: position.y },
      step.displacement,
      {
        halfWidth: this.collisionHalfWidth,
        halfHeight: this.collisionHalfHeight,
      },
    ) ?? step.displacement;

    if (displacement.x === 0 && displacement.y === 0) {
      return;
    }

    this.node.setWorldPosition(
      position.x + displacement.x,
      position.y + displacement.y,
      position.z,
    );
  }
}
