<script lang="ts">
  import type { NodeProps } from '@xyflow/svelte';
  let { data }: NodeProps = $props();

  // Each blade: [x, bend, height]
  const blades = data.blades as [number, number, number][];
</script>

<svg width={data.w} height={data.h} viewBox="0 0 {data.w} {data.h}" fill="none" xmlns="http://www.w3.org/2000/svg" style="overflow:visible;pointer-events:none;">
  {#each blades as [x, bend, h]}
    <path
      d="M{x} {data.h} Q{x + bend} {data.h - h * 0.5} {x + bend * 1.4} {data.h - h}"
      stroke="#8a8a7a"
      stroke-width="2.5"
      stroke-linecap="round"
      opacity="0.7"
    />
  {/each}
</svg>
