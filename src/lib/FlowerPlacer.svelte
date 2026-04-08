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
</script>

<svelte:document onclick={handleClick} />
