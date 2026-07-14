export interface WorldPoint {
  readonly x: number;
  readonly y: number;
}

export interface ActorBounds {
  readonly halfWidth: number;
  readonly halfHeight: number;
}

/** Finite, bottom-left-origin tile grid used by platform-independent collision rules. */
export interface TileCollisionMap {
  readonly width: number;
  readonly height: number;
  readonly tileWidth: number;
  readonly tileHeight: number;
  readonly origin: WorldPoint;
  isBlocked(tileX: number, tileY: number): boolean;
}

export interface GridMovementResult {
  readonly position: WorldPoint;
  readonly applied: WorldPoint;
  readonly collidedX: boolean;
  readonly collidedY: boolean;
}

interface AxisMovementResult {
  readonly position: WorldPoint;
  readonly collided: boolean;
}

const CONTACT_EPSILON = 1e-7;
const SWEEP_BINARY_ITERATIONS = 16;

/** Converts a bottom-left-origin collision row to Tiled's top-down row index. */
export function convertBottomTileYToTiledRow(tileY: number, mapHeight: number): number {
  return mapHeight - tileY - 1;
}

function hasValidMapGeometry(map: TileCollisionMap): boolean {
  return Number.isInteger(map.width) && map.width > 0 &&
    Number.isInteger(map.height) && map.height > 0 &&
    Number.isFinite(map.tileWidth) && map.tileWidth > 0 &&
    Number.isFinite(map.tileHeight) && map.tileHeight > 0 &&
    Number.isFinite(map.origin.x) && Number.isFinite(map.origin.y);
}

function hasValidBounds(bounds: ActorBounds): boolean {
  return Number.isFinite(bounds.halfWidth) && bounds.halfWidth > 0 &&
    Number.isFinite(bounds.halfHeight) && bounds.halfHeight > 0;
}

function isBlockedAtPosition(
  position: WorldPoint,
  bounds: ActorBounds,
  map: TileCollisionMap,
): boolean {
  const minimumTileX = Math.floor(
    (position.x - bounds.halfWidth - map.origin.x) / map.tileWidth,
  );
  const maximumTileX = Math.floor(
    (position.x + bounds.halfWidth - map.origin.x - CONTACT_EPSILON) / map.tileWidth,
  );
  const minimumTileY = Math.floor(
    (position.y - bounds.halfHeight - map.origin.y) / map.tileHeight,
  );
  const maximumTileY = Math.floor(
    (position.y + bounds.halfHeight - map.origin.y - CONTACT_EPSILON) / map.tileHeight,
  );

  if (
    minimumTileX < 0 || maximumTileX >= map.width ||
    minimumTileY < 0 || maximumTileY >= map.height
  ) {
    return true;
  }

  for (let tileY = minimumTileY; tileY <= maximumTileY; tileY += 1) {
    for (let tileX = minimumTileX; tileX <= maximumTileX; tileX += 1) {
      if (map.isBlocked(tileX, tileY)) {
        return true;
      }
    }
  }

  return false;
}

function moveAlongAxis(
  start: WorldPoint,
  amount: number,
  axis: 'x' | 'y',
  bounds: ActorBounds,
  map: TileCollisionMap,
): AxisMovementResult {
  if (amount === 0) {
    return { position: start, collided: false };
  }

  const maximumStep = Math.min(map.tileWidth, map.tileHeight) / 2;
  let position = start;
  let remaining = amount;

  while (Math.abs(remaining) > CONTACT_EPSILON) {
    const step = Math.sign(remaining) * Math.min(Math.abs(remaining), maximumStep);
    const candidate = axis === 'x'
      ? { x: position.x + step, y: position.y }
      : { x: position.x, y: position.y + step };

    if (!isBlockedAtPosition(candidate, bounds, map)) {
      position = candidate;
      remaining -= step;
      continue;
    }

    let safeFraction = 0;
    let blockedFraction = 1;
    for (let iteration = 0; iteration < SWEEP_BINARY_ITERATIONS; iteration += 1) {
      const fraction = (safeFraction + blockedFraction) / 2;
      const probe = axis === 'x'
        ? { x: position.x + step * fraction, y: position.y }
        : { x: position.x, y: position.y + step * fraction };

      if (isBlockedAtPosition(probe, bounds, map)) {
        blockedFraction = fraction;
      } else {
        safeFraction = fraction;
      }
    }

    position = axis === 'x'
      ? { x: position.x + step * safeFraction, y: position.y }
      : { x: position.x, y: position.y + step * safeFraction };
    return { position, collided: true };
  }

  return { position, collided: false };
}

/** Resolves a requested movement against a tile map, separating axes for wall sliding. */
export function resolveGridMovement(
  start: WorldPoint,
  requested: WorldPoint,
  bounds: ActorBounds,
  map: TileCollisionMap,
): GridMovementResult {
  const safeStart = {
    x: Number.isFinite(start.x) ? start.x : 0,
    y: Number.isFinite(start.y) ? start.y : 0,
  };
  const safeRequested = {
    x: Number.isFinite(requested.x) ? requested.x : 0,
    y: Number.isFinite(requested.y) ? requested.y : 0,
  };

  if (
    !hasValidMapGeometry(map) ||
    !hasValidBounds(bounds) ||
    isBlockedAtPosition(safeStart, bounds, map)
  ) {
    return {
      position: safeStart,
      applied: { x: 0, y: 0 },
      collidedX: safeRequested.x !== 0,
      collidedY: safeRequested.y !== 0,
    };
  }

  const horizontal = moveAlongAxis(
    safeStart,
    safeRequested.x,
    'x',
    bounds,
    map,
  );
  const vertical = moveAlongAxis(
    horizontal.position,
    safeRequested.y,
    'y',
    bounds,
    map,
  );

  return {
    position: vertical.position,
    applied: {
      x: vertical.position.x - safeStart.x,
      y: vertical.position.y - safeStart.y,
    },
    collidedX: horizontal.collided,
    collidedY: vertical.collided,
  };
}
