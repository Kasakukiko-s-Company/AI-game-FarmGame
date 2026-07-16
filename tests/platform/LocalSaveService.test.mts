import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import type { LocalKeyValueStorage } from '../../assets/scripts/platform/PlatformAdapters.ts';
import { registerProjectTypeScriptResolver } from '../support/registerProjectTypeScriptResolver.mts';

registerProjectTypeScriptResolver();

const { LocalKeyValueSaveService } = await import(
  '../../assets/scripts/platform/PlatformAdapters.ts'
);

class FakeStorage implements LocalKeyValueStorage {
  public readonly values = new Map<string, string>();
  public failure: Error | null = null;

  public getItem(key: string): string | null {
    this.throwIfFailed();
    return this.values.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.throwIfFailed();
    this.values.set(key, value);
  }

  public removeItem(key: string): void {
    this.throwIfFailed();
    this.values.delete(key);
  }

  private throwIfFailed(): void {
    if (this.failure !== null) {
      throw this.failure;
    }
  }
}

test('persists opaque payloads under a stable namespace', async () => {
  const storage = new FakeStorage();
  const saves = new LocalKeyValueSaveService(storage, 'cloud-herb-garden');

  assert.deepEqual(await saves.read('autosave'), { status: 'missing' });
  assert.deepEqual(await saves.write('autosave', ''), { status: 'written' });
  assert.equal(storage.values.get('cloud-herb-garden:autosave'), '');
  assert.deepEqual(await saves.read('autosave'), {
    status: 'found',
    payload: '',
  });
  assert.deepEqual(await saves.remove('autosave'), { status: 'written' });
  assert.deepEqual(await saves.read('autosave'), { status: 'missing' });
});

test('returns explicit failures for invalid slots and storage exceptions', async () => {
  const storage = new FakeStorage();
  const saves = new LocalKeyValueSaveService(storage);

  assert.deepEqual(await saves.write('  ', 'payload'), {
    status: 'failed',
    message: 'save slot ID must not be empty',
  });

  storage.failure = new Error('quota denied');
  assert.deepEqual(await saves.read('autosave'), {
    status: 'failed',
    message: 'local save read failed: quota denied',
  });
  assert.deepEqual(await saves.write('autosave', 'payload'), {
    status: 'failed',
    message: 'local save write failed: quota denied',
  });
  assert.deepEqual(await saves.remove('autosave'), {
    status: 'failed',
    message: 'local save remove failed: quota denied',
  });
});

test('Cocos factory uses the engine storage surface instead of browser globals', async () => {
  const source = await readFile(
    new URL(
      '../../assets/scripts/platform/CocosLocalSaveService.ts',
      import.meta.url,
    ),
    'utf8',
  );

  assert.match(source, /sys\.localStorage/);
  assert.doesNotMatch(source, /\bwindow\s*\./);
  assert.doesNotMatch(source, /\bwx\s*\./);
});
