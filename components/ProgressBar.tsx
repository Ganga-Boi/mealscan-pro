interface Props { label:string; value:number; goal:number; unit:string; color:string; }
export default function ProgressBar({ label, value, goal, unit, color }: Props) {
  const pct = goal > 0 ? Math.min(1, value / goal) : 0;
  const over = value > goal;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-txtsec">{label}</span>
        <span className={`text-xs font-bold ${over?'text-danger':'text-txtpri'}`}>
          {value.toFixed(value < 10 ? 1 : 0)}<span className="text-txtmuted font-normal"> / {goal}{unit}</span>
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width:`${pct*100}%`, backgroundColor: over?'#FF4757':color }}/>
      </div>
    </div>
  );
}
