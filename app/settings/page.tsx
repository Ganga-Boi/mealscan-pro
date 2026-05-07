'use client';
import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { loadSettings, saveSettings } from '@/lib/storage';
import type { UserSettings } from '@/lib/types';

export default function SettingsPage() {
  const [s, setS] = useState<UserSettings>({ dailyCalorieGoal:2000, dailyProteinGoal:150, dailyFatGoal:65, dailyCarbsGoal:250, weightUnit:'kg' });
  const [saved, setSaved] = useState(false);

  useEffect(() => { setS(loadSettings()); }, []);

  function update(k: keyof UserSettings, v: string | number) {
    setS(prev => ({ ...prev, [k]: v }));
    setSaved(false);
  }

  function handleSave() {
    const validated: UserSettings = {
      ...s,
      dailyCalorieGoal: Math.max(500, Math.min(10000, Number(s.dailyCalorieGoal) || 2000)),
      dailyProteinGoal: Math.max(10,  Math.min(1000,  Number(s.dailyProteinGoal) || 150)),
      dailyFatGoal:     Math.max(5,   Math.min(500,   Number(s.dailyFatGoal)     || 65)),
      dailyCarbsGoal:   Math.max(10,  Math.min(2000,  Number(s.dailyCarbsGoal)   || 250)),
    };
    saveSettings(validated);
    setS(validated);
    setSaved(true);
  }

  function GoalRow({ label, field, unit, color }: { label:string; field:keyof UserSettings; unit:string; color:string }) {
    return (
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold flex-1" style={{color}}>{label}</span>
        <div className="flex items-center gap-1 bg-muted rounded-xl border border-border px-3 py-2">
          <input type="number" value={String(s[field])} onChange={e=>update(field, e.target.value)}
            className="w-16 text-right font-bold text-base outline-none bg-transparent text-txtpri"/>
          <span className="text-xs text-txtsec">{unit}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-appbg min-h-screen pb-24">
      <div className="bg-white sticky top-0 z-40 px-4 py-3 border-b border-border">
        <h1 className="text-lg font-extrabold text-txtpri">Goals & Settings</h1>
      </div>
      <div className="px-4 py-4 flex flex-col gap-4">
        <div className="card p-4 flex flex-col gap-4">
          <p className="font-bold text-txtpri">Daily Calorie Goal</p>
          <GoalRow label="Calories" field="dailyCalorieGoal" unit="kcal" color="#1A1829"/>
        </div>
        <div className="card p-4 flex flex-col gap-4">
          <p className="font-bold text-txtpri">Macro Goals</p>
          <GoalRow label="Protein" field="dailyProteinGoal" unit="g/day" color="#2DB8A4"/>
          <GoalRow label="Fat"     field="dailyFatGoal"     unit="g/day" color="#FF8A65"/>
          <GoalRow label="Carbs"   field="dailyCarbsGoal"   unit="g/day" color="#FFB800"/>
        </div>
        <div className="card p-4 flex flex-col gap-3">
          <p className="font-bold text-txtpri">Weight Unit</p>
          <div className="flex gap-3">
            {(['kg','lbs'] as const).map(u => (
              <button key={u} onClick={()=>{update('weightUnit',u);setSaved(false);}}
                className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${s.weightUnit===u?'border-primary bg-primary/10 text-primary':'border-border bg-white text-txtsec'}`}>
                {u}
              </button>
            ))}
          </div>
        </div>
        <div className="card p-4 bg-amber-50 border-amber-200">
          <p className="font-bold text-amber-800 mb-2">⚠️ About AI Estimates</p>
          <p className="text-sm text-amber-700 leading-relaxed">All calorie values from AI scanning are <strong>estimates</strong>. Accuracy depends on image quality and portion visibility.<br/><br/><em>"Estimated values — adjust for better accuracy."</em></p>
        </div>
        <button onClick={handleSave} className={`btn-pri text-base ${saved?'opacity-60':''}`}>
          {saved ? '✓ Saved' : '💾 Save Settings'}
        </button>
        <button onClick={()=>{if(confirm('Reset all goals to defaults?')){saveSettings({dailyCalorieGoal:2000,dailyProteinGoal:150,dailyFatGoal:65,dailyCarbsGoal:250,weightUnit:'kg'});setS(loadSettings());setSaved(false);}}} className="btn-sec text-sm">Reset to defaults</button>
      </div>
      <BottomNav/>
    </div>
  );
}
