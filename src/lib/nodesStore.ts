import { writable } from 'svelte/store';
import type { Node } from '@xyflow/svelte';

export const nodesStore = writable<Node[]>([]);

export interface Site {
  url: string;
  image: string;
  favicon: string;
}

export const sitesStore = writable<Site[]>([]);

// ── Layout constants (must match App.svelte) ──────────────────────────────────
const CARD_W = 340;
const CELL_W = 1200;
const CELL_H = 1000;
const PAD = 400;
const COLS = 8;
const ROWS = 7;
const CANVAS_W = COLS * CELL_W + PAD * 2;
const CANVAS_H = ROWS * CELL_H + PAD * 2;
const TITLE_CLEAR = 900;
const cx = CANVAS_W / 2;
const cy = CANVAS_H / 2;

function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function cellTooClose(col: number, row: number) {
  const cellCx = PAD + col * CELL_W + CELL_W / 2;
  const cellCy = PAD + row * CELL_H + CELL_H / 2;
  return Math.hypot(cellCx - cx, cellCy - cy) < TITLE_CLEAR;
}

const availableCells = Array.from({ length: COLS * ROWS }, (_, i) => ({
  col: i % COLS,
  row: Math.floor(i / COLS),
})).filter(c => !cellTooClose(c.col, c.row));

const titleNode: Node = {
  id: 'title',
  type: 'title',
  position: { x: CANVAS_W / 2, y: CANVAS_H / 2 - 400 },
  data: {},
  draggable: false,
  selectable: false,
};

export function buildNodesFromSites(sites: Site[]): Node[] {
  const r = mulberry32(0xdeadbeef);

  const tombstones: Node[] = sites.map((site, i) => {
    const cell = availableCells[i % availableCells.length];
    const jitterX = r() * (CELL_W - CARD_W);
    const jitterY = r() * (CELL_H - 460);
    return {
      id: String(i),
      type: 'tombstone',
      position: {
        x: PAD + cell.col * CELL_W + jitterX,
        y: PAD + cell.row * CELL_H + jitterY,
      },
      data: {
        image: site.image,
        favicon: site.favicon ?? '',
        name: site.url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('.')[0],
        radius: Math.round(60 + r() * 70),
      },
      draggable: false,
      selectable: false,
    };
  });

  const grass: Node[] = tombstones.flatMap((node, i) => {
    const patches = 6 + Math.floor(r() * 6);
    return Array.from({ length: patches }, (_, j) => {
      const angle = r() * Math.PI * 2;
      const dist = 80 + r() * 400;
      const count = 5 + Math.floor(r() * 5);
      const w = 60 + r() * 60;
      const blades: [number, number, number][] = Array.from({ length: count }, () => [
        r() * w, (r() - 0.5) * 20, 15 + r() * 20,
      ]);
      return {
        id: `grass-${i}-${j}`,
        type: 'grass',
        position: {
          x: node.position.x + Math.cos(angle) * dist,
          y: node.position.y + Math.sin(angle) * dist,
        },
        data: { blades, w, h: 40 },
        draggable: false,
        selectable: false,
      };
    });
  });

  return [titleNode, ...grass, ...tombstones];
}
