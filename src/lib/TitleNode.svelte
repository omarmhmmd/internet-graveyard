<script lang="ts">
  import type { NodeProps } from '@xyflow/svelte';
  let { }: NodeProps = $props();
</script>

<div style="text-align:center;pointer-events:none;user-select:none;width:1200px;transform:translateX(-50%);">
  <div style="position:relative;width:220px;height:275px;margin:0 auto 20px;">
    <svg width="220" height="275" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;">
      <path d="M4 100 L4 40 Q4 4 40 4 Q76 4 76 40 L76 100 Z" fill="#2a2a2a" stroke="#1a1a1a" stroke-width="1"/>
    </svg>
    <span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:'Cinzel',serif;font-size:26px;color:#888;white-space:nowrap;">RIP</span>
  </div>
  <h1 style="margin:0;font-family:'Inter',sans-serif;font-size:140px;font-weight:700;color:#2a2a2a;letter-spacing:-4px;line-height:1;">Internet</h1>
  <h1 style="margin:0;font-family:'Inter',sans-serif;font-size:140px;font-weight:700;color:#2a2a2a;letter-spacing:-4px;line-height:1;padding-bottom:24px;">Graveyard</h1>
  <p style="margin:16px 0 0;font-family:'Inter',sans-serif;font-size:22px;color:#888;letter-spacing:0;text-transform:uppercase;">RIP to these institutions, companies, studios, platforms, and websites that are no longer with us. If you have come across a website that has come to an end, please bury it here.</p>
</div>
