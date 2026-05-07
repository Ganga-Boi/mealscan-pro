import type { FoodItem, MealEntry, MealTotals } from './types';
export const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
export const today    = () => new Date().toISOString().split('T')[0];
export function daysAgo(n:number){ const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().split('T')[0]; }
export const last7    = () => Array.from({length:7},(_,i)=>daysAgo(6-i));
export function displayDate(s:string){
  if(s===today()) return 'Today'; if(s===daysAgo(1)) return 'Yesterday';
  const d=new Date(s+'T00:00:00'); return d.toLocaleDateString('en-GB',{weekday:'short',day:'2-digit',month:'short'});
}
export function fullDate(s:string){ return new Date(s+'T00:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'}); }
export function fmtTime(iso:string){ return new Date(iso).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}); }
export function dayLabel(s:string){ return new Date(s+'T00:00:00').toLocaleDateString('en-GB',{weekday:'short'}); }
export function itemTotals(item:FoodItem){ const g=item.grams; return { calories:Math.round(g*item.calories_per_100g/100), protein:Math.round(g*item.protein_per_100g/100*10)/10, fat:Math.round(g*item.fat_per_100g/100*10)/10, carbs:Math.round(g*item.carbs_per_100g/100*10)/10 }; }
export function mealTotals(items:FoodItem[]):MealTotals { return items.reduce((a,item)=>{ const t=itemTotals(item); return{ calories:a.calories+t.calories, protein:Math.round((a.protein+t.protein)*10)/10, fat:Math.round((a.fat+t.fat)*10)/10, carbs:Math.round((a.carbs+t.carbs)*10)/10 }; },{calories:0,protein:0,fat:0,carbs:0}); }
export function dayTotals(entries:MealEntry[]):MealTotals { return entries.reduce((a,e)=>({ calories:a.calories+e.totals.calories, protein:Math.round((a.protein+e.totals.protein)*10)/10, fat:Math.round((a.fat+e.totals.fat)*10)/10, carbs:Math.round((a.carbs+e.totals.carbs)*10)/10 }),{calories:0,protein:0,fat:0,carbs:0}); }
export const clamp = (v:number,max:number) => max>0?Math.min(1,Math.max(0,v/max)):0;
export async function compressImage(file:File):Promise<string>{
  return new Promise((resolve,reject)=>{ const img=new Image(); img.onload=()=>{ const MAX=1200; let{width,height}=img; if(width>MAX||height>MAX){if(width>height){height=(height/width)*MAX;width=MAX;}else{width=(width/height)*MAX;height=MAX;}} const canvas=document.createElement('canvas'); canvas.width=Math.round(width); canvas.height=Math.round(height); const ctx=canvas.getContext('2d'); if(!ctx){reject(new Error('no ctx'));return;} ctx.drawImage(img,0,0,canvas.width,canvas.height); resolve(canvas.toDataURL('image/jpeg',0.75).split(',')[1]); }; img.onerror=()=>reject(new Error('load failed')); img.src=URL.createObjectURL(file); });
}
