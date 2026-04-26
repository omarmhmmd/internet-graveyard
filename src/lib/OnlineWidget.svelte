<script lang="ts">
  import { onlineCount, trackPresence } from './presenceStore';
  import { onDestroy } from 'svelte';

  const cleanup = trackPresence();
  onDestroy(cleanup);
</script>

<div class="widget">
  <span class="dot"></span>
  <span class="label">{$onlineCount} online</span>
</div>

<style>
  .widget {
    position: fixed;
    bottom: 28px;
    left: 24px;
    display: flex;
    align-items: center;
    gap: 7px;
    background: rgba(30,30,30,0.82);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    padding: 6px 11px;
    z-index: 100;
    pointer-events: none;
    backdrop-filter: blur(6px);
  }

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #6dbf6d;
    box-shadow: 0 0 6px rgba(109,191,109,0.7);
    animation: pulse 2.4s ease-in-out infinite;
    flex-shrink: 0;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.45; }
  }

  .label {
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    color: rgba(255,255,255,0.75);
    white-space: nowrap;
  }
</style>
