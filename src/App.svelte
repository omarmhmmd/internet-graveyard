<script lang="ts">
  import { SvelteFlow, MiniMap, Background } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';
  import TombstoneNode from './lib/TombstoneNode.svelte';
  import TitleNode from './lib/TitleNode.svelte';
  import GrassNode from './lib/GrassNode.svelte';
  import Toolbar from './lib/Toolbar.svelte';
  import { nodesStore, sitesStore, buildNodesFromSites } from './lib/nodesStore';

  const CANVAS_W = 8 * 1200 + 400 * 2;
  const CANVAS_H = 7 * 1000 + 400 * 2;

  const nodeTypes = { tombstone: TombstoneNode, title: TitleNode, grass: GrassNode };

  // Fetch Are.na channel on every load
  fetch('https://api.are.na/v2/channels/internet-graveyard?per=100')
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

  // Center viewport on the "Internet Graveyard" text
  // Title node top is at CANVAS_H/2 - 400; SVG+margin is ~295px, text center ~140px further
</script>

<div style="width:100vw;height:100vh;position:relative;">
  <!-- Noise texture overlay -->
  <svg style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:0.45;" xmlns="http://www.w3.org/2000/svg">
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)" />
  </svg>
  <SvelteFlow
    nodes={$nodesStore}
    {nodeTypes}
    minZoom={0.1}
    maxZoom={2}
    zoomOnScroll={true}
    panOnScroll={false}
    panOnDrag={true}
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
  </SvelteFlow>
</div>
