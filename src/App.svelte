<script lang="ts">
  import { SvelteFlow, MiniMap } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';
  import { derived } from 'svelte/store';
  import TombstoneNode from './lib/TombstoneNode.svelte';
  import TitleNode from './lib/TitleNode.svelte';
  import GrassNode from './lib/GrassNode.svelte';
  import FlowerNode from './lib/FlowerNode.svelte';
  import FlowerPlacer from './lib/FlowerPlacer.svelte';
  import Toolbar from './lib/Toolbar.svelte';
  import { nodesStore, sitesStore, buildNodesFromSites, TITLE_X, TITLE_Y } from './lib/nodesStore';
  import { activeTool } from './lib/toolStore';
  import { flowersStore, loadFlowers, subscribeFlowers } from './lib/flowersStore';

  const nodeTypes = { tombstone: TombstoneNode, title: TitleNode, grass: GrassNode, flower: FlowerNode };

  // Fetch Are.na channel on every load
  fetch('https://api.are.na/v2/channels/internet-graveyard?per=100', { cache: 'no-store' })
    .then(r => r.json())
    .then(data => {
      const sites = data.contents
        .filter((b: any) => b.class === 'Link' && b.image)
        .sort((a: any, b: any) => a.position - b.position)
        .map((block: any) => ({
          url: block.source?.url ?? '',
          image: block.image.display.url,
          favicon: block.source?.url ? new URL(block.source.url).origin + '/favicon.ico' : '',
        }));
      sitesStore.set(sites);
      nodesStore.set(buildNodesFromSites(sites));
    })
    .catch(console.error);

  const INITIAL_ZOOM = 0.1;
  // TITLE_Y is the node's top edge; add ~400px to land on the heading text
  const initialViewport = {
    x: window.innerWidth / 2 - TITLE_X * INITIAL_ZOOM,
    y: window.innerHeight / 2 - (TITLE_Y + 400) * INITIAL_ZOOM,
    zoom: INITIAL_ZOOM,
  };

  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;

  // Load and subscribe to flowers
  loadFlowers();
  subscribeFlowers();

  // Combine tombstone/grass/title nodes with flower nodes reactively
  const allNodes = derived([nodesStore, flowersStore], ([$nodes, $flowers]) => [
    ...$nodes,
    ...$flowers.map(f => ({
      id: `flower-${f.id}`,
      type: 'flower' as const,
      position: { x: f.x, y: f.y },
      data: { seed: Math.abs(Math.round(f.x * 31 + f.y * 17)) },
      draggable: false,
      selectable: false,
    })),
  ]);
</script>

<div style="width:100vw;height:100dvh;position:relative;" class:flowers-mode={$activeTool === 'flowers'}>
  <!-- Noise texture overlay -->
  <svg style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:0.45;" xmlns="http://www.w3.org/2000/svg">
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)" />
  </svg>
  <SvelteFlow
    nodes={$allNodes}
    {nodeTypes}
    minZoom={0.1}
    maxZoom={2}
    zoomOnScroll={true}
    zoomOnPinch={true}
    panOnScroll={false}
    panOnDrag={$activeTool !== 'flowers'}
    {initialViewport}
    edges={[]}
    style="background:#d4d4d4;"
  >
    {#if !isMobile}
    <MiniMap
      position="bottom-right"
      nodeColor="#888"
      maskColor="rgba(30,30,30,0.7)"
      style="background:rgba(30,30,30,0.92);border:1px solid rgba(255,255,255,0.08);border-radius:6px;"
    />
    {/if}
    {#if !isMobile}<Toolbar />{/if}
    <FlowerPlacer />
  </SvelteFlow>
</div>

<style>
  :global(.svelte-flow__node-flower) {
    cursor: inherit !important;
  }

  .flowers-mode :global(.svelte-flow__pane) {
    cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='64' viewBox='0 0 80 110' fill='none'><path d='M40 110 Q31 70 22 30' stroke='%237a8a6a' stroke-width='2' stroke-linecap='round'/><path d='M40 110 Q40 70 40 28' stroke='%237a8a6a' stroke-width='2' stroke-linecap='round'/><path d='M40 110 Q49 71 58 32' stroke='%237a8a6a' stroke-width='2' stroke-linecap='round'/><path d='M40 110 Q29 82 18 55' stroke='%237a8a6a' stroke-width='2' stroke-linecap='round'/><path d='M40 110 Q51 84 62 58' stroke='%237a8a6a' stroke-width='2' stroke-linecap='round'/><ellipse cx='22' cy='23' rx='3.5' ry='6' fill='%23a066cc'/><ellipse cx='22' cy='37' rx='3.5' ry='6' fill='%23a066cc'/><ellipse cx='15' cy='30' rx='6' ry='3.5' fill='%23a066cc'/><ellipse cx='29' cy='30' rx='6' ry='3.5' fill='%23a066cc'/><circle cx='22' cy='30' r='3.5' fill='%23f5e6a0'/><ellipse cx='40' cy='21' rx='3.5' ry='6' fill='%23f09930'/><ellipse cx='40' cy='35' rx='3.5' ry='6' fill='%23f09930'/><ellipse cx='33' cy='28' rx='6' ry='3.5' fill='%23f09930'/><ellipse cx='47' cy='28' rx='6' ry='3.5' fill='%23f09930'/><circle cx='40' cy='28' r='3.5' fill='%23f5e6a0'/><ellipse cx='58' cy='25' rx='3.5' ry='6' fill='%234488ee'/><ellipse cx='58' cy='39' rx='3.5' ry='6' fill='%234488ee'/><ellipse cx='51' cy='32' rx='6' ry='3.5' fill='%234488ee'/><ellipse cx='65' cy='32' rx='6' ry='3.5' fill='%234488ee'/><circle cx='58' cy='32' r='3.5' fill='%23f5e6a0'/><ellipse cx='18' cy='49' rx='3' ry='5' fill='%23dd44aa'/><ellipse cx='18' cy='61' rx='3' ry='5' fill='%23dd44aa'/><ellipse cx='12' cy='55' rx='5' ry='3' fill='%23dd44aa'/><ellipse cx='24' cy='55' rx='5' ry='3' fill='%23dd44aa'/><circle cx='18' cy='55' r='3' fill='%23f5e6a0'/><ellipse cx='62' cy='52' rx='3' ry='5' fill='%2333bbaa'/><ellipse cx='62' cy='64' rx='3' ry='5' fill='%2333bbaa'/><ellipse cx='56' cy='58' rx='5' ry='3' fill='%2333bbaa'/><ellipse cx='68' cy='58' rx='5' ry='3' fill='%2333bbaa'/><circle cx='62' cy='58' r='3' fill='%23f5e6a0'/></svg>") 24 32, crosshair;
  }
</style>
