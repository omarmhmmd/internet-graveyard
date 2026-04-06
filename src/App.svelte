<script lang="ts">
  import { onMount } from 'svelte';
  import Panzoom from '@panzoom/panzoom';
  import Tombstone from './lib/Tombstone.svelte';
  import { sites } from './lib/sites';
  import { Button } from '$lib/components/ui/button';
  import { Separator } from '$lib/components/ui/separator';

  const CARD_W = 340;
  const CARD_H = 460;
  const CELL_W = 1200;
  const CELL_H = 1000;
  const PAD = 400;
  const COLS = 8;
  const ROWS = 7;
  const CANVAS_W = COLS * CELL_W + PAD * 2;
  const CANVAS_H = ROWS * CELL_H + PAD * 2;
  const MINIMAP_W = 200;
  const MINIMAP_H = Math.round(MINIMAP_W * CANVAS_H / CANVAS_W);

  // Exclude cells too close to the canvas center (where the title sits)
  const TITLE_CLEAR = 900; // px radius around center to keep clear
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;

  function cellTooClose(col: number, row: number) {
    const cellCx = PAD + col * CELL_W + CELL_W / 2;
    const cellCy = PAD + row * CELL_H + CELL_H / 2;
    return Math.hypot(cellCx - cx, cellCy - cy) < TITLE_CLEAR;
  }

  // Build ordered list of cells, skipping those near center
  const availableCells = Array.from({ length: COLS * ROWS }, (_, i) => ({
    col: i % COLS,
    row: Math.floor(i / COLS),
  })).filter(c => !cellTooClose(c.col, c.row));

  const positions = sites.map((_, i) => {
    const cell = availableCells[i % availableCells.length];
    const jitterX = Math.random() * (CELL_W - CARD_W);
    const jitterY = Math.random() * (CELL_H - CARD_H);
    return {
      x: PAD + cell.col * CELL_W + jitterX,
      y: PAD + cell.row * CELL_H + jitterY,
    };
  });

  let canvasEl: HTMLDivElement;
  let panzoom: ReturnType<typeof Panzoom>;
  let isPanning = false;
  let pointerMoved = false;

  function focusTombstone(x: number, y: number) {
    const targetScale = 1.2;
    const cx = x + CARD_W / 2;
    const cy = y + CARD_H / 2;
    const tx = window.innerWidth / 2 - cx * targetScale;
    const ty = window.innerHeight / 2 - cy * targetScale;

    // Animate via CSS transition, then sync panzoom state
    canvasEl.style.transition = 'transform 0.45s cubic-bezier(0.4,0,0.2,1)';
    canvasEl.style.transform = `matrix(${targetScale},0,0,${targetScale},${tx},${ty})`;

    setTimeout(() => {
      canvasEl.style.transition = '';
      panzoom.zoom(targetScale, { force: true });
      panzoom.pan(tx, ty, { force: true });
      updateMinimap();
    }, 450);
  }

  // Minimap viewport state
  let vx = $state(0);
  let vy = $state(0);
  let vw = $state(MINIMAP_W);
  let vh = $state(MINIMAP_H);

  function updateMinimap(x?: number, y?: number, scale?: number) {
    const pan = panzoom.getPan();
    const px = x ?? pan.x;
    const py = y ?? pan.y;
    const ps = scale ?? panzoom.getScale();
    const ratioX = MINIMAP_W / CANVAS_W;
    const ratioY = MINIMAP_H / CANVAS_H;
    vw = (window.innerWidth / ps) * ratioX;
    vh = (window.innerHeight / ps) * ratioY;
    vx = (-px / ps) * ratioX;
    vy = (-py / ps) * ratioY;
  }

  onMount(() => {
    panzoom = Panzoom(canvasEl, {
      maxScale: 2,
      minScale: 0.2,
      cursor: 'default',
      step: 0.1,
      startX: -(CANVAS_W / 2) + window.innerWidth / 2,
      startY: -(CANVAS_H / 2) + window.innerHeight / 2,
    });

    canvasEl.parentElement!.addEventListener('wheel', (e) => {
      panzoom.zoomWithWheel(e);
    }, { passive: false });

    canvasEl.addEventListener('panzoomchange', (e: any) => {
      const { x, y, scale } = e.detail;
      updateMinimap(x, y, scale);
    });
    updateMinimap();

    return () => panzoom.destroy();
  });

  function minimapClick(e: MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mx = (e.clientX - rect.left) / MINIMAP_W;
    const my = (e.clientY - rect.top) / MINIMAP_H;
    const scale = panzoom.getScale();
    const tx = -(mx * CANVAS_W * scale) + window.innerWidth / 2;
    const ty = -(my * CANVAS_H * scale) + window.innerHeight / 2;
    panzoom.pan(tx, ty, { animate: true });
    updateMinimap();
  }
</script>

<div
  style="width:100vw;height:100vh;overflow:hidden;background:#d4d4d4;"
  on:mousedown={(e) => { if (e.button === 0) canvasEl.style.cursor = 'grabbing'; }}
  on:mouseup={() => { canvasEl.style.cursor = 'grab'; }}
>
  <div
    bind:this={canvasEl}
    style="position:relative;width:{CANVAS_W}px;height:{CANVAS_H}px;cursor:grab;background-color:#d4d4d4;background-image:url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='6' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.4 0 0 0 0 0.4 0 0 0 0 0.4 0 0 0 0.95 0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)'/%3E%3C/svg%3E&quot;);"
  >
    <!-- Title graphic centered on canvas -->
    <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;user-select:none;">
      <!-- Logo: arch tombstone with cross -->
      <svg width="220" height="275" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-bottom:20px;display:block;margin-left:auto;margin-right:auto;">
        <path d="M4 100 L4 40 Q4 4 40 4 Q76 4 76 40 L76 100 Z" fill="#2a2a2a" stroke="#1a1a1a" stroke-width="1"/>
        <!-- Wifi icon -->
        <path d="M 33,57 A 7,7 0 0,1 47,57" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round"/>
        <path d="M 26,50 A 14,14 0 0,1 54,50" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round"/>
        <path d="M 19,43 A 21,21 0 0,1 61,43" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <h1 style="margin:0;font-family:'Inter',sans-serif;font-size:140px;font-weight:700;color:#2a2a2a;letter-spacing:-4px;line-height:1;">Internet</h1>
      <h1 style="margin:0;font-family:'Inter',sans-serif;font-size:140px;font-weight:700;color:#2a2a2a;letter-spacing:-4px;line-height:1;padding-bottom:24px;">Graveyard</h1>
      <p style="margin:16px 0 0;font-family:'Inter',sans-serif;font-size:22px;color:#888;letter-spacing:0.15em;text-transform:uppercase;">Bury a website, place flowers, and write a eulogy</p>
    </div>

    {#each sites as site, i}
      <div
        style="position:absolute;left:{positions[i].x}px;top:{positions[i].y}px;cursor:pointer;"
        on:mousedown={() => { pointerMoved = false; }}
        on:mousemove={() => { pointerMoved = true; }}
        on:mouseup={() => { if (!pointerMoved) focusTombstone(positions[i].x, positions[i].y); }}
      >
        <Tombstone
          image={site.image}
          favicon={site.favicon}
          name={site.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          variant={4}
          look="sunken"
          bg="#FFFFFF"
        />
      </div>
    {/each}
  </div>
</div>

<!-- Minimap -->
<div
  style="
    position:fixed;bottom:24px;right:24px;
    width:{MINIMAP_W}px;height:{MINIMAP_H}px;
    background:rgba(30,30,30,0.92);
    border:1px solid rgba(255,255,255,0.08);
    border-radius:6px;
    overflow:hidden;
    box-shadow:0 2px 12px rgba(0,0,0,0.4);
    cursor:crosshair;
    backdrop-filter:blur(4px);
  "
  on:click={minimapClick}
  role="button"
  tabindex="0"
>
  <!-- Dots for each tombstone -->
  {#each positions as pos}
    <div style="
      position:absolute;
      left:{(pos.x / CANVAS_W) * MINIMAP_W}px;
      top:{(pos.y / CANVAS_H) * MINIMAP_H}px;
      width:{(CARD_W / CANVAS_W) * MINIMAP_W}px;
      height:{(CARD_H / CANVAS_H) * MINIMAP_H}px;
      background:rgba(255,255,255,0.25);
      border-radius:50% 50% 0 0;
    "></div>
  {/each}
  <!-- Viewport indicator -->
  <div style="
    position:absolute;
    left:{vx}px;top:{vy}px;
    width:{vw}px;height:{vh}px;
    border:1.5px solid rgba(255,255,255,0.6);
    background:rgba(255,255,255,0.08);
    border-radius:2px;
    pointer-events:none;
  "></div>
</div>

<!-- Floating toolbar -->
<div style="
  position:fixed;bottom:32px;left:50%;transform:translateX(-50%);
  display:flex;align-items:center;gap:2px;
  background:#a0a0a0;
  border:1px solid rgba(0,0,0,0.15);
  border-radius:14px;
  padding:6px;
  backdrop-filter:blur(12px);
">
  <Button variant="ghost" size="icon" onclick={() => { panzoom.zoomIn(); updateMinimap(); }} class="text-black hover:bg-black/10">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
  </Button>
  <Button variant="ghost" size="icon" onclick={() => { panzoom.zoomOut(); updateMinimap(); }} class="text-black hover:bg-black/10">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
  </Button>
  <Separator orientation="vertical" class="h-7 bg-black/15" />
  <Button variant="ghost" onclick={() => {}} class="text-black hover:bg-black/10 gap-2">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
    Bury a website
  </Button>
  <Separator orientation="vertical" class="h-7 bg-black/15" />
  <Button variant="ghost" onclick={() => {}} class="text-black hover:bg-black/10 gap-2">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8 2 4 6 4 10c0 6 8 12 8 12s8-6 8-12c0-4-4-8-8-8z"/><circle cx="12" cy="10" r="2"/></svg>
    Place flowers
  </Button>
  <Separator orientation="vertical" class="h-7 bg-black/15" />
  <Button variant="ghost" onclick={() => {}} class="text-black hover:bg-black/10 gap-2">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
    Write a eulogy
  </Button>
</div>


