import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const PLACEHOLDER_VIEW_URL = new URL(
  '../../assets/scripts/player/PlayerPlaceholderView.ts',
  import.meta.url,
);

test('keeps Creator 3.8.8 requireComponent metadata callable', async () => {
  const source = await readFile(PLACEHOLDER_VIEW_URL, 'utf8');
  const usesArrayMetadata = /@requireComponent\s*\(\s*\[/.test(source);

  // Creator 3.8.8's scene panel uses this metadata as the RHS of instanceof.
  const requiredComponentMetadata = usesArrayMetadata
    ? []
    : class RequiredComponent {};

  assert.doesNotThrow(
    () => {
      void ({} instanceof requiredComponentMetadata);
    },
    "requireComponent metadata must be callable by Creator's scene manager",
  );
});
