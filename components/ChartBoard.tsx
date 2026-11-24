import type { ChartView } from '@/lib/chart-preview';
import type { Lang } from '@/lib/i18n';

// 地支：中文与日文共用汉字，其它语言用通行拼音。
const BRANCH: Record<Lang, string[]> = {
  zh: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
  ja: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
  en: ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'],
  es: ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'],
  fr: ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'],
  de: ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'],
};

// 宫位译名：zh/ja 直接显示引擎给出的汉字宫名（日文读者可识），其余语言查翻译表。
const PALACE: Record<Exclude<Lang, 'zh' | 'ja'>, Record<string, string>> = {
  en: {
    命宫: 'Life', 身宫: 'Body', 兄弟: 'Siblings', 夫妻: 'Partner', 子女: 'Children',
    财帛: 'Wealth', 疾厄: 'Health', 迁移: 'Travel', 仆役: 'Friends', 交友: 'Friends',
    官禄: 'Career', 田宅: 'Home', 福德: 'Mind', 父母: 'Parents',
  },
  es: {
    命宫: 'Vida', 身宫: 'Cuerpo', 兄弟: 'Hermanos', 夫妻: 'Pareja', 子女: 'Hijos',
    财帛: 'Riqueza', 疾厄: 'Salud', 迁移: 'Viaje', 仆役: 'Amigos', 交友: 'Amigos',
    官禄: 'Carrera', 田宅: 'Hogar', 福德: 'Mente', 父母: 'Padres',
  },
  fr: {
    命宫: 'Vie', 身宫: 'Corps', 兄弟: 'Fratrie', 夫妻: 'Conjoint', 子女: 'Enfants',
    财帛: 'Richesse', 疾厄: 'Santé', 迁移: 'Déplacement', 仆役: 'Amis', 交友: 'Amis',
    官禄: 'Carrière', 田宅: 'Foyer', 福德: 'Esprit', 父母: 'Parents',
  },
  de: {
    命宫: 'Leben', 身宫: 'Körper', 兄弟: 'Geschwister', 夫妻: 'Partner', 子女: 'Kinder',
    财帛: 'Vermögen', 疾厄: 'Gesundheit', 迁移: 'Reise', 仆役: 'Freunde', 交友: 'Freunde',
    官禄: 'Karriere', 田宅: 'Zuhause', 福德: 'Seele', 父母: 'Eltern',
  },
};

const LABEL: Record<Lang, {
  borrow: string; empty: string; ming: string; shen: string;
  twelve: string; ruler: string; body: string; tapHint: string;
}> = {
  zh: { borrow: '借', empty: '空宫', ming: '命', shen: '身', twelve: '十二宫', ruler: '命主', body: '身主', tapHint: '点宫位可跳到对应解读' },
  en: { borrow: 'borrow', empty: 'Empty', ming: 'L', shen: 'B', twelve: 'Twelve palaces', ruler: 'Ruler', body: 'Body', tapHint: 'Tap a palace to jump to its reading' },
  es: { borrow: 'tomado', empty: 'Vacío', ming: 'V', shen: 'C', twelve: 'Doce palacios', ruler: 'Regente', body: 'Cuerpo', tapHint: 'Toca un palacio para ir a su lectura' },
  fr: { borrow: 'emprunté', empty: 'Vide', ming: 'V', shen: 'C', twelve: 'Douze palais', ruler: 'Maître', body: 'Corps', tapHint: 'Touchez un palais pour accéder à sa lecture' },
  de: { borrow: 'geliehen', empty: 'Leer', ming: 'L', shen: 'K', twelve: 'Zwölf Paläste', ruler: 'Herrscher', body: 'Körper', tapHint: 'Tippe auf einen Palast, um zu seiner Deutung zu springen' },
  ja: { borrow: '借', empty: '空宮', ming: '命', shen: '身', twelve: '十二宮', ruler: '命主', body: '身主', tapHint: '宮をクリックすると該当する解読に移動します' },
};

function palaceLabel(name: string, lang: Lang): string {
  if (lang === 'zh' || lang === 'ja') return name;
  return PALACE[lang][name] ?? name;
}

function lunarLabel(lang: Lang, lunar: { lunarYear: number; lunarMonth: number; lunarDay: number }): string {
  const m = Math.abs(lunar.lunarMonth);
  const leap = lunar.lunarMonth < 0;
  switch (lang) {
    case 'zh': return `农历 ${lunar.lunarYear}年${leap ? '闰' : ''}${m}月${lunar.lunarDay}日`;
    case 'ja': return `旧暦 ${lunar.lunarYear}年${leap ? '閏' : ''}${m}月${lunar.lunarDay}日`;
    case 'es': return `Mes lunar ${m}${leap ? ' (bis)' : ''}, día ${lunar.lunarDay}`;
    case 'fr': return `Mois lunaire ${m}${leap ? ' (intercalaire)' : ''}, jour ${lunar.lunarDay}`;
    case 'de': return `Mondmonat ${m}${leap ? ' (Schalt)' : ''}, Tag ${lunar.lunarDay}`;
    default: return `Lunar month ${m}${leap ? ' (leap)' : ''}, day ${lunar.lunarDay}`;
  }
}

/** 传统命盘的四角布局：巳午未申在上，寅丑子亥在下。 */
const CELL_POS: Record<number, { row: number; col: number }> = {
  5: { row: 1, col: 1 }, 6: { row: 1, col: 2 }, 7: { row: 1, col: 3 }, 8: { row: 1, col: 4 },
  4: { row: 2, col: 1 }, 9: { row: 2, col: 4 },
  3: { row: 3, col: 1 }, 10: { row: 3, col: 4 },
  2: { row: 4, col: 1 }, 1: { row: 4, col: 2 }, 0: { row: 4, col: 3 }, 11: { row: 4, col: 4 },
};

const SIHUA_STYLE: Record<string, string> = {
  禄: 'border-[#8FB99B]/50 bg-[#8FB99B]/15 text-[#B7D8BF]',
  权: 'border-[#8FA8C9]/50 bg-[#8FA8C9]/15 text-[#BBD0E8]',
  科: 'border-[#C9B98F]/50 bg-[#C9B98F]/15 text-[#E4D6AC]',
  忌: 'border-[#C98F8F]/50 bg-[#C98F8F]/15 text-[#E8BFBF]',
};

type Props = {
  chart: ChartView;
  lang: Lang;
  /** 有对应解读章节的宫位名，点击可跳到对应文字。 */
  linkedPalaces?: Set<string>;
};

/** 真实排盘结果：十二宫按传统方位排布，空宫显示借星。 */
export function ChartBoard({ chart, lang, linkedPalaces }: Props) {
  const label = LABEL[lang];
  const lunar = chart.lunarInfo;

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <div className="grid aspect-square grid-cols-4 grid-rows-4 gap-1.5">
        {chart.palaces.map((palace) => {
          const pos = CELL_POS[palace.branch];
          const majors = palace.stars.filter((s) => s.type === 'major');
          const minors = palace.stars.filter((s) => s.type !== 'major');
          const palaceName = palaceLabel(palace.name, lang);
          const branch = BRANCH[lang][palace.branch];
          const framed = palace.isMingGong || palace.isShenGong || palace.isCurrentDaXian;
          const className = [
            'relative flex flex-col gap-1 rounded-lg border px-2 py-1.5 text-left transition-colors',
            palace.isMingGong
              ? 'border-gold/60 bg-gold/[0.14]'
              : palace.isCurrentDaXian
                ? 'border-gold/35 bg-gold/[0.08]'
                : 'border-line bg-white/[0.04]',
            linkedPalaces ? 'hover:border-gold/60 hover:bg-gold/[0.12]' : '',
          ].join(' ');

          const inner = (
            <>
              <div className="flex items-baseline justify-between gap-1">
                <span className={`truncate text-[11px] ${framed ? 'font-semibold text-ink' : 'font-medium text-ink-soft'}`}>
                  {palaceName}
                </span>
                <span className="shrink-0 text-[10px] text-ink-muted">{branch}</span>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0.5">
                {majors.length === 0 ? (
                  <span className="text-[10px] text-ink-muted">
                    {palace.borrowedStars?.length ? `${label.borrow} ${palace.borrowedStars[0]}` : label.empty}
                  </span>
                ) : (
                  majors.slice(0, 3).map((star) => (
                    <span key={star.name} className="inline-flex items-baseline gap-0.5 text-[10px] text-ink">
                      <span className="font-medium">{star.name}</span>
                      {star.brightnessRaw && <span className="text-[9px] text-ink-muted">{star.brightnessRaw}</span>}
                      {star.siHua && (
                        <span className={`rounded border px-0.5 text-[8px] leading-tight ${SIHUA_STYLE[star.siHua] ?? ''}`}>
                          {star.siHua}
                        </span>
                      )}
                    </span>
                  ))
                )}
                {minors.length > 0 && <span className="text-[9px] text-ink-muted">+{minors.length}</span>}
              </div>
              <div className="mt-auto flex items-center justify-between gap-1 text-[9px] text-ink-muted">
                <span>{palace.daXianAge ? `${palace.daXianAge[0]}–${palace.daXianAge[1]}` : ''}</span>
                <span className="flex gap-1">
                  {palace.isMingGong && <span className="text-gold">{label.ming}</span>}
                  {palace.isShenGong && <span className="text-plum">{label.shen}</span>}
                </span>
              </div>
            </>
          );

          const style = { gridRow: pos.row, gridColumn: pos.col };

          return linkedPalaces?.has(palace.name) ? (
            <a key={palace.branch} href={`#palace-${encodeURIComponent(palace.name)}`} className={className} style={style}>
              {inner}
            </a>
          ) : (
            <div key={palace.branch} className={className} style={style}>
              {inner}
            </div>
          );
        })}

        <div
          className="flex flex-col items-center justify-center gap-1 rounded-lg border border-gold/25 bg-gold/[0.07] px-3 text-center"
          style={{ gridRow: '2 / 4', gridColumn: '2 / 4' }}
        >
          <span className="font-serif text-base text-ink">{label.twelve}</span>
          <span className="text-[10px] text-ink-muted">{chart.wuxingJuName}</span>
          <span className="text-[10px] leading-relaxed text-ink-muted">
            {chart.mingZhu ? `${label.ruler} ${chart.mingZhu}` : ''}
            {chart.shenZhu ? ` · ${label.body} ${chart.shenZhu}` : ''}
          </span>
          {lunar && (
            <span className="text-[10px] text-ink-muted">
              {lunarLabel(lang, lunar)}
            </span>
          )}
        </div>
      </div>
      {linkedPalaces && (
        <p className="mt-3 text-center text-[11px] text-ink-muted print:hidden">
          {label.tapHint}
        </p>
      )}
    </div>
  );
}
