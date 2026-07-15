import assert from 'node:assert/strict';
import test from 'node:test';
import {
  updateTillingSession,
  type TillingSession,
} from '../../assets/scripts/farming/FarmState.ts';

const EMPTY_SESSION: TillingSession = {
  farm: {
    mapId: 'mvp_farm',
    tiles: [],
  },
  primaryActionHeld: false,
};

test('tills the facing farmable tile when primary action is first pressed', () => {
  const result = updateTillingSession(
    EMPTY_SESSION,
    true,
    { x: 5, y: 6 },
    () => true,
  );

  assert.deepEqual(result, {
    status: 'tilled',
    session: {
      farm: {
        mapId: 'mvp_farm',
        tiles: [
          {
            x: 5,
            y: 6,
            isTilled: true,
            wateredOnDay: null,
            crop: null,
          },
        ],
      },
      primaryActionHeld: true,
    },
  });
});

test('does not repeat while held and allows another action after release', () => {
  const firstPress = updateTillingSession(
    EMPTY_SESSION,
    true,
    { x: 5, y: 6 },
    () => true,
  );
  const heldOnNextTile = updateTillingSession(
    firstPress.session,
    true,
    { x: 6, y: 6 },
    () => true,
  );
  const released = updateTillingSession(
    heldOnNextTile.session,
    false,
    { x: 5, y: 6 },
    () => true,
  );
  const pressedAgain = updateTillingSession(
    released.session,
    true,
    { x: 5, y: 6 },
    () => true,
  );

  assert.deepEqual(
    {
      heldStatus: heldOnNextTile.status,
      heldTiles: heldOnNextTile.session.farm.tiles,
      releasedHeld: released.session.primaryActionHeld,
      pressedAgainStatus: pressedAgain.status,
      finalTiles: pressedAgain.session.farm.tiles,
    },
    {
      heldStatus: 'idle',
      heldTiles: [
        {
          x: 5,
          y: 6,
          isTilled: true,
          wateredOnDay: null,
          crop: null,
        },
      ],
      releasedHeld: false,
      pressedAgainStatus: 'already_tilled',
      finalTiles: [
        {
          x: 5,
          y: 6,
          isTilled: true,
          wateredOnDay: null,
          crop: null,
        },
      ],
    },
  );
});
