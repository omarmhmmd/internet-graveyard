<script lang="ts">
  import { useSvelteFlow } from '@xyflow/svelte';
  import { activeTool } from './toolStore';
  import { placeFlower } from './flowersStore';

  const { screenToFlowPosition } = useSvelteFlow();

  function handleClick(e: MouseEvent) {
    if ($activeTool !== 'flowers') return;
    const target = e.target as Element;
    if (!target.closest('.svelte-flow__pane')) return;
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    placeFlower(pos.x, pos.y);
  }

  function handleTouch(e: TouchEvent) {
    if ($activeTool !== 'flowers') return;
    const target = e.target as Element;
    if (!target.closest('.svelte-flow__pane')) return;
    const t = e.changedTouches[0];
    const pos = screenToFlowPosition({ x: t.clientX, y: t.clientY });
    placeFlower(pos.x, pos.y);
  }
</script>

<svelte:document onclick={handleClick} ontouchend={handleTouch} />
