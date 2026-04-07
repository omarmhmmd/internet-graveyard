<script lang="ts">
  import { type NodeProps } from '@xyflow/svelte';
  import Tombstone from './Tombstone.svelte';

  let { data }: NodeProps = $props();
</script>

<Tombstone
  image={data.image}
  favicon={data.favicon}
  name={data.name}
  radius={data.radius}
  variant={4}
  look="sunken"
  bg="#FFFFFF"
/>
