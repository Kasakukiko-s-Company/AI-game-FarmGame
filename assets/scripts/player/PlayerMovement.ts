export type FacingDirection = 'up' | 'down' | 'left' | 'right';

export interface MovementVector {
  readonly x: number;
  readonly y: number;
}

export interface PlayerMovementStep {
  readonly input: MovementVector;
  readonly displacement: MovementVector;
  readonly facing: FacingDirection;
  readonly isMoving: boolean;
}

function finiteOrZero(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

/** Preserves analog magnitude below one and caps diagonal/damaged input at unit length. */
export function normalizeMovementInput(moveX: number, moveY: number): MovementVector {
  const x = finiteOrZero(moveX);
  const y = finiteOrZero(moveY);
  const lengthSquared = x * x + y * y;

  if (lengthSquared === 0 || lengthSquared <= 1) {
    return { x, y };
  }

  const inverseLength = 1 / Math.sqrt(lengthSquared);
  return {
    x: x * inverseLength,
    y: y * inverseLength,
  };
}

/** Resolves four-direction facing while allowing speed-normalized diagonal travel. */
export function resolveFacing(
  input: MovementVector,
  currentFacing: FacingDirection,
): FacingDirection {
  if (input.x === 0 && input.y === 0) {
    return currentFacing;
  }

  if (Math.abs(input.x) > Math.abs(input.y)) {
    return input.x > 0 ? 'right' : 'left';
  }

  return input.y > 0 ? 'up' : 'down';
}

/** Computes one frame without depending on Cocos nodes or platform APIs. */
export function calculatePlayerMovement(
  moveX: number,
  moveY: number,
  currentFacing: FacingDirection,
  moveSpeed: number,
  deltaSeconds: number,
): PlayerMovementStep {
  const input = normalizeMovementInput(moveX, moveY);
  const safeSpeed = Number.isFinite(moveSpeed) && moveSpeed > 0 ? moveSpeed : 0;
  const safeDelta = Number.isFinite(deltaSeconds) && deltaSeconds > 0 ? deltaSeconds : 0;
  const distance = safeSpeed * safeDelta;

  return {
    input,
    displacement: {
      x: input.x * distance,
      y: input.y * distance,
    },
    facing: resolveFacing(input, currentFacing),
    isMoving: input.x !== 0 || input.y !== 0,
  };
}
