'use client';
import { useEffect, useState, useCallback } from 'react';
import BottomNav from '@/components/BottomNav';
import { loadWeights, addWeight, deleteWeight, loadSettings } from '@/lib/storage';
import { uid, today, displayDate } from '@/lib/calc';
import type { WeightEntry } from '@/lib/types';

export default function WeightPage() {
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [unit, setUnit] = useState<'kg'|'lbs'>('kg');
  const [showAdd, setShowAdd] = useState(false);
  const [val, setVal] = useState('');
  const [note, setNote] = useState('');

  const load = useCallback(() => {
    setWeights(loadWeights());
    setUnit(loadSettings().weightUnit);
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleAdd() {
    const n = parseFloat(val.replace(',','.'));
    if (isNaN(n) || n <= 0 || n > 700) return alert('Enter a valid weight');
    addWeight({ id:uid(), date:today(), savedAt:new Date().toISOString(), weight:n, unit, note:note.trim() });
    setVal(''); setNote(''); setShowAdd(false); load();
  }

  function handleDelete(id: string) {
    if (confirm('Delete this entry?')) { deleteWeight(id); load(); }
  }

  const latest = weights[0];

  return (
    <div className="bg-appbg min-h-screen pb-24">
      <div className="bg-white sticky top-0 z-40 px-4 py-3 border-b border-border">
        <h1 className="text-lg font-extrabold text-txtpri">Weight Log</h1>
      </div>
      <div className="px-4 py-4 flex flex-col gap-4">
        <div className="card p-5 flex flex-col items-center gap-3 text-center">
          {latest
            ? (<><p className="label">Latest weight</p><p className="text-5xl font-extrabold text-txtpri tracking-tight">{latest.weight}<span className="text-2xl ml-1 font-bold text-txtsec">{latest.unit}</span></p><p className="text-sm text-txtsec">{displayDate(latest.date)}</p>{latest.note&&<p className="text-xs text-txtsec italic">{latest.note}</p>}</>)
            : (<><p className="text-4xl">⚖️</p><p className="font-bold text-txtpri">No entries yet</p><p className="text-sm text-txtsec">Log your weight to track progress.</p></>)
          }
          <button onClick={()=>setShowAdd(true)} className="btn-pri px-8 rounded-full mt-2 py-3 text-sm">+ Log Weight</button>
        </div>

        {showAdd && (
          <div className="card p-4 flex flex-col gap-3 border-accent/30">
            <p className="font-bold text-txtpri">New Entry</p>
            <div className="flex items-center gap-2 bg-muted rounded-xl border border-border px-3 py-2">
              <input autoFocus type="number" value={val} onChange={e=>setVal(e.target.value)} placeholder={`e.g. 75.5`}
                className="flex-1 font-bold text-lg outline-none bg-transparent text-txtpri"/>
              <span className="text-sm text-txtsec">{unit}</span>
            </div>
            <input type="text" value={note} onChange={e=>setNote(e.target.value)} placeholder="Note (optional)"
              className="bg-muted border border-border rounded-xl px-3 py-2 text-sm outline-none text-txtpri placeholder-txtmuted"/>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="flex-2 btn-pri text-sm flex-1">Save</button>
              <button onClick={()=>{setShowAdd(false);setVal('');setNote('');}} className="flex-1 btn-sec text-sm">Cancel</button>
            </div>
          </div>
        )}

        {weights.length > 0 && (
          <div className="card overflow-hidden">
            {weights.map((w, i) => (
              <div key={w.id} className={`flex items-center gap-3 px-4 py-3 ${i>0?'border-t border-border':''}`}>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-txtpri">{displayDate(w.date)}</p>
                  {w.note && <p className="text-xs text-txtsec italic">{w.note}</p>}
                </div>
                <span className="font-bold text-primary">{w.weight} {w.unit}</span>
                <button onClick={()=>handleDelete(w.id)} className="text-txtsec text-lg active:text-danger">🗑</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav/>
    </div>
  );
}
