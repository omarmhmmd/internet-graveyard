<script lang="ts">
  import { type NodeProps, useSvelteFlow } from '@xyflow/svelte';
  import Tombstone from './Tombstone.svelte';
  import { imageOverrides, nodesStore } from './nodesStore';
  import { get } from 'svelte/store';

  let { data, id }: NodeProps = $props();
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
  let hovered = $state(false);
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let rattling = $state<Set<string>>(new Set());
  let available = $state<Set<string>>(new Set());

  function enter() {
    if (timeout) { clearTimeout(timeout); timeout = null; }
    hovered = true;
  }

  function leave() {
    timeout = setTimeout(() => { hovered = false; }, 150);
  }

  const { fitView } = useSvelteFlow();
  const CARD_W = 260;
  const CARD_H = 340;

  function hasCandidate(direction: 'up' | 'down' | 'left' | 'right') {
    const nodes = get(nodesStore);
    const myNode = nodes.find(n => n.id === id);
    if (!myNode) return false;
    const myX = myNode.position.x + CARD_W / 2;
    const myY = myNode.position.y + CARD_H / 2;
    return nodes.filter(n => n.type === 'tombstone' && n.id !== id).some(n => {
      const nx = n.position.x + CARD_W / 2;
      const ny = n.position.y + CARD_H / 2;
      if (direction === 'up')    return ny < myY;
      if (direction === 'down')  return ny > myY;
      if (direction === 'left')  return nx < myX;
      if (direction === 'right') return nx > myX;
      return false;
    });
  }

  function checkRattle(direction: 'up' | 'down' | 'left' | 'right') {
    if (hasCandidate(direction)) {
      available = new Set([...available, direction]);
    } else {
      available = new Set([...available].filter(d => d !== direction));
      rattling = new Set([...rattling, direction]);
      setTimeout(() => { rattling = new Set([...rattling].filter(d => d !== direction)); }, 500);
    }
  }

  function navigateTo(direction: 'up' | 'down' | 'left' | 'right', e: MouseEvent) {
    e.stopPropagation();
    const nodes = get(nodesStore);
    const myNode = nodes.find(n => n.id === id);
    if (!myNode) return;

    const myX = myNode.position.x + CARD_W / 2;
    const myY = myNode.position.y + CARD_H / 2;

    const candidates = nodes
      .filter(n => n.type === 'tombstone' && n.id !== id)
      .filter(n => {
        const nx = n.position.x + CARD_W / 2;
        const ny = n.position.y + CARD_H / 2;
        if (direction === 'up')    return ny < myY;
        if (direction === 'down')  return ny > myY;
        if (direction === 'left')  return nx < myX;
        if (direction === 'right') return nx > myX;
        return false;
      });

    if (!candidates.length) { checkRattle(direction); return; }

    const nearest = candidates.reduce((best, n) => {
      const dist  = Math.hypot(n.position.x + CARD_W / 2 - myX, n.position.y + CARD_H / 2 - myY);
      const bdist = Math.hypot(best.position.x + CARD_W / 2 - myX, best.position.y + CARD_H / 2 - myY);
      return dist < bdist ? n : best;
    });

    fitView({ nodes: [{ id: nearest.id }], padding: 0.15, duration: 700, maxZoom: 1.25 });
  }
</script>

<div class="node-wrap" onmouseenter={enter} onmouseleave={leave} onclick={() => { if (!isMobile && data.url) window.open(data.url as string, '_blank'); }}>
  <div class:bury-in={data.fresh}>
    <Tombstone
      image={$imageOverrides[id] ?? data.image}
      favicon={data.favicon}
      name={data.name}
      url={data.url}
      shape={data.shape}
      variant={4}
      look="sunken"
      bg="#FFFFFF"
    />
  </div>

  <div class="nav-cluster" class:visible={hovered || isMobile} onmouseenter={enter} onclick={(e) => e.stopPropagation()}>
    <button class="nav-btn up"    class:rattle={rattling.has('up')}    class:can-move={available.has('up')}    onmouseenter={() => checkRattle('up')}    onclick={(e) => navigateTo('up', e)}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
    </button>
    <button class="nav-btn left"  class:rattle={rattling.has('left')}  class:can-move={available.has('left')}  onmouseenter={() => checkRattle('left')}  onclick={(e) => navigateTo('left', e)}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <div class="nav-center"></div>
    <button class="nav-btn down"  class:rattle={rattling.has('down')}  class:can-move={available.has('down')}  onmouseenter={() => checkRattle('down')}  onclick={(e) => navigateTo('down', e)}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <button class="nav-btn right" class:rattle={rattling.has('right')} class:can-move={available.has('right')} onmouseenter={() => checkRattle('right')} onclick={(e) => navigateTo('right', e)}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>
    </button>
  </div>
</div>

<style>
  .node-wrap {
    position: relative;
    cursor: alias;
  }

  .bury-in {
    animation: bury-in 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes bury-in {
    0%   { opacity: 0; transform: translateY(24px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  .nav-cluster {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.9);
    opacity: 0;
    pointer-events: none;
    display: grid;
    grid-template-areas: ". up ." "left center right" ". down .";
    grid-template-columns: 28px 28px 28px;
    grid-template-rows: 28px 28px 28px;
    gap: 3px;
    z-index: 10;
    transition: opacity 0.3s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @media (max-width: 768px) {
    .nav-cluster {
      grid-template-columns: 36px 36px 36px;
      grid-template-rows: 36px 36px 36px;
      gap: 4px;
    }
  }

  .nav-cluster.visible {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
    pointer-events: all;
  }

  .nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(160deg, #c0c0c0 0%, #888 100%);
    box-shadow: 0 1px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    color: #333;
    padding: 0;
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .nav-btn.up.rattle    { animation: rattle-v 0.45s ease; }
  .nav-btn.down.rattle  { animation: rattle-v 0.45s ease; }
  .nav-btn.left.rattle  { animation: rattle-h 0.45s ease; }
  .nav-btn.right.rattle { animation: rattle-h 0.45s ease; }

  @keyframes rattle-v {
    0%,100% { transform: translateY(0); }
    20%     { transform: translateY(-4px); }
    40%     { transform: translateY(3px); }
    60%     { transform: translateY(-2px); }
    80%     { transform: translateY(1px); }
  }
  @keyframes rattle-h {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-4px); }
    40%     { transform: translateX(3px); }
    60%     { transform: translateX(-2px); }
    80%     { transform: translateX(1px); }
  }

  .nav-btn.up.can-move:hover    { transform: translateY(-4px); }
  .nav-btn.down.can-move:hover  { transform: translateY(4px); }
  .nav-btn.left.can-move:hover  { transform: translateX(-4px); }
  .nav-btn.right.can-move:hover { transform: translateX(4px); }

  .nav-btn.up    { grid-area: up; }
  .nav-btn.down  { grid-area: down; }
  .nav-btn.left  { grid-area: left; }
  .nav-btn.right { grid-area: right; }

  .nav-center {
    grid-area: center;
    background: linear-gradient(160deg, #c0c0c0 0%, #888 100%);
    box-shadow: 0 1px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3);
    border: none;
    border-radius: 6px;
    pointer-events: none;
  }
</style>
