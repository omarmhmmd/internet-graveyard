import { writable } from 'svelte/store';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

export const onlineCount = writable(1);

export function trackPresence() {
  const channel = supabase.channel('presence', {
    config: { presence: { key: crypto.randomUUID() } },
  });

  channel.on('presence', { event: 'sync' }, () => {
    const count = Object.keys(channel.presenceState()).length;
    onlineCount.set(Math.max(count, 1));
  });

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ t: Date.now() });
    }
  });

  return () => supabase.removeChannel(channel);
}
