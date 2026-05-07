'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import ProgressBar from '@/components/ProgressBar';
import MealCard from '@/components/MealCard';
import { entriesForDate, loadSettings, updateEntry, deleteEntry } from '@/lib/storage';
import { today, fullDate, dayTotals, clamp } from '@/lib/calc';
import type { MealEntry, UserSettings } from '@/lib/types';

export default function Dashboard() {
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [settings, setSettings] = useState<UserSettings>({ dailyCalorieGoal:2000, dailyProteinGoal:150, dailyFatGoal:65, dailyCarbsGoal:250, weightUnit:'kg' });

  const load = useCallback(() => {
    setEntries(entriesForDate(today()).sort((a,b)=>a.savedAt.localeCompare(b.savedAt)));
    setSettings(loadSettings());
  }, []);

  useEffect(() => { load(); }, [load]);

  const totals = dayTotals(entries);
  const remaining = settings.dailyCalorieGoal - totals.calories;
  const calPct = clamp(totals.calories, settings.dailyCalorieGoal);
  const over = totals.calories > settings.dailyCalorieGoal;
  const ringDeg = calPct * 360;

  function handleUpdate(e: MealEntry) { updateEntry(e); load(); }
  function handleDelete(id: string) { if(confirm('Delete this meal?')){ deleteEntry(id); load(); } }

  return (
    <div className="bg-appbg min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="label">Today</p>
            <h1 className="text-lg font-extrabold text-txtpri leading-tight">{fullDate(today())}</h1>
          </div>
          <Link href="/scan" className="flex items-center gap-1.5 bg-primary text-white text-sm font-bold px-4 py-2.5 rounded-full shadow-sm shadow-primary/30 active:opacity-80">
            📷 Scan
          </Link>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Calorie card */}
        <div className="card p-4 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-4xl font-extrabold tracking-tight" style={{color: over?'#FF4757':'#1A1829'}}>{totals.calories.toLocaleString()}</div>
              <div className="text-sm text-txtsec">of {settings.dailyCalorieGoal.toLocaleString()} kcal goal</div>
            </div>
            <div className="text-right">
              <div className={`text-xl font-bold ${over?'text-danger':'text-primary'}`}>
                {over?'+':''}{Math.abs(remaining).toLocaleString()}
              </div>
              <div className="text-xs text-txtsec">{over?'over goal':'remaining'}</div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width:`${calPct*100}%`, backgroundColor: over?'#FF4757':calPct>0.9?'#FFB800':'#2DB8A4' }}/>
          </div>
          {/* Macros */}
          <div className="flex flex-col gap-3">
            <ProgressBar label="Protein" value={totals.protein} goal={settings.dailyProteinGoal} unit="g" color="#2DB8A4"/>
            <ProgressBar label="Fat"     value={totals.fat}     goal={settings.dailyFatGoal}     unit="g" color="#FF8A65"/>
            <ProgressBar label="Carbs"   value={totals.carbs}   goal={settings.dailyCarbsGoal}   unit="g" color="#FFB800"/>
          </div>
        </div>

        {/* Meal list */}
        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="text-5xl">🍽️</span>
            <p className="font-bold text-txtpri text-lg">No meals logged yet</p>
            <p className="text-txtsec text-sm">Tap Scan to add your first meal.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {['breakfast','lunch','dinner','snack'].map(type => {
              const group = entries.filter(e=>e.mealType===type);
              if(!group.length) return null;
              const typeKcal = group.reduce((s,e)=>s+e.totals.calories,0);
              return (
                <div key={type} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="font-bold text-sm capitalize text-txtpri">{type}</span>
                    <span className="text-xs text-txtsec">{typeKcal} kcal</span>
                  </div>
                  {group.map(e=><MealCard key={e.id} entry={e} onUpdate={handleUpdate} onDelete={handleDelete}/>)}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav/>
    </div>
  );
}
