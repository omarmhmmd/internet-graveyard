import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { writeFileSync } from 'fs'

function syncSitesPlugin() {
  return {
    name: 'sync-sites',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.method !== 'POST' || req.url !== '/api/sync-sites') return next();

        try {
          const apiRes = await fetch('https://api.are.na/v2/channels/internet-graveyard?per=100');
          const data = await apiRes.json();

          const sites = data.contents
            .filter((b: any) => b.class === 'Link' && b.image)
            .sort((a: any, b: any) => a.position - b.position)
            .map((block: any) => {
              const url = block.source?.url ?? '';
              const origin = url ? new URL(url).origin : '';
              const slug = origin
                ? new URL(url).hostname.replace(/^www\./, '').replace(/\./g, '-')
                : String(block.id);
              return {
                slug,
                position: block.position,
                name: block.title || block.generated_title || slug,
                url,
                image: block.image.display.url,
                favicon: origin ? `${origin}/favicon.ico` : '',
              };
            });

          writeFileSync(
            path.resolve('./src/lib/sites.ts'),
            `export const sites = ${JSON.stringify(sites, null, 2)} as const;\n`
          );

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ count: sites.length }));
        } catch (err: any) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), svelte(), syncSitesPlugin()],
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib'),
    },
  },
})
