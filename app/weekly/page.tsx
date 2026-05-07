'use client';
import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import ProgressBar from '@/components/ProgressBar';
import { entriesInRange, loadSettings } from '@/lib/storage';
import { last7, daysAgo, today, dayLabel, dayTotals, displayDate } from '@/lib/calc';
import type { UserSettings, MealEntry } from '@/lib/types';

export default function WeeklyPage() {
  const [weekData, setWeekData] = useState<{date:string;kcal:number}[]>([]);
  const [settings, setSettings] = useState<UserSettings>({ dailyCalorieGoal:2000, dailyProteinGoal:150, dailyFatGoal:65, dailyCarbsGoal:250, weightUnit:'kg' });

  useEffect(() => {
    const s = loadSettings(); setSettings(s);
    const dates = last7();
    const entries = entriesInRange(dates[0], today());
    const byDate = new Map<string, MealEntry[]>();
    for (const e of entries) { const l = byDate.get(e.date)??[]; l.push(e); byDate.set(e.date,l); }
    setWeekData(dates.map(d => ({ date:d, kcal: dayTotals(byDate.get(d)??[]).calories })));
    setSettings(loadSettings());
  }, []);

  const logged = weekData.filter(d=>d.kcal>0);
  const avg = logged.length ? Math.round(logged.reduce((s,d)=>s+d.kcal,0)/logged.length) : 0;
  const maxVal = Math.max(settings.dailyCalorieGoal, ...weekData.map(d=>d.kcal), 1);

  return (
    <div className="bg-appbg min-h-screen pb-24">
      <div className="bg-white sticky top-0 z-40 px-4 py-3 border-b border-border">
        <h1 className="text-lg font-extrabold text-txtpri">Weekly Overview</h1>
      </div>
      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4">
            <p className="label mb-1">Avg. daily</p>
            <p className="text-2xl font-extrabold" style={{color:avg>settings.dailyCalorieGoal?'#FF4757':'#2DB8A4'}}>{avg.toLocaleString()}</p>
            <p className="text-xs text-txtsec">kcal · goal {settings.dailyCalorieGoal.toLocaleString()}</p>
          </div>
          <div className="card p-4">
            <p className="label mb-1">Days logged</p>
            <p className="text-2xl font-extrabold text-accent">{logged.length} <span className="text-base font-normal text-txtsec">/ 7</span></p>
            <p className="text-xs text-txtsec">this week</p>
          </div>
        </div>

        {/* Bar chart */}
        <div className="card p-4">
          <p className="label mb-4">Calories — last 7 days</p>
          <div className="flex items-end gap-1.5 h-36">
            {weekData.map(d => {
              const pct = d.kcal / maxVal;
              const goalPct = settings.dailyCalorieGoal / maxVal;
              const over = d.kcal > settings.dailyCalorieGoal;
              const barColor = d.kcal === 0 ? '#EEE8F8' : over ? '#FF4757' : d.kcal >= settings.dailyCalorieGoal * 0.9 ? '#2DB8A4' : '#FFB800';
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-txtsec">{d.kcal>0?(d.kcal>=1000?`${(d.kcal/1000).toFixed(1)}k`:d.kcal):''}</span>
                  <div className="flex-1 w-full relative bg-muted rounded-t-md overflow-hidden flex flex-col justify-end">
                    <div className="absolute left-0 right-0 border-t border-dashed border-primary/40" style={{bottom:`${goalPct*100}%`}}/>
                    <div className="rounded-t-md transition-all" style={{height:`${Math.max(pct*100,2)}%`, backgroundColor:barColor}}/>
                  </div>
                  <span className="text-[10px] font-semibold text-txtsec">{dayLabel(d.date)}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3">
            {[{c:'#2DB8A4',l:'At goal'},{c:'#FFB800',l:'Under'},{c:'#FF4757',l:'Over'}].map(m=>(
              <div key={m.l} className="flex items-center gap-1.5 text-xs text-txtsec">
                <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:m.c}}/>
                {m.l}
              </div>
            ))}
          </div>
        </div>

        {/* Highlights */}
        {logged.length > 0 && (() => {
          const best = logged.reduce((a,b)=>a.kcal>b.kcal?a:b);
          const low  = logged.reduce((a,b)=>a.kcal<b.kcal?a:b);
          return (
            <div className="card p-4 flex flex-col gap-3">
              <p className="label">Highlights</p>
              <div className="flex items-center gap-3"><span className="text-xl">🔥</span><div className="flex-1"><p className="text-sm font-semibold text-txtpri">Highest: {best.kcal.toLocaleString()} kcal</p><p className="text-xs text-txtsec">{displayDate(best.date)}</p></div></div>
              {low.date !== best.date && <div className="flex items-center gap-3"><span className="text-xl">🌿</span><div className="flex-1"><p className="text-sm font-semibold text-txtpri">Lowest: {low.kcal.toLocaleString()} kcal</p><p className="text-xs text-txtsec">{displayDate(low.date)}</p></div></div>}
              <div className="flex items-center gap-3"><span className="text-xl">📊</span><div className="flex-1"><p className="text-sm font-semibold text-txtpri">vs. goal: {avg>settings.dailyCalorieGoal?'+':'-'}{Math.abs(avg-settings.dailyCalorieGoal).toLocaleString()} kcal/day</p><p className="text-xs text-txtsec">{avg>settings.dailyCalorieGoal?'Over average':'Under average'}</p></div></div>
            </div>
          );
        })()}
      </div>
      <BottomNav/>
    </div>
  );
}
