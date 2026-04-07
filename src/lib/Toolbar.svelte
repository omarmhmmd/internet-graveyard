<script lang="ts">
  import { useSvelteFlow, Panel } from '@xyflow/svelte';
  import { nodesStore, sitesStore, buildNodesFromSites } from './nodesStore';
  import { get } from 'svelte/store';

  const { zoomIn, zoomOut } = useSvelteFlow();

  let active = $state<string | null>(null);
  let buryUrl = $state('');
  let buryClosing = $state(false);
  let buryStatus = $state<'idle' | 'loading' | 'success'>('idle');

  function select(tool: string) {
    if (tool === 'bury' && active === 'bury' && !buryClosing) {
      buryClosing = true;
      return;
    }
    active = active === tool ? null : tool;
    if (tool !== 'bury') buryUrl = '';
  }

  function onPopoverAnimEnd() {
    if (buryClosing) {
      active = null;
      buryClosing = false;
      buryUrl = '';
    }
  }

  async function pollForImage(blockId: number, nodeId: string) {
    const MAX = 12;
    const INTERVAL = 4000;
    for (let i = 0; i < MAX; i++) {
      await new Promise(r => setTimeout(r, INTERVAL));
      try {
        const res = await fetch(`https://api.are.na/v3/blocks/${blockId}`, {
          headers: { 'Authorization': `Bearer ${import.meta.env.VITE_ARENA_TOKEN}` },
        });
        const block = await res.json();
        if (block.image?.display?.url) {
          nodesStore.update(nodes => nodes.map(n =>
            n.id === nodeId ? { ...n, data: { ...n.data, image: block.image.display.url } } : n
          ));
          return;
        }
      } catch {}
    }
  }

  async function submitBury(e: Event) {
    e.preventDefault();
    let url = buryUrl.trim();
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      if (!url.startsWith('www.')) url = 'www.' + url;
      url = 'https://' + url;
    }
    active = null;
    buryClosing = true;

    if (!url) return;

    buryStatus = 'loading';

    try {
      const res = await fetch('https://api.are.na/v3/blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_ARENA_TOKEN}`,
        },
        body: JSON.stringify({ value: url, channel_ids: [797612] }),
      });
      if (!res.ok) throw new Error(`Are.na error: ${res.status}`);

      const [block] = await Promise.all([res.json(), new Promise(r => setTimeout(r, 2500))]);
      buryStatus = 'success';
      setTimeout(() => { buryStatus = 'idle'; }, 2000);

      // Append placeholder site and rebuild nodes at the correct deterministic position
      const newSite = { url, image: '/weights.png', favicon: '' };
      sitesStore.update(sites => {
        const updated = [...sites, newSite];
        nodesStore.set(buildNodesFromSites(updated));
        return updated;
      });

      // nodeId is the last tombstone index (sites.length - 1 after append)
      const nodeId = String(get(sitesStore).length - 1);

      // Poll until Are.na finishes processing the screenshot, then swap image
      pollForImage(block.id, nodeId);
    } catch (err) {
      console.error(err);
    }
  }
</script>

<Panel position="bottom-center">
  <div class="toolbar">
    <!-- Actions group -->
    <div class="action-group">

      <!-- Bury: shovel -->
      <div class="tip-wrap">
        <button class="tool-btn action-btn" class:active={active === 'bury'} class:status-loading={buryStatus === 'loading'} class:status-success={buryStatus === 'success'} onclick={() => select('bury')}>
          {#if buryStatus === 'loading'}
            <svg class="spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9" stroke-dasharray="28 56" /></svg>
          {:else if buryStatus === 'success'}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline class="check-draw" points="20 6 9 17 4 12"/></svg>
          {:else}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 23v-7l6.5-6.5 7 7-6.5 6.5z"/>
              <line x1="7.5" y1="16" x2="20" y2="3"/>
            </svg>
          {/if}
        </button>
        {#if active === 'bury' || buryClosing}
          <form class="bury-popover" class:closing={buryClosing} onanimationend={onPopoverAnimEnd} onsubmit={submitBury}>
            <input
              class="bury-input"
              type="text"
              placeholder="https://..."
              bind:value={buryUrl}
              autofocus
            />
            <button class="bury-submit" type="submit">Bury</button>
          </form>
        {:else}
          <span class="tooltip">Bury a website</span>
        {/if}
      </div>
      <!-- Flowers: flower -->
      <div class="tip-wrap">
        <button class="tool-btn action-btn" class:active={active === 'flowers'} onclick={() => select('flowers')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 12 C8 8 8 2 12 2 C16 2 16 8 12 12"/>
            <path d="M12 12 C8 8 8 2 12 2 C16 2 16 8 12 12" transform="rotate(60 12 12)"/>
            <path d="M12 12 C8 8 8 2 12 2 C16 2 16 8 12 12" transform="rotate(120 12 12)"/>
            <path d="M12 12 C8 8 8 2 12 2 C16 2 16 8 12 12" transform="rotate(180 12 12)"/>
            <path d="M12 12 C8 8 8 2 12 2 C16 2 16 8 12 12" transform="rotate(240 12 12)"/>
            <path d="M12 12 C8 8 8 2 12 2 C16 2 16 8 12 12" transform="rotate(300 12 12)"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
        </button>
        <span class="tooltip">Place flowers</span>
      </div>
      <!-- Eulogy: angled document -->
      <div class="tip-wrap">
        <button class="tool-btn action-btn" class:active={active === 'eulogy'} onclick={() => select('eulogy')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <g transform="rotate(-15 12 12)">
              <rect x="4" y="2" width="16" height="20" rx="2"/>
              <line x1="8" y1="9" x2="16" y2="9"/>
              <line x1="8" y1="13" x2="16" y2="13"/>
              <line x1="8" y1="17" x2="13" y2="17"/>
            </g>
          </svg>
        </button>
        <span class="tooltip">Write a eulogy</span>
      </div>
    </div>

    <div class="sep"></div>

    <!-- Zoom -->
    <div class="tip-wrap">
      <button class="tool-btn" onclick={() => zoomIn()}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
      </button>
      <span class="tooltip">Zoom in</span>
    </div>
    <div class="tip-wrap">
      <button class="tool-btn" onclick={() => zoomOut()}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
      </button>
      <span class="tooltip">Zoom out</span>
    </div>
  </div>
</Panel>


<style>
  .toolbar {
    display: flex;
    align-items: center;
    gap: 2px;
    background: #1e1e1e;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 5px;
    margin-bottom: 20px;
  }

  .tip-wrap {
    position: relative;
    display: flex;
  }

  .tooltip {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%) translateY(6px);
    background: #2e2e2e;
    color: rgba(255,255,255,0.85);
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    white-space: nowrap;
    padding: 5px 9px;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.08);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .tip-wrap:hover .tooltip {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  .tool-btn {
    display: flex;
    align-items: center;
    background: none;
    border: none;
    color: rgba(255,255,255,0.8);
    padding: 6px 8px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-family: 'Inter', sans-serif;
    transition: background 0.1s;
  }

  .tool-btn:hover {
    background: rgba(255,255,255,0.1);
    color: #fff;
  }

  .tool-btn.active {
    background: #4a4a1a;
    color: #fff;
  }

  .tool-btn.active:hover {
    background: #5a5a22;
  }

  .sep {
    width: 1px;
    height: 20px;
    background: rgba(255,255,255,0.1);
    margin: 0 3px;
    flex-shrink: 0;
  }

  .action-group {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .status-success svg {
    animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .status-loading {
    color: rgba(255,255,255,0.4) !important;
  }

  .status-success {
    color: #5a5a22 !important;
  }

  .spin {
    animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards,
               spin 0.8s linear 0.3s infinite;
    opacity: 0;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .check-draw {
    stroke-dasharray: 30;
    stroke-dashoffset: 30;
    animation: draw-check 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes draw-check {
    to { stroke-dashoffset: 0; }
  }

  .bury-popover {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 6px;
    background: #2e2e2e;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 6px 8px;
    animation: popover-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    white-space: nowrap;
  }

  @keyframes popover-in {
    from { opacity: 0; transform: translateX(-50%) translateY(6px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  .bury-popover.closing {
    animation: popover-out 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes popover-out {
    from { opacity: 1; transform: translateX(-50%) translateY(0); }
    to   { opacity: 0; transform: translateX(-50%) translateY(6px); }
  }

  .bury-input {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 5px;
    color: #fff;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    padding: 4px 8px;
    outline: none;
    width: 180px;
    transition: border-color 0.15s;
  }

  .bury-input::placeholder {
    color: rgba(255,255,255,0.3);
  }

  .bury-input:focus {
    border-color: rgba(255,255,255,0.3);
  }

  .bury-submit {
    background: #4a4a1a;
    border: none;
    border-radius: 5px;
    color: #fff;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    padding: 4px 10px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .bury-submit:hover {
    background: #5a5a22;
  }
</style>
