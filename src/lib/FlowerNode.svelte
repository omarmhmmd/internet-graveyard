<script lang="ts">
  import type { NodeProps } from '@xyflow/svelte';
  let { data }: NodeProps = $props();

  function mulberry32(seed: number) {
    return () => {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  const PETAL_COLORS = ['#e05050','#f0a020','#f0d020','#4080d0','#9040c0','#e04080','#d0c020','#30a890'];
  const STEM_COLOR = '#7a8a6a';

  function buildBouquet(seed: number) {
    const r = mulberry32(seed);
    const count = 4 + Math.floor(r() * 4); // 4–7 stems
    const W = 110;
    const H = 150;
    const baseX = W / 2;
    const baseY = H;

    const stems: { path: string; petalColor: string; cx: number; cy: number; petalR: number; petalCount: number; petalLen: number }[] = [];

    for (let i = 0; i < count; i++) {
      const spread = (r() - 0.5) * 80;
      const height = 55 + r() * 65;
      const bend = (r() - 0.5) * 36;
      const cx = baseX + spread;
      const cy = baseY - height;
      const path = `M${baseX} ${baseY} Q${baseX + bend} ${baseY - height * 0.55} ${cx} ${cy}`;
      const petalColor = PETAL_COLORS[Math.floor(r() * PETAL_COLORS.length)];
      const petalR = 9 + r() * 10;
      const petalCount = 4 + Math.floor(r() * 4);
      const petalLen = 10 + r() * 12;
      stems.push({ path, petalColor, cx, cy, petalR, petalCount, petalLen });
    }

    return { stems, W, H };
  }

  const { stems, W, H } = buildBouquet(data.seed ?? 0);

  function petalPath(cx: number, cy: number, angle: number, len: number, r: number): string {
    const rad = (angle * Math.PI) / 180;
    const tx = cx + Math.cos(rad) * len;
    const ty = cy + Math.sin(rad) * len;
    return `M${cx} ${cy} Q${cx + Math.cos(rad - 0.5) * r} ${cy + Math.sin(rad - 0.5) * r} ${tx} ${ty} Q${cx + Math.cos(rad + 0.5) * r} ${cy + Math.sin(rad + 0.5) * r} ${cx} ${cy}`;
  }
</script>

<svg
  width={W} height={H}
  viewBox="0 0 {W} {H}"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  style="overflow:visible;pointer-events:none;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.15));"
>
  <!-- Stems -->
  {#each stems as s}
    <path d={s.path} stroke={STEM_COLOR} stroke-width="2" stroke-linecap="round" opacity="0.85"/>
  {/each}

  <!-- Flower heads -->
  {#each stems as s}
    {#each Array.from({ length: s.petalCount }, (_, i) => i) as i}
      <path
        d={petalPath(s.cx, s.cy, (360 / s.petalCount) * i, s.petalLen, s.petalR)}
        fill={s.petalColor}
        opacity="0.88"
      />
    {/each}
    <!-- Center -->
    <circle cx={s.cx} cy={s.cy} r="3.5" fill="#f5e6a0" opacity="0.95"/>
  {/each}
</svg>

<style>
  svg {
    display: block;
  }
</style>
