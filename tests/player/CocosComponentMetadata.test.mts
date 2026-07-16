import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const COMPONENT_URLS = [
  new URL('../../assets/scripts/player/PlayerPlaceholderView.ts', import.meta.url),
  new URL('../../assets/scripts/platform/KeyboardInputBridge.ts', import.meta.url),
  new URL('../../assets/scripts/world/TiledCollisionBridge.ts', import.meta.url),
  new URL('../../assets/scripts/world/BoundedCameraFollow.ts', import.meta.url),
  new URL('../../assets/scripts/world/ScreenTileMapper.ts', import.meta.url),
  new URL('../../assets/scripts/world/TileInteractionDebugView.ts', import.meta.url),
  new URL('../../assets/scripts/farming/TiledTillingController.ts', import.meta.url),
  new URL('../../assets/scripts/farming/TiledPlantingController.ts', import.meta.url),
  new URL('../../assets/scripts/farming/TilledSoilView.ts', import.meta.url),
  new URL('../../assets/scripts/farming/CropView.ts', import.meta.url),
  new URL('../../assets/scripts/farming/TiledSleepingController.ts', import.meta.url),
  new URL('../../assets/scripts/farming/SleepPointView.ts', import.meta.url),
  new URL('../../assets/scripts/ui/QuickbarView.ts', import.meta.url),
] as const;

test('keeps Creator 3.8.8 requireComponent metadata callable', async () => {
  const sources = await Promise.all(
    COMPONENT_URLS.map(async (url) => ({
      name: url.pathname.split('/').at(-1) ?? url.pathname,
      source: await readFile(url, 'utf8'),
    })),
  );

  for (const { name, source } of sources) {
    const usesArrayMetadata = /@requireComponent\s*\(\s*\[/.test(source);

    // Creator 3.8.8's scene panel uses this metadata as the RHS of instanceof.
    const requiredComponentMetadata = usesArrayMetadata
      ? []
      : class RequiredComponent {};

    assert.doesNotThrow(
      () => {
        void ({} instanceof requiredComponentMetadata);
      },
      `${name} requireComponent metadata must be callable by Creator's scene manager`,
    );
  }
});
