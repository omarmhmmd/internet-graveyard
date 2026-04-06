import { writeFileSync } from 'fs';

const res = await fetch('https://api.are.na/v2/channels/internet-graveyard?per=100');
const data = await res.json();

const sites = data.contents
  .filter(block => block.class === 'Link' && block.image)
  .sort((a, b) => a.position - b.position)
  .map(block => {
    const url = block.source?.url ?? '';
    const origin = url ? new URL(url).origin : '';
    const slug = origin
      ? new URL(url).hostname.replace(/^www\./, '').replace(/\./g, '-')
      : String(block.id);
    return {
      slug,
      name: block.title || block.generated_title || slug,
      url,
      image: block.image.display.url,
      favicon: origin ? `${origin}/favicon.ico` : '',
    };
  });

writeFileSync(
  'src/lib/sites.ts',
  `export const sites = ${JSON.stringify(sites, null, 2)} as const;\n`
);
console.log(`✓ wrote src/lib/sites.ts (${sites.length} sites)`);
