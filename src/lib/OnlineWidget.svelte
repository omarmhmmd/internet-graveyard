<script lang="ts">
  import { onlineCount, trackPresence } from './presenceStore';
  import { onDestroy } from 'svelte';

  const cleanup = trackPresence();
  onDestroy(cleanup);
</script>

<div class="widget">
  <svg class="noise" xmlns="http://www.w3.org/2000/svg">
    <filter id="widget-noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#widget-noise)" />
  </svg>
  <span class="dot"></span>
  <span class="label">{$onlineCount} online</span>
</div>

<style>
  .widget {
    position: fixed;
    bottom: 42px;
    left: 24px;
    display: flex;
    align-items: center;
    gap: 7px;
    background: #262626;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 6px 10px;
    z-index: 100;
    pointer-events: none;
    overflow: hidden;
  }

  .noise {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0.45;
  }

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #6b6b20;
    box-shadow: 0 0 6px rgba(107,107,32,0.7);
    animation: pulse 2.4s ease-in-out infinite;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
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
    position: relative;
    z-index: 1;
  }

  @media (max-width: 768px) {
    .widget { display: none; }
  }
</style>
