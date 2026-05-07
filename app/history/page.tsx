'use client';
import { useEffect, useState, useCallback } from 'react';
import BottomNav from '@/components/BottomNav';
import MealCard from '@/components/MealCard';
import { loadEntries, deleteEntry, updateEntry } from '@/lib/storage';
import { displayDate, dayTotals } from '@/lib/calc';
import type { MealEntry } from '@/lib/types';

function groupByDate(entries: MealEntry[]) {
  const map = new Map<string, MealEntry[]>();
  for (const e of entries) {
    const list = map.get(e.date) ?? [];
    list.push(e);
    map.set(e.date, list);
  }
  return Array.from(map.entries())
    .map(([date, entries]) => ({ date, entries: entries.sort((a,b)=>a.savedAt.localeCompare(b.savedAt)), totals: dayTotals(entries) }))
    .sort((a,b) => b.date.localeCompare(a.date));
}

export default function HistoryPage() {
  const [days, setDays] = useState<ReturnType<typeof groupByDate>>([]);

  const load = useCallback(() => {
    setDays(groupByDate(loadEntries()));
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleDelete(id: string) {
    if (confirm('Delete this meal?')) { deleteEntry(id); load(); }
  }

  function handleUpdate(e: MealEntry) { updateEntry(e); load(); }

  return (
    <div className="bg-appbg min-h-screen pb-24">
      <div className="bg-white sticky top-0 z-40 px-4 py-3 border-b border-border">
        <h1 className="text-lg font-extrabold text-txtpri">History</h1>
      </div>
      <div className="px-4 py-4 flex flex-col gap-5">
        {days.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="text-5xl">📅</span>
            <p className="font-bold text-lg text-txtpri">No history yet</p>
            <p className="text-txtsec text-sm">Scan a meal to start tracking.</p>
          </div>
        ) : days.map(day => (
          <div key={day.date} className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="font-bold text-txtpri">{displayDate(day.date)}</span>
              <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">{day.totals.calories.toLocaleString()} kcal</span>
            </div>
            {day.entries.map(e=><MealCard key={e.id} entry={e} onUpdate={handleUpdate} onDelete={handleDelete}/>)}
          </div>
        ))}
      </div>
      <BottomNav/>
    </div>
  );
}
