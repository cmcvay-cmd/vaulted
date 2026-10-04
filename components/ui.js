// components/ui.js — icons, condition chips, product artwork
const PATHS = {
  bag: <g><path d="M5.5 8.5h13l-1 11.5h-11l-1-11.5z"/><path d="M8.5 8.5V7a3.5 3.5 0 017 0v1.5"/></g>,
  back: <path d="M14.5 5.5L8 12l6.5 6.5"/>,
  chev: <path d="M6 9.5l6 6 6-6"/>,
  plus: <path d="M12 5.5v13M5.5 12h13"/>,
  minus: <path d="M5.5 12h13"/>,
  x: <path d="M6.5 6.5l11 11m0-11l-11 11"/>,
  send: <path d="M12 19V5.5m0 0L6.5 11M12 5.5l5.5 5.5"/>,
  check: <path d="M5 12.5l4.5 4.5L19 7.5"/>,
  info: <g><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 7.6v.4"/></g>,
  shield: <g><path d="M12 3.5l7 2.8v4.9c0 4.6-3 8.2-7 9.8-4-1.6-7-5.2-7-9.8V6.3l7-2.8z"/><path d="M9.3 12l2 2 3.4-3.8"/></g>,
  globe: <g><circle cx="12" cy="12" r="8.3"/><path d="M3.7 12h16.6M12 3.7c2.4 2.3 3.6 5.1 3.6 8.3s-1.2 6-3.6 8.3c-2.4-2.3-3.6-5.1-3.6-8.3s1.2-6 3.6-8.3z"/></g>,
  truck: <g><path d="M2.5 7.5h11.5v9H2.5zM14 10.5h3.6l3 3v3H14z"/><circle cx="6.5" cy="18" r="1.7"/><circle cx="17" cy="18" r="1.7"/></g>,
  spark: <path d="M12 4.5l1.6 4.4 4.4 1.6-4.4 1.6L12 16.5l-1.6-4.4-4.4-1.6 4.4-1.6L12 4.5z"/>,
  chat: <path d="M12 4.5c4.7 0 8.5 3.1 8.5 7 0 3.9-3.8 7-8.5 7-1 0-2-.1-2.9-.4L4 19.5l1.3-3.4c-1.1-1.3-1.8-2.9-1.8-4.6 0-3.9 3.8-7 8.5-7z"/>,
  phone: <g><rect x="7" y="3" width="10" height="18" rx="2.6"/><path d="M10.6 5.6h2.8"/></g>,
  laptop: <g><rect x="4.5" y="5" width="15" height="10.5" rx="1.6"/><path d="M2.5 18.5h19l-1.6-2.2H4.1l-1.6 2.2z"/></g>,
  handbag: <g><path d="M8.5 9V7.2a3.5 3.5 0 017 0V9"/><path d="M5 9h14l-1.1 10.2a2 2 0 01-2 1.8H8.1a2 2 0 01-2-1.8L5 9z"/><path d="M5.5 14.5h13"/></g>,
  sneaker: <g><path d="M3 16.5c0-.9.6-1.6 1.5-1.8l5.6-1.3c.9-.2 1.7-.7 2.3-1.4l1.3-1.5c.4-.5 1.1-.5 1.5-.1l.9.8c1.8 1.6 4 2.6 6.4 2.9l1 .1c.9.1 1.5.8 1.5 1.7v1.6H3v-1z"/><path d="M3 19.5h21M13.5 11.5l1.2 1.2M15.6 9.9l1.2 1.2"/></g>,
  jacket: <g><path d="M9.2 3.8L12 5.5l2.8-1.7 4.4 2.4-1.9 4.2-1.3-.8v11H8v-11l-1.3.8-1.9-4.2 4.4-2.4z"/><path d="M12 5.5v15"/></g>,
}

export function Icon({ n, c = '', sw = 1.7 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}
         strokeLinecap="round" strokeLinejoin="round" className={c}>
      {PATHS[n]}
    </svg>
  )
}

export const GRADE_STYLE = {
  'Pristine': { chip: 'bg-emerald-600 text-white', bar: 'bg-emerald-500' },
  'Excellent': { chip: 'bg-neutral-900 text-white', bar: 'bg-neutral-800' },
  'Very Good': { chip: 'bg-amber-400 text-neutral-900', bar: 'bg-amber-400' },
}

export function ConditionChip({ grade, small }) {
  const s = GRADE_STYLE[grade] || GRADE_STYLE['Excellent']
  return (
    <span className={`${s.chip} ${small ? 'text-[8px] px-1.5 py-0.5' : 'text-[9px] px-2 py-1'} rounded font-bold tracking-[0.14em] uppercase shadow-sm`}>
      {grade}
    </span>
  )
}

const THEMES = {
  titanium: { bg: 'from-[#efece6] via-[#dcd6ca] to-[#b3ac9e]', ink: '#3a3833', icon: 'phone' },
  midnight: { bg: 'from-[#233047] via-[#17203a] to-[#0b1020]', ink: '#aebadb', icon: 'laptop' },
  monogram: { bg: 'from-[#8a5a2b] via-[#6f4620] to-[#4a2d12]', ink: '#f2dfbc', icon: 'handbag' },
  caviar:   { bg: 'from-[#2b2b30] via-[#1a1a1e] to-[#0a0a0c]', ink: '#d8c79a', icon: 'handbag' },
  chicago:  { bg: 'from-[#b91c1c] via-[#991b1b] to-[#671414]', ink: '#fde8e8', icon: 'sneaker' },
  military: { bg: 'from-[#454549] via-[#2a2a2e] to-[#141416]', ink: '#e6e6ea', icon: 'sneaker' },
  denim:    { bg: 'from-[#6d8cb8] via-[#4f6d9c] to-[#33496e]', ink: '#f3ecd9', icon: 'jacket' },
  duck:     { bg: 'from-[#7c5f3f] via-[#63492c] to-[#3e2d18]', ink: '#ecd9b8', icon: 'jacket' },
}

export function ProductArt({ art, imageUrl, iconClass = 'w-28 h-28', alt = '' }) {
  if (imageUrl) {
    return <img src={imageUrl} alt={alt} className="absolute inset-0 w-full h-full object-cover" />
  }
  const t = THEMES[art] || THEMES.titanium
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${t.bg}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.4),transparent_55%)] mix-blend-soft-light" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span style={{ color: t.ink }}><Icon n={t.icon} c={`${iconClass} drop-shadow-lg`} sw={1.2} /></span>
      </div>
    </div>
  )
}