'use client';
import { useState } from 'react';
import type { MealEntry, FoodItem } from '@/lib/types';
import { fmtTime, mealTotals } from '@/lib/calc';

const TYPE_META: Record<string, { icon:string; color:string }> = {
  breakfast: { icon:'🌅', color:'#FFA726' },
  lunch:     { icon:'☀️', color:'#64B5F6' },
  dinner:    { icon:'🌙', color:'#B39DDB' },
  snack:     { icon:'🍎', color:'#66BB6A' },
};

interface Props {
  entry: MealEntry;
  onUpdate?: (e: MealEntry) => void;
  onDelete?: (id: string) => void;
}

export default function MealCard({ entry, onUpdate, onDelete }: Props) {
  const [open, setOpen]     = useState(false);
  const [editing, setEditing] = useState(false);
  const [items, setItems]   = useState<FoodItem[]>(entry.items);
  const meta = TYPE_META[entry.mealType];
  const totals = editing ? mealTotals(items) : entry.totals;

  function handleGrams(id: string, val: string) {
    const g = parseFloat(val);
    if (!isNaN(g) && g >= 0) setItems(prev => prev.map(i => i.id === id ? { ...i, grams: g } : i));
  }

  function handleSave() {
    if (!onUpdate) return;
    const newTotals = mealTotals(items);
    onUpdate({ ...entry, items, totals: newTotals });
    setEditing(false);
  }

  return (
    <div className="card overflow-hidden" style={{ borderLeftWidth:3, borderLeftColor: meta.color }}>
      <button className="w-full flex items-center gap-3 p-3 text-left" onClick={() => setOpen(o => !o)}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor:`${meta.color}22` }}>
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm capitalize" style={{ color: meta.color }}>{entry.mealType}</span>
            <span className="text-[10px] text-txtmuted">{fmtTime(entry.savedAt)}</span>
            {entry.isAIEstimate && <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded uppercase">AI</span>}
          </div>
          <div className="text-xs text-txtsec truncate">{entry.items.map(i=>i.name).join(' · ')}</div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="font-bold text-base">{totals.calories}</span>
          <span className="text-xs text-txtmuted">kcal</span>
          <span className="text-txtmuted text-xs ml-1">{open?'▲':'▼'}</span>
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 flex flex-col gap-3 border-t border-border pt-3">
          {entry.isAIEstimate && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-700">
              ⚠️ Estimated values — adjust grams for better accuracy.
            </div>
          )}
          {entry.imageUri && (
            <img src={entry.imageUri} alt="meal" className="w-full h-40 object-cover rounded-xl"/>
          )}
          <div className="flex justify-around bg-muted rounded-xl p-2">
            {[{l:'Protein',v:totals.protein,c:'#2DB8A4'},{l:'Fat',v:totals.fat,c:'#FF8A65'},{l:'Carbs',v:totals.carbs,c:'#FFB800'}].map(m=>(
              <div key={m.l} className="flex flex-col items-center gap-0.5">
                <span className="font-bold text-sm" style={{color:m.c}}>{m.v.toFixed(1)}g</span>
                <span className="text-[10px] text-txtsec uppercase">{m.l}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-2 bg-muted/50 rounded-xl p-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{item.name}</div>
                  {item.note && <div className="text-[10px] text-txtsec italic">{item.note}</div>}
                </div>
                {editing ? (
                  <div className="flex items-center gap-1 bg-white border border-border rounded-lg px-2 py-1">
                    <input type="number" value={item.grams} onChange={e=>handleGrams(item.id,e.target.value)}
                      className="w-16 text-right font-bold text-sm outline-none bg-transparent"/>
                    <span className="text-xs text-txtsec">g</span>
                  </div>
                ) : (
                  <span className="text-xs text-txtsec bg-white px-2 py-1 rounded-lg border border-border">{item.grams}g</span>
                )}
                <span className="text-sm font-bold text-txtpri w-14 text-right">
                  {Math.round(item.grams * item.calories_per_100g / 100)} kcal
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={handleSave} className="flex-1 bg-primary text-white text-sm font-bold rounded-xl py-2.5">✓ Save</button>
                <button onClick={()=>{setItems(entry.items);setEditing(false);}} className="flex-1 bg-muted text-txtsec text-sm font-semibold rounded-xl py-2.5 border border-border">Cancel</button>
              </>
            ) : (
              <>
                {onUpdate && <button onClick={()=>setEditing(true)} className="flex-1 bg-muted text-txtpri text-sm font-semibold rounded-xl py-2.5 border border-border">✏️ Edit grams</button>}
                {onDelete && <button onClick={()=>onDelete(entry.id)} className="flex-1 bg-red-50 text-danger text-sm font-semibold rounded-xl py-2.5 border border-danger/30">🗑 Delete</button>}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
