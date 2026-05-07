import type { MealType } from '@/lib/types';
const TYPES: { t: MealType; label: string; icon: string; color: string }[] = [
  { t:'breakfast', label:'Breakfast', icon:'🌅', color:'#FFA726' },
  { t:'lunch',     label:'Lunch',     icon:'☀️', color:'#64B5F6' },
  { t:'dinner',    label:'Dinner',    icon:'🌙', color:'#B39DDB' },
  { t:'snack',     label:'Snack',     icon:'🍎', color:'#66BB6A' },
];
interface Props { selected: MealType; onSelect: (t: MealType) => void; }
export default function MealTypeSelector({ selected, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <span className="label">Meal type</span>
      <div className="flex gap-2 flex-wrap">
        {TYPES.map(({ t, label, icon, color }) => {
          const active = selected === t;
          return (
            <button key={t} onClick={() => onSelect(t)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm font-semibold transition-all"
              style={{ borderColor: active ? color : '#E4DEEE', backgroundColor: active ? `${color}22` : '#fff', color: active ? color : '#9494AA' }}>
              <span>{icon}</span>{label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
