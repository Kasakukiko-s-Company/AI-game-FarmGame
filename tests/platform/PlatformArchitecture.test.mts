import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = fileURLToPath(new URL('../..', import.meta.url));
const CONTRACTS_SOURCE = path.join(
  PROJECT_ROOT,
  'assets',
  'scripts',
  'platform',
  'PlatformContracts.ts',
);
const COMPOSITION_SOURCE = path.join(
  PROJECT_ROOT,
  'assets',
  'scripts',
  'platform',
  'PlatformComposition.ts',
);
const SHARED_SCRIPT_DIRECTORIES = [
  'core',
  'data',
  'farming',
  'inventory',
  'player',
  'ui',
  'world',
] as const;

const FORBIDDEN_SHARED_DEPENDENCIES = [
  { label: 'WeChat global', pattern: /\bwx\s*\./u },
  { label: 'browser window global', pattern: /\bwindow\s*\./u },
  { label: 'browser localStorage', pattern: /\blocalStorage\b/u },
  { label: 'Steamworks native call', pattern: /\bSteamAPI_[A-Za-z0-9_]*\b/u },
  {
    label: 'Node filesystem import',
    pattern: /from\s+['"](?:node:)?fs(?:\/promises)?['"]/u,
  },
] as const;

async function listTypeScriptFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return listTypeScriptFiles(entryPath);
    }
    return entry.isFile() && entry.name.endsWith('.ts') ? [entryPath] : [];
  }));
  return nested.flat();
}

test('separates runtime identity from distribution channel', async () => {
  const source = await readFile(CONTRACTS_SOURCE, 'utf8');

  assert.match(source, /RuntimeKind\s*=\s*['"]windows-native['"]\s*\|\s*['"]wechat-minigame['"]/u);
  assert.match(source, /DistributionChannel\s*=\s*['"]steam['"]\s*\|\s*['"]standalone['"]\s*\|\s*['"]wechat['"]/u);
  assert.match(source, /runtime:\s*['"]windows-native['"][\s\S]*?distribution:\s*WindowsDistributionChannel/u);
  assert.match(source, /runtime:\s*['"]wechat-minigame['"][\s\S]*?distribution:\s*['"]wechat['"]/u);
});

test('composition root maps both release targets and requires input plus saves', async () => {
  const source = await readFile(COMPOSITION_SOURCE, 'utf8');

  assert.match(
    source,
    /PlatformBuildTarget[\s\S]*?kind:\s*['"]steam-windows['"][\s\S]*?kind:\s*['"]wechat-minigame['"]/u,
  );
  assert.match(
    source,
    /PlatformAdapterSet[\s\S]*?readonly\s+saves:\s*ISaveService[\s\S]*?readonly\s+input:\s*IInputService/u,
  );
  assert.match(source, /new\s+DesktopPlatformService\(\s*['"]steam['"]\s*\)/u);
  assert.match(source, /new\s+WeChatPlatformService\(\s*target\.safeArea\s*\)/u);
  assert.doesNotMatch(
    source,
    /MemorySaveService/u,
    'Release composition must never default to in-memory saves.',
  );
});

test('keeps vendor globals and filesystem imports out of shared game modules', async () => {
  const violations: string[] = [];

  for (const directoryName of SHARED_SCRIPT_DIRECTORIES) {
    const directory = path.join(PROJECT_ROOT, 'assets', 'scripts', directoryName);
    const files = await listTypeScriptFiles(directory);
    for (const file of files) {
      const source = await readFile(file, 'utf8');
      for (const dependency of FORBIDDEN_SHARED_DEPENDENCIES) {
        if (dependency.pattern.test(source)) {
          violations.push(`${path.relative(PROJECT_ROOT, file)}: ${dependency.label}`);
        }
      }
    }
  }

  assert.deepEqual(
    violations,
    [],
    `Platform-specific dependencies crossed the platform seam:\n${violations.join('\n')}`,
  );
});
