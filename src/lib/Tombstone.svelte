<script lang="ts">
  let {
    image = '/weights.png',
    favicon = '/weights-favicon.ico',
    variant = 2,
    look = 'default',
    bg = '#D3D3D3',
    name = '',
    shape = 0,
    url = '',
  }: {
    image?: string;
    favicon?: string;
    variant?: number;
    look?: 'default' | 'float' | 'stamp' | 'dark' | 'tinted' | 'sunken';
    bg?: string;
    name?: string;
    shape?: number;
    url?: string;
  } = $props();

  const looks: Record<string, { wrapper: string; imgFilter: string; imgInset: string; }> = {
    default: { wrapper: 'border: 1.5px solid rgba(0,0,0,0.15);',                                                                                          imgFilter: '',                          imgInset: '' },
    float:   { wrapper: 'border: none; box-shadow: 0 2px 4px rgba(0,0,0,0.06), 0 8px 16px rgba(0,0,0,0.1), 0 24px 48px rgba(0,0,0,0.14);',               imgFilter: '',                          imgInset: '' },
    stamp:   { wrapper: 'border: 2px solid #1a1a1a; box-shadow: 6px 6px 0px #1a1a1a;',                                                                    imgFilter: '',                          imgInset: '' },
    dark:    { wrapper: 'border: none; box-shadow: 0 8px 32px rgba(0,0,0,0.35);',                                                                         imgFilter: '',                          imgInset: '' },
    tinted:  { wrapper: 'border: none; box-shadow: 0 4px 24px rgba(0,0,0,0.18);',                                                                         imgFilter: 'sepia(0.4) contrast(1.05)', imgInset: '' },
    sunken:  { wrapper: 'box-shadow: inset 0 2px 8px rgba(0,0,0,0.15), 0 1px 3px rgba(255,255,255,0.6);',                                                  imgFilter: 'brightness(0.92)',          imgInset: '' },
  };

  const l = looks[look] ?? looks.default;
  const faviconStyle = look === 'dark' ? 'filter:invert(1);' : '';
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;

  // ── Shape definitions (W=260, H=340) ─────────────────────────────────────
  const W = 260, H = 340;
  const SHAPES: string[] = [
    // 0: Classic round arch — semicircular top, most common upright
    `M0,${H} L0,130 Q0,0 130,0 Q${W},0 ${W},130 L${W},${H} Z`,
    // 1: Gothic pointed arch — ogival, two arcs meeting at apex
    `M0,${H} L0,185 C0,75 58,0 130,0 C202,0 ${W},75 ${W},185 L${W},${H} Z`,
    // 2: Flat tablet — rectangular, minimal rounding
    `M0,${H} L0,10 Q0,0 10,0 L250,0 Q${W},0 ${W},10 L${W},${H} Z`,
    // 3: Gable / peaked — triangular house-roof top
    `M0,${H} L0,85 L130,0 L${W},85 L${W},${H} Z`,
    // 4: Shouldered / Victorian — stepped shoulders flanking arched center
    `M0,${H} L0,110 L35,110 L35,70 L65,0 L195,0 L225,70 L225,110 L${W},110 L${W},${H} Z`,
    // 5: Obelisk — tapered pyramid sides
    `M0,${H} L22,55 L130,0 L238,55 L${W},${H} Z`,
    // 6: Urn / Victorian concave — concave sides, arch top
    `M0,${H} C22,285 6,238 18,192 C4,162 4,110 0,82 Q0,0 130,0 Q${W},0 ${W},82 C256,110 256,162 242,192 C254,238 238,285 ${W},${H} Z`,
    // 7: Shattered / broken stone — irregular angular fracture, varied chunk sizes
    `M0,${H} L0,105 L8,88 L22,55 L32,85 L44,12 L55,72 L65,45 L80,6 L92,78 L100,58 L112,22 L124,80 L130,3 L140,68 L155,88 L162,75 L176,22 L188,62 L196,40 L210,88 L220,35 L232,72 L248,18 L${W},68 L${W},${H} Z`,
  ];
  const shapePath = SHAPES[(shape ?? 0) % SHAPES.length];

  let stoneEl = $state<HTMLElement | null>(null);
  let imgEl = $state<HTMLImageElement | null>(null);

  $effect(() => {
    if (imgEl) imgEl.style.opacity = '0';
  });

  function onImgLoad(e: Event) {
    const el = e.currentTarget as HTMLImageElement;
    el.style.transition = 'opacity 1.4s ease';
    el.style.opacity = '1';
    if (stoneEl) setTimeout(() => { if (stoneEl) stoneEl.style.animation = 'none'; }, 1400);
  }
</script>

{#if variant === 2}
  <div class="relative overflow-hidden" style="width:260px;height:420px;border-radius:130px 130px 0 0;{l.wrapper}">
    <div class="absolute top-0 left-0 right-0 flex items-center justify-center" style="height:44px;">
      <img src={favicon} alt="" style="width:22px;height:22px;{faviconStyle}" />
    </div>
    <div class="absolute bottom-0 left-0 right-0 overflow-hidden" style="height:376px;">
      <img src={image} alt="" class="w-full h-full" style="object-fit:cover;object-position:top;filter:{l.imgFilter};" />
    </div>
  </div>

{:else if variant === 4}
  <div class="card flex flex-col items-center">
    <div style="position:relative;margin-bottom:-8px;z-index:1;">
      {#if isMobile}
        <div
          bind:this={stoneEl}
          style="width:{W}px;height:{H}px;border-radius:130px 130px 0 0;overflow:hidden;position:relative;background:#c4c4c4;"
        >
          {#if image}
            <img bind:this={imgEl} src={image} alt="" onload={onImgLoad}
              style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top;opacity:0;filter:{l.imgFilter};" />
          {/if}
        </div>
      {:else}
        <div
          bind:this={stoneEl}
          class="skeleton"
          style="width:{W}px;height:{H}px;clip-path:path('{shapePath}');position:relative;background:#c4c4c4;"
        >
          {#if image}
            <img
              bind:this={imgEl}
              src={image}
              alt=""
              onload={onImgLoad}
              style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top;opacity:0;filter:{l.imgFilter};"
            />
          {/if}
        </div>
        <svg width={W} height={H} style="position:absolute;inset:0;pointer-events:none;overflow:visible;">
          <path d={shapePath} fill="none" stroke="rgba(0,0,0,0.13)" stroke-width="1.5" />
        </svg>
      {/if}
    </div>
    {#if name}
      <div style="width:320px;">
        <div style="width:100%;height:14px;background:linear-gradient(to bottom,#a8a8a8,#888888);{isMobile ? '' : 'transform:perspective(120px) rotateX(40deg);transform-origin:bottom center;'}"></div>
        <div style="background:#a0a0a0;box-shadow:inset 0 2px 8px rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:center;padding:10px 16px 14px;">
          {#if isMobile && url}
            <a href={url} target="_blank" rel="noopener" class="pedestal-title" style="margin:4px 0 0 0;font-size:24px;font-family:'Cinzel',serif;font-weight:400;color:#333;text-decoration:none;">{name}</a>
          {:else}
            <p class="pedestal-title" style="margin:4px 0 0 0;font-size:24px;font-family:'Cinzel',serif;font-weight:400;color:#333;">{name}</p>
          {/if}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .pedestal-title {
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .card:hover .pedestal-title {
    opacity: 1;
  }
  @media (max-width: 768px) {
    .pedestal-title {
      opacity: 1;
    }
  }
  .skeleton {
    background: #c4c4c4;
    animation: skeleton-pulse 1.6s ease-in-out infinite;
  }
  @keyframes skeleton-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.5; }
  }
</style>
