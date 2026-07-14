import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateBoundedCameraCenter,
  type CameraWorldBounds,
} from '../../assets/scripts/world/CameraBounds.ts';

const CENTERED_MAP: CameraWorldBounds = {
  minimumX: -480,
  maximumX: 480,
  minimumY: -480,
  maximumY: 480,
};

test('follows the target while the viewport remains inside the map', () => {
  assert.deepEqual(
    calculateBoundedCameraCenter(
      { x: 80, y: -120 },
      CENTERED_MAP,
      { width: 640, height: 360 },
    ),
    { x: 80, y: -120 },
  );
});

test('clamps the camera center at every map edge', () => {
  assert.deepEqual(
    calculateBoundedCameraCenter(
      { x: 500, y: 500 },
      CENTERED_MAP,
      { width: 640, height: 360 },
    ),
    { x: 160, y: 300 },
  );
  assert.deepEqual(
    calculateBoundedCameraCenter(
      { x: -500, y: -500 },
      CENTERED_MAP,
      { width: 640, height: 360 },
    ),
    { x: -160, y: -300 },
  );
});

test('uses the actual viewport width for wider screens', () => {
  assert.deepEqual(
    calculateBoundedCameraCenter(
      { x: 500, y: 0 },
      CENTERED_MAP,
      { width: 800, height: 360 },
    ),
    { x: 80, y: 0 },
  );
});

test('keeps an interior target centered after switching preview dimensions', () => {
  const target = { x: 40, y: -60 };

  assert.deepEqual(
    calculateBoundedCameraCenter(
      target,
      CENTERED_MAP,
      { width: 640, height: 360 },
    ),
    target,
  );
  assert.deepEqual(
    calculateBoundedCameraCenter(
      target,
      CENTERED_MAP,
      { width: 800, height: 360 },
    ),
    target,
  );
  assert.deepEqual(
    calculateBoundedCameraCenter(
      target,
      CENTERED_MAP,
      { width: 360, height: 800 },
    ),
    target,
  );
});

test('centers a map axis when the viewport is larger than that axis', () => {
  assert.deepEqual(
    calculateBoundedCameraCenter(
      { x: 100, y: -50 },
      {
        minimumX: -160,
        maximumX: 160,
        minimumY: -90,
        maximumY: 90,
      },
      { width: 640, height: 360 },
    ),
    { x: 0, y: 0 },
  );
});

test('supports map bounds offset by the Canvas world position', () => {
  assert.deepEqual(
    calculateBoundedCameraCenter(
      { x: 900, y: 900 },
      {
        minimumX: -160,
        maximumX: 800,
        minimumY: -300,
        maximumY: 660,
      },
      { width: 640, height: 360 },
    ),
    { x: 480, y: 480 },
  );
});
