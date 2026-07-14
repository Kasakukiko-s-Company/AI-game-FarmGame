import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculatePlayerMovement,
  normalizeMovementInput,
  resolveFacing,
} from '../../assets/scripts/player/PlayerMovement.ts';

const EPSILON = 1e-9;

function assertApproximately(actual: number, expected: number): void {
  assert.ok(
    Math.abs(actual - expected) <= EPSILON,
    `Expected ${actual} to be approximately ${expected}`,
  );
}

test('normalizes diagonal keyboard movement to unit length', () => {
  const input = normalizeMovementInput(1, 1);

  assertApproximately(Math.hypot(input.x, input.y), 1);
  assertApproximately(input.x, Math.SQRT1_2);
  assertApproximately(input.y, Math.SQRT1_2);
});

test('preserves analog movement below unit length', () => {
  assert.deepEqual(normalizeMovementInput(0.25, -0.5), { x: 0.25, y: -0.5 });
});

test('caps oversized and non-finite movement input safely', () => {
  assert.deepEqual(normalizeMovementInput(Number.NaN, Number.POSITIVE_INFINITY), { x: 0, y: 0 });
  const oversized = normalizeMovementInput(5, 0);
  assert.deepEqual(oversized, { x: 1, y: 0 });
});

test('moves at configured speed without a diagonal speed boost', () => {
  const cardinal = calculatePlayerMovement(1, 0, 'down', 96, 0.5);
  const diagonal = calculatePlayerMovement(1, 1, 'down', 96, 0.5);

  assertApproximately(Math.hypot(cardinal.displacement.x, cardinal.displacement.y), 48);
  assertApproximately(Math.hypot(diagonal.displacement.x, diagonal.displacement.y), 48);
});

test('updates four-direction facing from the dominant axis', () => {
  assert.equal(resolveFacing({ x: -1, y: 0.2 }, 'down'), 'left');
  assert.equal(resolveFacing({ x: 0.2, y: 1 }, 'left'), 'up');
  assert.equal(resolveFacing({ x: 1, y: -1 }, 'up'), 'down');
});

test('keeps the last facing after movement stops', () => {
  const moving = calculatePlayerMovement(-1, 0, 'down', 96, 1 / 60);
  const stopped = calculatePlayerMovement(0, 0, moving.facing, 96, 1 / 60);

  assert.equal(moving.facing, 'left');
  assert.equal(stopped.facing, 'left');
  assert.equal(stopped.isMoving, false);
  assert.deepEqual(stopped.displacement, { x: 0, y: 0 });
});

test('does not move for invalid speed or delta time', () => {
  assert.deepEqual(
    calculatePlayerMovement(1, 0, 'down', -1, 1).displacement,
    { x: 0, y: 0 },
  );
  assert.deepEqual(
    calculatePlayerMovement(1, 0, 'down', 96, -1).displacement,
    { x: 0, y: 0 },
  );
});
