'use client';
import { useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MealTypeSelector from '@/components/MealTypeSelector';
import BottomNav from '@/components/BottomNav';
import { compressImage, mealTotals, uid, today } from '@/lib/calc';
import { addEntry } from '@/lib/storage';
import type { MealType, FoodItem, AnalysisResult, MealEntry } from '@/lib/types';

type Status = 'idle'|'compressing'|'uploading'|'analyzing'|'done'|'error';

const STATUS_TEXT: Record<Status,string> = {
  idle:'', compressing:'Optimizing image…', uploading:'Uploading…',
  analyzing:'AI is analyzing your meal…', done:'', error:''
};

export default function ScanPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [status, setStatus]     = useState<Status>('idle');
  const [preview, setPreview]   = useState<string|null>(null);
  const [b64, setB64]           = useState<string|null>(null);
  const [result, setResult]     = useState<AnalysisResult|null>(null);
  const [items, setItems]       = useState<FoodItem[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [saved, setSaved]       = useState(false);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setPreview(URL.createObjectURL(file));
    setSaved(false);
    setErrorMsg('');

    try {
      setStatus('compressing');
      const compressed = await compressImage(file);
      setB64(compressed);

      setStatus('uploading');
      await new Promise(r => setTimeout(r, 0));

      setStatus('analyzing');
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: compressed }),
        signal: AbortSignal.timeout ? AbortSignal.timeout(55000) : undefined,
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({error:'Server error'}));
        throw new Error(err.error ?? 'Server error');
      }
      const data = await res.json() as AnalysisResult;
      setResult(data);
      setItems(data.items.map(item => ({ ...item, id: uid(), grams: item.estimated_grams, note: item.note ?? '' })));
      setStatus('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStatus('error');
    }
  }, []);

  function handleGrams(id: string, val: string) {
    const g = parseFloat(val);
    if (!isNaN(g) && g >= 0) setItems(prev => prev.map(i => i.id === id ? { ...i, grams: g } : i));
  }

  async function handleSave() {
    if (!result || items.length === 0) return;
    const entry: MealEntry = {
      id: uid(), date: today(), mealType, savedAt: new Date().toISOString(),
      imageUri: preview, confidence: result.confidence, isAIEstimate: true,
      items, totals: mealTotals(items),
    };
    addEntry(entry);
    setSaved(true);
    setTimeout(() => router.push('/'), 1200);
  }

  function reset() {
    setStatus('idle'); setPreview(null); setB64(null);
    setResult(null); setItems([]); setErrorMsg(''); setSaved(false);
  }

  const totals = mealTotals(items);
  const loading = ['compressing','uploading','analyzing'].includes(status);

  return (
    <div className="bg-appbg min-h-screen pb-24">
      <div className="bg-white sticky top-0 z-40 px-4 py-3 border-b border-border">
        <h1 className="text-lg font-extrabold text-txtpri">Scan Meal</h1>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Idle */}
        {status === 'idle' && (
          <>
            <MealTypeSelector selected={mealType} onSelect={setMealType}/>
            <div className="flex flex-col gap-3 mt-2">
              <button onClick={() => fileRef.current?.click()} className="btn-pri text-base">📷 Take Photo</button>
              <label className="btn-sec text-base cursor-pointer text-center">
                🖼️ Choose from Gallery
                <input type="file" accept="image/*" onChange={handleFile} className="hidden"/>
              </label>
            </div>
            <p className="text-center text-xs text-txtsec">Good lighting + clear angle = best results</p>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden"/>
          </>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-6 py-12">
            {preview && <img src={preview} className="w-full max-h-52 object-cover rounded-2xl"/>}
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
              <p className="font-semibold text-txtpri text-base">{STATUS_TEXT[status]}</p>
            </div>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="flex flex-col gap-4">
            {preview && <img src={preview} className="w-full max-h-48 object-cover rounded-2xl"/>}
            <div className="card p-4 bg-red-50 border-danger/30 flex flex-col gap-3">
              <p className="font-bold text-danger">Something went wrong</p>
              <p className="text-sm text-txtsec">{errorMsg}</p>
              <button onClick={reset} className="btn-pri">Try Again</button>
            </div>
          </div>
        )}

        {/* Results */}
        {status === 'done' && result && (
          <div className="flex flex-col gap-4">
            {preview && <img src={preview} className="w-full max-h-52 object-cover rounded-2xl"/>}

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-sm text-amber-700">
              ⚠️ <strong>Estimated values</strong> — adjust grams for better accuracy.
            </div>

            <MealTypeSelector selected={mealType} onSelect={setMealType}/>

            {/* Totals summary */}
            <div className="card p-4">
              <div className="text-3xl font-extrabold tracking-tight text-txtpri">{totals.calories.toLocaleString()} <span className="text-base font-normal text-txtsec">kcal</span></div>
              <div className="flex gap-4 mt-2">
                {[{l:'Protein',v:totals.protein,c:'#2DB8A4'},{l:'Fat',v:totals.fat,c:'#FF8A65'},{l:'Carbs',v:totals.carbs,c:'#FFB800'}].map(m=>(
                  <div key={m.l} className="flex flex-col">
                    <span className="font-bold text-sm" style={{color:m.c}}>{m.v.toFixed(1)}g</span>
                    <span className="text-xs text-txtsec">{m.l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="flex flex-col gap-2">
              <div className="label px-1">Items ({items.length})</div>
              {items.map(item => (
                <div key={item.id} className="card p-3 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-txtpri">{item.name}</p>
                      {item.note && <p className="text-xs text-txtsec italic">{item.note}</p>}
                    </div>
                    <div className="flex items-center gap-1 bg-muted rounded-xl px-2 py-1 border border-border flex-shrink-0">
                      <input type="number" value={item.grams} onChange={e=>handleGrams(item.id,e.target.value)}
                        className="w-16 text-right font-bold text-base outline-none bg-transparent text-txtpri"/>
                      <span className="text-xs text-txtsec">g</span>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="font-bold text-txtpri">{Math.round(item.grams*item.calories_per_100g/100)} kcal</span>
                    <span className="text-txtsec">P: {(item.grams*item.protein_per_100g/100).toFixed(1)}g</span>
                    <span className="text-txtsec">F: {(item.grams*item.fat_per_100g/100).toFixed(1)}g</span>
                    <span className="text-txtsec">C: {(item.grams*item.carbs_per_100g/100).toFixed(1)}g</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pb-4">
              {!saved
                ? <button onClick={handleSave} className="btn-pri text-base">💾 Save Meal</button>
                : <div className="btn-sec text-primary font-bold text-base border-primary/30 bg-primary/5 text-center py-4 rounded-2xl">✓ Saved to today's log</div>
              }
              <button onClick={reset} className="btn-sec text-base">Scan Another</button>
            </div>
          </div>
        )}
      </div>
      <BottomNav/>
    </div>
  );
}
