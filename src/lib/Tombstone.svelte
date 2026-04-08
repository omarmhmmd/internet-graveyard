<script lang="ts">
  let {
    image = '/weights.png',
    favicon = '/weights-favicon.ico',
    variant = 2,
    look = 'default',
    bg = '#D3D3D3',
    name = '',
    radius: radiusProp,
  }: {
    image?: string;
    favicon?: string;
    variant?: number;
    look?: 'default' | 'float' | 'stamp' | 'dark' | 'tinted' | 'sunken';
    bg?: string;
    name?: string;
    radius?: number;
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

  let imgEl = $state<HTMLImageElement | null>(null);

  $effect(() => {
    if (imgEl) imgEl.style.opacity = '0';
  });

  function onImgLoad(e: Event) {
    const el = e.currentTarget as HTMLImageElement;
    el.style.transition = 'opacity 1.4s ease';
    el.style.opacity = '1';
    const container = el.closest('.skeleton') as HTMLElement | null;
    if (container) setTimeout(() => { container.style.animation = 'none'; }, 1400);
  }
</script>

{#if variant === 2}
  <div class="relative overflow-hidden" style="width:260px;height:420px;border-radius:130px 130px 0 0;{l.wrapper}">
    <div class="absolute top-0 left-0 right-0 flex items-center justify-center" style="height:44px;">
      <img src={favicon} alt="" style="width:22px;height:22px;{faviconStyle}" />
    </div>
    <div class="absolute bottom-0 left-0 right-0 overflow-hidden" style="height:376px;">
      <img src={displayImage} alt="" class="w-full h-full" class:img-fade-in={fadeIn} style="object-fit:cover;object-position:top;filter:{l.imgFilter};" />
    </div>
  </div>

{:else if variant === 4}
  <div class="card flex flex-col items-center">
    <div class="relative overflow-hidden skeleton" style="width:260px;height:340px;border-radius:{radius}px {radius}px 0 0;margin-bottom:-8px;position:relative;z-index:1;border-bottom:1px solid rgba(0,0,0,0.08);">
      {#if image}
        <img bind:this={imgEl} src={image} alt="" onload={onImgLoad} class="absolute inset-0 w-full h-full" style="opacity:0;object-fit:cover;object-position:top;filter:{l.imgFilter};" />
      {/if}
      <div class="absolute inset-0" style="border-radius:{radius}px {radius}px 0 0;{l.wrapper};pointer-events:none;"></div>
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
