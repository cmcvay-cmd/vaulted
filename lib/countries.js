// lib/countries.js
export const COUNTRIES = [
  { id: 'JP', name: 'Japan', flag: '🇯🇵', note: 'Duty-free under ¥10,000 · huge resale culture' },
  { id: 'GB', name: 'United Kingdom', flag: '🇬🇧', note: 'VAT sorted in-chat · 3–5 day express lanes' },
  { id: 'DE', name: 'Germany', flag: '🇩🇪', note: 'IOSS-eligible · EU customs cleared by courier' },
  { id: 'AU', name: 'Australia', flag: '🇦🇺', note: 'GST under A$1,000 often pre-collected' },
  { id: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', note: 'Fast Gulf routing · ~5% VAT typical' },
]
export const countryById = (id) => COUNTRIES.find((c) => c.id === id)
export const fmt = (n) => '$' + Number(n).toLocaleString('en-US')