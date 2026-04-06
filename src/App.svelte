<script lang="ts">
  import Tombstone from './lib/Tombstone.svelte';
  import { sites } from './lib/sites';
</script>

<div class="flex flex-row flex-wrap items-center justify-center gap-10 bg-gray-100 min-h-screen px-16 py-20">
  {#each sites as site}
    <Tombstone image={site.image} favicon={site.favicon} name={site.url.replace(/^https?:\/\//, '').replace(/\/$/, '')} variant={4} look="sunken" bg="#FFFFFF" />
  {/each}
</div>
