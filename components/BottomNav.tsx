'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href:'/', label:'Home', icon:(a:boolean)=>(
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke={a?'#2DB8A4':'#9494AA'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/>
    </svg>)},
  { href:'/history', label:'History', icon:(a:boolean)=>(
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke={a?'#2DB8A4':'#9494AA'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>)},
  { href:'/scan', label:'Scan', icon:()=>(
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="#fff" strokeWidth="2" strokeLinecap="round">
      <rect x="2" y="7" width="20" height="14" rx="3"/><circle cx="12" cy="14" r="3"/><path d="M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2"/>
    </svg>)},
  { href:'/weekly', label:'Weekly', icon:(a:boolean)=>(
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke={a?'#2DB8A4':'#9494AA'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>)},
  { href:'/settings', label:'Goals', icon:(a:boolean)=>(
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke={a?'#2DB8A4':'#9494AA'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
    </svg>)},
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-white border-t border-border flex items-end h-16">
      {tabs.map(t => {
        const active = path === t.href;
        const isScan = t.href === '/scan';
        return (
          <Link key={t.href} href={t.href} className={`flex-1 flex flex-col items-center justify-end pb-2 gap-0.5 ${isScan?'relative':''}`}>
            {isScan
              ? <div className="absolute -top-5 w-14 h-14 bg-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/40">{t.icon(false)}</div>
              : t.icon(active)}
            <span className={`text-[10px] font-semibold ${active&&!isScan?'text-primary':'text-txtsec'} ${isScan?'mt-8':''}`}>{t.label}</span>
            {active && !isScan && <div className="w-1 h-1 rounded-full bg-primary"/>}
          </Link>
        );
      })}
    </nav>
  );
}
