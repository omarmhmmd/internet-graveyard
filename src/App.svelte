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
  import { nodesStore, sitesStore, buildNodesFromSites } from './lib/nodesStore';
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
      data: { emoji: '🌸' },
      draggable: false,
      selectable: false,
    })),
  ]);
</script>

<div style="width:100vw;height:100vh;position:relative;" class:flowers-mode={$activeTool === 'flowers'}>
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
    panOnScroll={false}
    panOnDrag={$activeTool !== 'flowers'}
    fitView={true}
    fitViewOptions={{ padding: 0.1 }}
    edges={[]}
    style="background:#d4d4d4;"
  >
    <MiniMap
      position="bottom-right"
      nodeColor="#888"
      maskColor="rgba(30,30,30,0.7)"
      style="background:rgba(30,30,30,0.92);border:1px solid rgba(255,255,255,0.08);border-radius:6px;"
    />
    <Toolbar />
    <FlowerPlacer />
  </SvelteFlow>
</div>

<style>
  .flowers-mode :global(.svelte-flow__pane) {
    cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><text y='28' font-size='28'>🌸</text></svg>") 16 28, crosshair;
  }
</style>
