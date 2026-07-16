import { sys } from 'cc';
import type { ISaveService } from './PlatformContracts';
import { LocalKeyValueSaveService } from './PlatformAdapters';

/**
 * Creates the persistent local save adapter through Cocos' cross-platform
 * storage surface. Shared gameplay never touches browser or vendor globals.
 */
export function createCocosLocalSaveService(
  namespace = 'farm-game',
): ISaveService {
  return new LocalKeyValueSaveService(sys.localStorage, namespace);
}
