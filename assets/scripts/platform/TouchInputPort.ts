import type { IInputService, InputSnapshot } from './PlatformContracts';
import { NEUTRAL_INPUT } from './PlatformContracts';

function clampAxis(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(-1, Math.min(1, value));
}

/** Semantic endpoint for a future virtual joystick; it does not listen to raw touches. */
export class TouchInputPort implements IInputService {
  private moveX = 0;
  private moveY = 0;

  public setMoveVector(moveX: number, moveY: number): void {
    this.moveX = clampAxis(moveX);
    this.moveY = clampAxis(moveY);
  }

  public releaseMovement(): void {
    this.moveX = 0;
    this.moveY = 0;
  }

  public getSnapshot(): InputSnapshot {
    return {
      ...NEUTRAL_INPUT,
      moveX: this.moveX,
      moveY: this.moveY,
    };
  }
}
