'use client';

import { useEffect, useRef, useState } from 'react';
import { loadCities, loadFullCities, searchCities, formatCity, type City } from '@/lib/cities';
import type { Lang } from '@/lib/i18n';

const UI: Record<Lang, { placeholder: string; loading: string; expanding: string }> = {
  zh: { placeholder: '输入城市，如 上海 / Shanghai', loading: '城市数据加载中…', expanding: '正在更大范围里查找…' },
  en: { placeholder: 'Type a city, e.g. Shanghai', loading: 'Loading cities…', expanding: 'Searching the full city list…' },
  es: { placeholder: 'Escribe una ciudad, p. ej. Shanghai', loading: 'Cargando ciudades…', expanding: 'Buscando en la lista completa de ciudades…' },
  fr: { placeholder: 'Saisissez une ville, ex. Shanghai', loading: 'Chargement des villes…', expanding: 'Recherche dans la liste complète des villes…' },
  de: { placeholder: 'Stadt eingeben, z. B. Shanghai', loading: 'Städte werden geladen…', expanding: 'Suche in der vollständigen Städtenliste…' },
  ja: { placeholder: '都市を入力（例：上海 / Shanghai）', loading: '都市データを読み込み中…', expanding: 'すべての都市リストを検索中…' },
};

type Props = {
  lang: Lang;
  value: string;
  onChange: (value: string) => void;
  onSelect: (city: City) => void;
  placeholder?: string;
  /** 在浅色宣纸（.sheet）上使用时传 sheet，渲染为墨色下划线输入 + 浅色下拉；默认深色。 */
  sheet?: boolean;
};

/** 出生地搜索框：输入城市名（中/英/拼音）后从下拉选，选中即回传经纬度与时区。 */
export function CityPicker({ lang, value, onChange, onSelect, placeholder, sheet }: Props) {
  const ui = UI[lang];
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<City[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanding, setExpanding] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const justSelected = useRef(false);
  const focusedRef = useRef(false);
  const queryRef = useRef(value);
  queryRef.current = value;

  useEffect(() => {
    loadCities().then(() => setReady(true)).catch(() => setReady(false));
  }, []);

  useEffect(() => {
    if (justSelected.current) { justSelected.current = false; return; }
    if (!value.trim()) { setResults([]); setOpen(false); return; }
    const found = searchCities(value, 8);
    setResults(found);
    setActiveIndex(0);
    setOpen(focusedRef.current && found.length > 0);

    // 核心包里没有的小城市，再按需拉全量数据重搜一次（同一次输入只触发一次）。
    if (found.length === 0 && value.trim().length >= 2) {
      setExpanding(true);
      loadFullCities().then(() => {
        if (queryRef.current.trim() !== value.trim()) return;
        const more = searchCities(value, 8);
        setResults(more);
        setActiveIndex(0);
        setOpen(focusedRef.current && more.length > 0);
      }).finally(() => {
        if (queryRef.current.trim() === value.trim()) setExpanding(false);
      });
    }
  }, [value]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const choose = (city: City) => {
    justSelected.current = true;
    onSelect(city);
    onChange(city.n);
    setOpen(false);
    setResults([]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => (i + 1) % results.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => (i - 1 + results.length) % results.length); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(results[activeIndex]); }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  const hintCls = sheet ? 'mt-1 text-xs text-[rgba(27,23,16,.5)]' : 'mt-1 text-xs text-ink-muted';
  const ulCls = sheet
    ? 'absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-[rgba(27,23,16,.14)] bg-[#F4EEE1] shadow-[0_18px_40px_-24px_rgba(27,23,16,0.45)]'
    : 'absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-line bg-paper shadow-[0_18px_40px_-24px_rgba(25,23,19,0.5)]';
  const itemCls = (active: boolean) =>
    sheet
      ? `flex w-full items-center justify-between px-4 py-2.5 text-left text-sm ${active ? 'bg-[#E6D8BC]' : 'hover:bg-[#EDE0C4]'}`
      : `flex w-full items-center justify-between px-4 py-2.5 text-left text-sm ${active ? 'bg-gold-pale/60' : 'hover:bg-paper-deep/60'}`;
  const nameCls = sheet ? 'text-[#1B1710]' : 'text-ink';
  const tzCls = sheet ? 'ml-3 shrink-0 text-xs text-[rgba(27,23,16,.5)]' : 'ml-3 shrink-0 text-xs text-ink-muted';

  return (
    <div className="relative" ref={boxRef}>
      <input
        className={sheet ? 'ink cn' : 'input'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => { focusedRef.current = true; if (value.trim() && results.length) setOpen(true); }}
        onBlur={() => { focusedRef.current = false; }}
        placeholder={placeholder ?? ui.placeholder}
        autoComplete="off"
      />
      {!ready && (
        <p className={hintCls}>{ui.loading}</p>
      )}
      {expanding && (
        <p className={hintCls}>
          {ui.expanding}
        </p>
      )}
      {open && (
        <ul className={ulCls}>
          {results.map((city, i) => (
            <li key={`${city.c}-${city.n}-${city.lat}-${city.lon}`}>
              <button
                type="button"
                className={itemCls(i === activeIndex)}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => { e.preventDefault(); choose(city); }}
              >
                <span className={nameCls}>{formatCity(city, lang)}</span>
                <span className={tzCls}>{city.tz}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
