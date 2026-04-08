<script lang="ts">
  import { type NodeProps } from '@xyflow/svelte';
  let { data }: NodeProps = $props();
</script>

<div class="flower">{data.emoji ?? '🌸'}</div>

<style>
  .flower {
    font-size: 28px;
    line-height: 1;
    pointer-events: none;
    user-select: none;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  }
</style>
