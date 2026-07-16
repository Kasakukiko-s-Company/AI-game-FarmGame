import type { ISaveService } from '../../platform/PlatformContracts';
import {
  decodeSavePayload,
  encodeSavePayload,
  type SaveValidationCatalog,
} from './SaveCodec';
import {
  MVP_SAVE_SLOT_ID,
  type SaveData,
} from './SaveData';

export type WriteAutosaveResult =
  | { readonly status: 'saved' }
  | { readonly status: 'storage_failed'; readonly message: string };

export type ReadAutosaveResult =
  | { readonly status: 'loaded'; readonly save: SaveData }
  | { readonly status: 'missing' }
  | {
      readonly status: 'invalid_save';
      readonly reason: 'invalid_json' | 'invalid_data' | 'unsupported_version';
      readonly message: string;
    }
  | { readonly status: 'storage_failed'; readonly message: string };

export type RemoveAutosaveResult =
  | { readonly status: 'removed' }
  | { readonly status: 'storage_failed'; readonly message: string };

/** Writes the one MVP autosave slot while keeping JSON hidden from callers. */
export async function writeAutosave(
  saves: ISaveService,
  save: SaveData,
  validation: SaveValidationCatalog,
): Promise<WriteAutosaveResult> {
  const payload = encodeSavePayload(save, validation);
  const result = await saves.write(MVP_SAVE_SLOT_ID, payload);
  return result.status === 'written'
    ? { status: 'saved' }
    : { status: 'storage_failed', message: result.message };
}

/** Reads, parses and validates the one MVP autosave slot as one operation. */
export async function readAutosave(
  saves: ISaveService,
  validation: SaveValidationCatalog,
): Promise<ReadAutosaveResult> {
  const result = await saves.read(MVP_SAVE_SLOT_ID);
  if (result.status === 'missing') {
    return { status: 'missing' };
  }
  if (result.status === 'failed') {
    return { status: 'storage_failed', message: result.message };
  }

  const decoded = decodeSavePayload(result.payload, validation);
  if (decoded.status === 'decoded') {
    return { status: 'loaded', save: decoded.save };
  }
  return {
    status: 'invalid_save',
    reason: decoded.status,
    message: decoded.message,
  };
}

/** Removes the one MVP autosave slot without exposing its storage key. */
export async function removeAutosave(
  saves: ISaveService,
): Promise<RemoveAutosaveResult> {
  const result = await saves.remove(MVP_SAVE_SLOT_ID);
  return result.status === 'written'
    ? { status: 'removed' }
    : { status: 'storage_failed', message: result.message };
}
