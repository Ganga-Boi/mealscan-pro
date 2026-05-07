import type { MealEntry, WeightEntry, UserSettings } from './types';
const KEYS = { ENTRIES:'ms_entries', WEIGHTS:'ms_weights', SETTINGS:'ms_settings' };
const DEFAULT: UserSettings = { dailyCalorieGoal:2000, dailyProteinGoal:150, dailyFatGoal:65, dailyCarbsGoal:250, weightUnit:'kg' };
function load<T>(key:string, fb:T):T {
  if(typeof window==='undefined') return fb;
  try { const r=localStorage.getItem(key); return r?JSON.parse(r) as T:fb; } catch{ return fb; }
}
function save<T>(key:string, val:T){ if(typeof window==='undefined')return; try{localStorage.setItem(key,JSON.stringify(val));}catch{} }
export const loadEntries   = ():MealEntry[]   => load<MealEntry[]>(KEYS.ENTRIES,[]);
export const addEntry      = (e:MealEntry)    => save(KEYS.ENTRIES,[e,...loadEntries()]);
export const updateEntry   = (e:MealEntry)    => save(KEYS.ENTRIES,loadEntries().map(x=>x.id===e.id?e:x));
export const deleteEntry   = (id:string)      => save(KEYS.ENTRIES,loadEntries().filter(x=>x.id!==id));
export const entriesForDate  = (d:string)     => loadEntries().filter(x=>x.date===d);
export const entriesInRange  = (a:string,b:string) => loadEntries().filter(x=>x.date>=a&&x.date<=b);
export const loadWeights   = ():WeightEntry[] => load<WeightEntry[]>(KEYS.WEIGHTS,[]);
export const addWeight     = (w:WeightEntry)  => save(KEYS.WEIGHTS,[w,...loadWeights()]);
export const deleteWeight  = (id:string)      => save(KEYS.WEIGHTS,loadWeights().filter(x=>x.id!==id));
export const loadSettings  = ():UserSettings  => load<UserSettings>(KEYS.SETTINGS,{...DEFAULT});
export const saveSettings  = (s:UserSettings) => save(KEYS.SETTINGS,s);
