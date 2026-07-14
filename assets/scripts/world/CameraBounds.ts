export interface CameraPoint {
  readonly x: number;
  readonly y: number;
}

export interface CameraViewportSize {
  readonly width: number;
  readonly height: number;
}

export interface CameraWorldBounds {
  readonly minimumX: number;
  readonly maximumX: number;
  readonly minimumY: number;
  readonly maximumY: number;
}

function resolveBoundedAxis(
  target: number,
  firstBound: number,
  secondBound: number,
  viewportExtent: number,
): number {
  if (!Number.isFinite(firstBound) || !Number.isFinite(secondBound)) {
    return Number.isFinite(target) ? target : 0;
  }

  const minimum = Math.min(firstBound, secondBound);
  const maximum = Math.max(firstBound, secondBound);
  const mapCenter = (minimum + maximum) / 2;
  const safeTarget = Number.isFinite(target) ? target : mapCenter;
  const safeViewportExtent = Number.isFinite(viewportExtent) && viewportExtent > 0
    ? viewportExtent
    : 0;
  const minimumCenter = minimum + safeViewportExtent / 2;
  const maximumCenter = maximum - safeViewportExtent / 2;

  if (minimumCenter >= maximumCenter) {
    return mapCenter;
  }

  return Math.min(Math.max(safeTarget, minimumCenter), maximumCenter);
}

/** Follows a target while keeping the full orthographic viewport inside finite map bounds. */
export function calculateBoundedCameraCenter(
  target: CameraPoint,
  bounds: CameraWorldBounds,
  viewport: CameraViewportSize,
): CameraPoint {
  return {
    x: resolveBoundedAxis(
      target.x,
      bounds.minimumX,
      bounds.maximumX,
      viewport.width,
    ),
    y: resolveBoundedAxis(
      target.y,
      bounds.minimumY,
      bounds.maximumY,
      viewport.height,
    ),
  };
}
