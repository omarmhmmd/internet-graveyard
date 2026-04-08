<script lang="ts">
  import { type NodeProps } from '@xyflow/svelte';
  import Tombstone from './Tombstone.svelte';
  import { imageOverrides } from './nodesStore';

  let { data, id }: NodeProps = $props();
</script>

<div class:bury-in={data.fresh}>
  <Tombstone
    image={$imageOverrides[id] ?? data.image}
    favicon={data.favicon}
    name={data.name}
    radius={data.radius}
    variant={4}
    look="sunken"
    bg="#FFFFFF"
  />
</div>

<style>
  .bury-in {
    animation: bury-in 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes bury-in {
    0%   { opacity: 0; transform: translateY(24px); }
    100% { opacity: 1; transform: translateY(0); }
  }
</style>
