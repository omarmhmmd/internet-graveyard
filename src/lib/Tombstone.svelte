<script lang="ts">
  let {
    image = '/weights.png',
    favicon = '/weights-favicon.ico',
    variant = 2,
    look = 'default',
    bg = '#D3D3D3',
    name = '',
    radius: radiusProp,
    shape = 0,
  }: {
    image?: string;
    favicon?: string;
    variant?: number;
    look?: 'default' | 'float' | 'stamp' | 'dark' | 'tinted' | 'sunken';
    bg?: string;
    name?: string;
    radius?: number;
    shape?: number;
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
  const radius = radiusProp ?? Math.round(60 + Math.random() * 70);

  // ── Shape definitions (W=260, H=340) ──────────────────────────────────────
  const W = 260, H = 340;

  const SHAPES: string[] = [
    // 0: Classic arch
    `M0,340 L0,130 Q0,0 130,0 Q260,0 260,130 L260,340 Z`,
    // 1: Gothic pointed arch
    `M0,340 L0,211 C0,82 86,0 130,0 C174,0 260,82 260,211 L260,340 Z`,
    // 2: Obelisk / pyramid top
    `M0,340 L29,44 L130,0 L231,44 L260,340 Z`,
    // 3: Tablet — flat top, rounded corners
    `M0,340 L0,40 Q0,0 40,0 L220,0 Q260,0 260,40 L260,340 Z`,
    // 4: Trefoil — three organic bumps
    `M0,340 L0,224 C5,163 25,146 68,139 C38,102 35,54 70,34 C80,7 112,0 130,0 C148,0 180,7 190,34 C225,54 222,102 192,139 C235,146 255,163 260,224 L260,340 Z`,
    // 5: Jagged / broken stone
    `M0,340 L0,156 L21,133 L42,167 L62,105 L88,140 L114,82 L130,92 L148,61 L174,126 L200,88 L226,119 L244,95 L260,150 L260,340 Z`,
    // 6: Art Deco stepped
    `M0,340 L0,119 L31,119 L31,82 L70,82 L70,44 L99,44 L99,20 L161,20 L161,44 L190,44 L190,82 L229,82 L229,119 L260,119 L260,340 Z`,
    // 7: Victorian urn — concave sides
    `M0,340 C20,289 5,238 15,194 C5,167 5,109 0,82 Q0,0 130,0 Q260,0 260,82 C255,109 255,167 245,194 C255,238 240,289 260,340 Z`,
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
      <!-- Clipped stone -->
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
      <!-- SVG border stroke follows the shape -->
      <svg width={W} height={H} style="position:absolute;inset:0;pointer-events:none;overflow:visible;">
        <path d={shapePath} fill="none" stroke="rgba(0,0,0,0.13)" stroke-width="1.5" />
      </svg>
    </div>
    {#if name}
      <div style="width:320px;">
        <div style="width:100%;height:14px;background:linear-gradient(to bottom,#a8a8a8,#888888);transform:perspective(120px) rotateX(40deg);transform-origin:bottom center;"></div>
        <div style="background:#a0a0a0;box-shadow:inset 0 2px 8px rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:center;padding:10px 16px 14px;">
          <p class="pedestal-title" style="margin:4px 0 0 0;font-size:24px;font-family:'Cinzel',serif;font-weight:400;color:#333;">{name}</p>
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
  .skeleton {
    background: #c4c4c4;
    animation: skeleton-pulse 1.6s ease-in-out infinite;
  }
  @keyframes skeleton-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.5; }
  }
</style>
