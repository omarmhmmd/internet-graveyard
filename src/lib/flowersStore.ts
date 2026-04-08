import { writable } from 'svelte/store';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

export interface Flower {
  id: string;
  x: number;
  y: number;
}

export const flowersStore = writable<Flower[]>([]);

export async function loadFlowers() {
  const { data } = await supabase.from('flowers').select('id, x, y');
  if (data) flowersStore.set(data);
}

// Track locally-placed IDs to avoid double-adding from real-time echo
const localIds = new Set<string>();

export function subscribeFlowers() {
  return supabase
    .channel('flowers')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'flowers' }, payload => {
      const f = payload.new as Flower;
      if (localIds.has(f.id)) { localIds.delete(f.id); return; }
      flowersStore.update(fs => [...fs, { id: f.id, x: f.x, y: f.y }]);
    })
    .subscribe();
}

export async function placeFlower(x: number, y: number) {
  // Optimistically add to local store immediately
  const tempId = crypto.randomUUID();
  flowersStore.update(fs => [...fs, { id: tempId, x, y }]);

  const { data } = await supabase.from('flowers').insert({ x, y }).select('id').single();
  if (data) {
    // Swap temp id for real id and register to skip the real-time echo
    localIds.add(data.id);
    flowersStore.update(fs => fs.map(f => f.id === tempId ? { ...f, id: data.id } : f));
  }
}
