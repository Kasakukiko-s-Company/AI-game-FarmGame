import { _decorator, Component } from 'cc';
import type { IInputService } from '../platform/PlatformContracts';
import {
  calculatePlayerMovement,
  FacingDirection,
} from './PlayerMovement';

const { ccclass, property } = _decorator;

/** Applies semantic movement input to a node without listening to physical controls. */
@ccclass('PlayerController')
export class PlayerController extends Component {
  @property({ min: 1, step: 1, tooltip: 'Movement speed in logical pixels per second.' })
  public moveSpeed = 96;

  private inputService: IInputService | null = null;
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

  protected override update(deltaTime: number): void {
    if (this.inputService === null) {
      return;
    }

    const input = this.inputService.getSnapshot();
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

    const position = this.node.position;
    this.node.setPosition(
      position.x + step.displacement.x,
      position.y + step.displacement.y,
      position.z,
    );
  }
}
