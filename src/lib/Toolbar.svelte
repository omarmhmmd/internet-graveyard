<script lang="ts">
  import { useSvelteFlow, Panel } from '@xyflow/svelte';
  import { nodesStore, sitesStore, buildNodesFromSites, imageOverrides } from './nodesStore';
  import { activeTool } from './toolStore';
  import { get } from 'svelte/store';

  const { zoomIn, zoomOut, fitView } = useSvelteFlow();

  let active = $state<string | null>('pan');
  let buryUrl = $state('');
  let buryClosing = $state(false);
  let buryStatus = $state<'idle' | 'loading'>('idle');
  let buryWrap = $state<HTMLElement | null>(null);
  let pendingTool = $state<string | null>(null);
  let buryError = $state(false);

  $effect(() => {
    if (active !== 'bury') return;
    function onDocClick(e: MouseEvent) {
      if (buryWrap && !buryWrap.contains(e.target as Node) && !buryClosing) {
        buryClosing = true;
        active = 'pan';
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  });

  function select(tool: string) {
    if (active === 'bury' && !buryClosing) {
      buryClosing = true;
      active = null;
      activeTool.set(null);
      pendingTool = tool === 'bury' ? 'pan' : tool;
      return;
    }
    const next = active === tool ? 'pan' : tool;
    active = next;
    activeTool.set(next === 'bury' || next === 'pan' ? null : next);
    if (tool !== 'bury') buryUrl = '';
  }

  function onPopoverAnimEnd() {
    if (buryClosing) {
      buryClosing = false;
      buryUrl = '';
      if (pendingTool) {
        active = pendingTool;
        activeTool.set(pendingTool);
        pendingTool = null;
      }
    }
  }

  async function pollForImage(blockId: number, nodeId: string) {
    const MAX = 20;
    const INTERVAL = 4000;
    for (let i = 0; i < MAX; i++) {
      await new Promise(r => setTimeout(r, INTERVAL));
      try {
        const res = await fetch(`https://api.are.na/v3/blocks/${blockId}`, {
          headers: { 'Authorization': `Bearer ${import.meta.env.VITE_ARENA_TOKEN}` },
        });
        const block = await res.json();
        const url = block.image?.large?.src ?? block.image?.medium?.src ?? block.image?.small?.src;
        if (url) {
          imageOverrides.update(o => ({ ...o, [nodeId]: url }));
          return;
        }
      } catch (e) { console.error('[poll error]', e); }
    }
  }

  async function submitBury(e: Event) {
    e.preventDefault();
    let url = buryUrl.trim();
    if (!url) {
      buryError = true;
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (!url.startsWith('www.')) url = 'www.' + url;
      url = 'https://' + url;
    }

    buryError = false;
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
      buryStatus = 'idle';
      active = null;
      buryClosing = true;

      const image = block.image?.large?.src ?? block.image?.medium?.src ?? block.image?.small?.src ?? '';
      const newSite = { url, image, favicon: '' };
      sitesStore.update(sites => {
        const updated = [...sites, newSite];
        const nodes = buildNodesFromSites(updated);
        const freshId = String(updated.length - 1);
        nodesStore.set(nodes.map(n => n.id === freshId ? { ...n, data: { ...n.data, fresh: true } } : n));
        return updated;
      });

      const newNodeId = String(get(sitesStore).length - 1);
      await new Promise(r => setTimeout(r, 50));
      fitView({ nodes: [{ id: newNodeId }], padding: 0.15, duration: 900, maxZoom: 1.25 });

      if (!image) {
        pollForImage(block.id, newNodeId);
      }
    } catch (err) {
      buryStatus = 'idle';
      console.error(err);
    }
  }
</script>

<Panel position="bottom-center">
  <div class="toolbar">
    <!-- Actions group -->
    <div class="action-group">

      <!-- Pan: hand -->
      <div class="tip-wrap">
        <button class="tool-btn action-btn" class:active={active === 'pan'} onclick={() => select('pan')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9,5 12,2 15,5"/>
            <polyline points="19,9 22,12 19,15"/>
            <polyline points="15,19 12,22 9,19"/>
            <polyline points="5,15 2,12 5,9"/>
            <line x1="12" y1="2" x2="12" y2="22"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
          </svg>
        </button>
        <span class="tooltip">Move</span>
      </div>

      <!-- Bury: shovel -->
      <div class="bury-wrap" bind:this={buryWrap}>
        <button class="tool-btn action-btn" class:active={active === 'bury'} class:status-loading={buryStatus === 'loading'} onclick={() => select('bury')}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="2.16667" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.99963 24L1.8371 22.8178C1.35531 19.3137 2.32215 15.7645 4.51465 12.9889L7.5 9.20959L16.5 18.667L13.0231 21.4408C10.241 23.6603 6.67071 24.6422 3.14497 24.1574L1.99963 24Z"/>
            <path d="M12 13.4167L23.4167 2"/>
          </svg>
        </button>
        <div class="bury-inline" class:open={active === 'bury'} class:closing={buryClosing} ontransitionend={(e) => { if (e.propertyName === 'max-width') onPopoverAnimEnd(); }}>
          <form class="bury-form" onsubmit={submitBury}>
            <input
              class="bury-input"
              type="text"
              placeholder="https://..."
              bind:value={buryUrl}
              autofocus={active === 'bury'}
            />
            <button class="bury-submit" class:shake={buryError} type="submit" disabled={buryStatus === 'loading'} onanimationend={() => buryError = false}>Bury</button>
          </form>
        </div>
        <span class="tooltip">Bury</span>
      </div>
    </div>

    <div class="other-tools">
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
        <span class="tooltip">Flowers</span>
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
  </div>
</Panel>


<style>
  .toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #1e1e1e;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 5px;
    margin-bottom: 20px;
  }

  .bury-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .tip-wrap {
    position: relative;
    display: flex;
  }

  .tooltip {
    position: absolute;
    bottom: calc(100% + 12px);
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

  .tip-wrap:hover .tooltip,
  .bury-wrap:hover .tooltip {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  .bury-wrap .tooltip {
    bottom: calc(100% + 10px);
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
    gap: 8px;
  }

  .other-tools {
    display: flex;
    align-items: center;
    gap: 8px;
    overflow: visible;
    max-width: 300px;
    opacity: 1;
    transition:
      max-width 0.9s cubic-bezier(0.4, 0, 0.05, 1),
      opacity 0.6s ease-out,
      gap 0.9s cubic-bezier(0.4, 0, 0.05, 1);
  }

  .other-tools.hidden {
    max-width: 0;
    gap: 0;
    overflow: hidden;
    opacity: 0;
    pointer-events: none;
    transition:
      max-width 0.2s ease 0.55s,
      opacity 0.2s ease 0.45s,
      gap 0.2s ease 0.55s;
  }

  .status-loading {
    animation: shovel-pulse 1s ease-in-out infinite;
  }

  @keyframes shovel-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }

  .bury-inline {
    display: flex;
    max-width: 0;
    opacity: 0;
    overflow: hidden;
    border-left: 0px solid rgba(255,255,255,0.1);
    margin-left: 0;
    transition:
      max-width 0.35s cubic-bezier(0.16, 1, 0.3, 1),
      opacity 0.2s ease-out,
      margin-left 0.35s cubic-bezier(0.16, 1, 0.3, 1),
      border-left-width 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .bury-inline.open {
    max-width: 320px;
    opacity: 1;
    border-left-width: 1px;
    margin-left: 8px;
    transition:
      max-width 0.5s cubic-bezier(0.16, 1, 0.3, 1),
      opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1),
      margin-left 0.5s cubic-bezier(0.16, 1, 0.3, 1),
      border-left-width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .bury-inline.closing {
    max-width: 0;
    opacity: 0;
  }

  .bury-form {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0;
    min-width: 0;
  }

  .bury-input {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 5px;
    color: #fff;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    padding: 6px 0 6px 12px;
    outline: none;
    width: 240px;
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
    padding: 6px 8px;
    margin-left: 4px;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s;
  }

  .bury-submit:hover {
    background: #5a5a22;
  }

  .bury-submit:disabled {
    cursor: default;
    background: #4a4a1a;
  }

  .bury-submit.shake {
    animation: bury-shake 0.4s ease;
  }

  @keyframes bury-shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-3px); }
    40%       { transform: translateX(3px); }
    60%       { transform: translateX(-2px); }
    80%       { transform: translateX(2px); }
  }

</style>
