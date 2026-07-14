import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const TILE_SIZE = 32;
const MAP_WIDTH = 30;
const MAP_HEIGHT = 30;
const BLOCKING_COLUMN_X = 18;
const BLOCKING_ROWS = new Set([13, 14, 15, 16]);

type RgbaColor = readonly [number, number, number, number];

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(toolDirectory, '..');
const mapDirectory = path.join(projectRoot, 'assets', 'maps');
const tiledSourceDirectory = path.join(projectRoot, 'temp', 'stage3-tiled');

function calculateCrc32(data: Uint8Array): number {
  let crc = 0xffffffff;

  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function createPngChunk(type: string, data: Uint8Array): Buffer {
  const typeBytes = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(
    calculateCrc32(Buffer.concat([typeBytes, Buffer.from(data)])),
    0,
  );

  return Buffer.concat([length, typeBytes, Buffer.from(data), crc]);
}

function createTilePng(resolveColor: (x: number, y: number) => RgbaColor): Buffer {
  const bytesPerRow = 1 + TILE_SIZE * 4;
  const scanlines = Buffer.alloc(bytesPerRow * TILE_SIZE);

  for (let y = 0; y < TILE_SIZE; y += 1) {
    const rowOffset = y * bytesPerRow;
    scanlines[rowOffset] = 0;

    for (let x = 0; x < TILE_SIZE; x += 1) {
      const color = resolveColor(x, y);
      const pixelOffset = rowOffset + 1 + x * 4;
      scanlines[pixelOffset] = color[0];
      scanlines[pixelOffset + 1] = color[1];
      scanlines[pixelOffset + 2] = color[2];
      scanlines[pixelOffset + 3] = color[3];
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(TILE_SIZE, 0);
  header.writeUInt32BE(TILE_SIZE, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    createPngChunk('IHDR', header),
    createPngChunk('IDAT', deflateSync(scanlines, { level: 9 })),
    createPngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function createGroundTilePng(): Buffer {
  const base = [92, 139, 99, 255] as const;
  const light = [113, 159, 112, 255] as const;
  const dark = [69, 115, 80, 255] as const;

  return createTilePng((x, y) => {
    const isInterior = x >= 2 && x <= 29 && y >= 2 && y <= 29;
    return isInterior && (x * 13 + y * 7) % 113 === 0
      ? light
      : isInterior && (x * 5 + y * 11) % 181 === 0
        ? dark
        : base;
  });
}

function createStoneTilePng(): Buffer {
  const outline = [58, 65, 67, 255] as const;
  const base = [104, 112, 106, 255] as const;
  const light = [137, 146, 132, 255] as const;
  const shadow = [78, 88, 84, 255] as const;

  return createTilePng((x, y) => {
    if (x <= 1 || x >= 30 || y <= 1 || y >= 30) {
      return outline;
    }
    if ((x + y * 3) % 19 === 0) {
      return light;
    }
    if ((x * 5 + y * 7) % 23 === 0) {
      return shadow;
    }
    return base;
  });
}

function createBlockingLayerData(): number[] {
  return Array.from({ length: MAP_WIDTH * MAP_HEIGHT }, (_, index) => {
    const x = index % MAP_WIDTH;
    const y = Math.floor(index / MAP_WIDTH);
    return x === BLOCKING_COLUMN_X && BLOCKING_ROWS.has(y) ? 2 : 0;
  });
}

function createTiledJsonMap(): object {
  const blockingLayerData = createBlockingLayerData();

  return {
    compressionlevel: -1,
    height: MAP_HEIGHT,
    infinite: false,
    layers: [
      {
        data: Array.from({ length: MAP_WIDTH * MAP_HEIGHT }, () => 1),
        height: MAP_HEIGHT,
        id: 1,
        name: 'Ground',
        opacity: 1,
        type: 'tilelayer',
        visible: true,
        width: MAP_WIDTH,
        x: 0,
        y: 0,
      },
      {
        data: blockingLayerData,
        height: MAP_HEIGHT,
        id: 2,
        name: 'Obstacles',
        opacity: 1,
        type: 'tilelayer',
        visible: true,
        width: MAP_WIDTH,
        x: 0,
        y: 0,
      },
      {
        data: blockingLayerData,
        height: MAP_HEIGHT,
        id: 3,
        name: 'Blocking',
        opacity: 1,
        type: 'tilelayer',
        visible: false,
        width: MAP_WIDTH,
        x: 0,
        y: 0,
      },
    ],
    nextlayerid: 4,
    nextobjectid: 1,
    orientation: 'orthogonal',
    renderorder: 'right-down',
    tiledversion: '1.12.2',
    tilesets: [
      {
        columns: 1,
        firstgid: 1,
        image: '../../assets/maps/mvp_farm_ground.png',
        imageheight: TILE_SIZE,
        imagewidth: TILE_SIZE,
        margin: 0,
        name: 'mvp_farm_tiles',
        spacing: 0,
        tilecount: 1,
        tileheight: TILE_SIZE,
        tilewidth: TILE_SIZE,
      },
      {
        columns: 1,
        firstgid: 2,
        image: '../../assets/maps/mvp_farm_stone.png',
        imageheight: TILE_SIZE,
        imagewidth: TILE_SIZE,
        margin: 0,
        name: 'mvp_farm_stone',
        spacing: 0,
        tilecount: 1,
        tileheight: TILE_SIZE,
        tilewidth: TILE_SIZE,
      },
    ],
    tileheight: TILE_SIZE,
    tilewidth: TILE_SIZE,
    type: 'map',
    version: '1.10',
    width: MAP_WIDTH,
  };
}

await mkdir(mapDirectory, { recursive: true });
await mkdir(tiledSourceDirectory, { recursive: true });

const tilePath = path.join(mapDirectory, 'mvp_farm_ground.png');
const stoneTilePath = path.join(mapDirectory, 'mvp_farm_stone.png');
const sourceMapPath = path.join(tiledSourceDirectory, 'mvp_farm.tmj');

await writeFile(tilePath, createGroundTilePng());
await writeFile(stoneTilePath, createStoneTilePng());
await writeFile(
  sourceMapPath,
  `${JSON.stringify(createTiledJsonMap(), null, 2)}\n`,
  'utf8',
);

process.stdout.write(`Generated ${tilePath}\n`);
process.stdout.write(`Generated ${stoneTilePath}\n`);
process.stdout.write(`Generated ${sourceMapPath}\n`);
