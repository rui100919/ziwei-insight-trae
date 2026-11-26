'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { demoStore, isDemoMode, type DemoBirthProfile, type DemoReport } from '@/lib/demo';
import { chartCacheKey } from '@/lib/chart-cache';
import { CityPicker } from '@/components/CityPicker';
import { cityName, type City } from '@/lib/cities';
import { t, type Lang } from '@/lib/i18n';
import { useLang } from '@/components/LangProvider';
import { Starfield } from '@/components/oriental/Starfield';
import { trackEvent, E } from '@/lib/analytics';

/** 印章文字拆成竖排两行：拉丁按空格拆，中文按字拆（与首页一致）。 */
function sealLines(s: string): string[] {
  return s.includes(' ') ? s.split(' ') : Array.from(s);
}

/** `.rise` 入场动画的内联自定义属性。 */
function d(delay: string): CSSProperties {
  return { '--d': delay } as CSSProperties;
}

const S: Record<Lang, {
  errChooseProfile: string; errPlaceTimezone: string; defaultProfileLabel: string;
  newReadingEyebrow: string; tabSaved: string; tabNew: string; chooseBirthDetails: string;
  timeUnknownNote: string; profileNameLabel: string; profileNamePlaceholder: string;
  saveProfileHint: string; freeNote: string; tzCityMismatch: string;
}> = {
  zh: {
    errChooseProfile: '请选择一份出生资料', errPlaceTimezone: '请填写出生地和时区',
    defaultProfileLabel: '我的命盘', newReadingEyebrow: '新解读',
    tabSaved: '用已保存的资料', tabNew: '填新资料', chooseBirthDetails: '选择出生资料',
    timeUnknownNote: '出生时间未知 — 将按子时（00:00–01:00）默认，涉及时辰的细节仅供参考。',
    profileNameLabel: '资料名称（选填）', profileNamePlaceholder: '例如：我的命盘 / 孩子',
    saveProfileHint: '保存这份资料，方便下次直接选用',
    freeNote: '每个账号有一次免费解读，生成通常需要一分钟。',
    tzCityMismatch: '所选时区与出生城市不一致，真太阳时可能偏差数小时，建议重新选择城市。',
  },
  en: {
    errChooseProfile: 'Please choose a birth profile', errPlaceTimezone: 'Please enter birth place and timezone',
    defaultProfileLabel: 'My Chart', newReadingEyebrow: 'New reading',
    tabSaved: 'Saved profiles', tabNew: 'New details', chooseBirthDetails: 'Birth details',
    timeUnknownNote: 'Birth time unknown — a 子时 (00:00–01:00) default is used; hour-dependent details are provisional.',
    profileNameLabel: 'Profile name (optional)', profileNamePlaceholder: 'e.g. My Chart / My child',
    saveProfileHint: 'Save these details for next time',
    freeNote: 'One complimentary basic reading per account. Generation usually takes about a minute.',
    tzCityMismatch: 'The timezone differs from the birth city you picked — the true solar time could be off by hours. Please pick the city again.',
  },
  es: {
    errChooseProfile: 'Selecciona un perfil de nacimiento', errPlaceTimezone: 'Introduce el lugar de nacimiento y la zona horaria',
    defaultProfileLabel: 'Mi carta', newReadingEyebrow: 'Nueva lectura',
    tabSaved: 'Perfiles guardados', tabNew: 'Nuevos datos', chooseBirthDetails: 'Datos de nacimiento',
    timeUnknownNote: 'Hora de nacimiento desconocida — se usará 子时 (00:00–01:00) por defecto; los detalles que dependen de la hora son orientativos.',
    profileNameLabel: 'Nombre del perfil (opcional)', profileNamePlaceholder: 'p. ej. Mi carta / Mi hijo',
    saveProfileHint: 'Guarda estos datos para usarlos directamente la próxima vez',
    freeNote: 'Cada cuenta tiene una lectura gratuita; la generación suele tardar un minuto.',
    tzCityMismatch: 'La zona horaria no coincide con la ciudad elegida: el tiempo solar verdadero podría desviarse varias horas. Vuelve a elegir la ciudad.',
  },
  fr: {
    errChooseProfile: 'Choisissez un profil de naissance', errPlaceTimezone: 'Saisissez le lieu de naissance et le fuseau horaire',
    defaultProfileLabel: 'Mon thème', newReadingEyebrow: 'Nouvelle lecture',
    tabSaved: 'Profils enregistrés', tabNew: 'Nouvelles données', chooseBirthDetails: 'Données de naissance',
    timeUnknownNote: 'Heure de naissance inconnue — 子时 (00:00–01:00) est utilisé par défaut ; les détails dépendant de l’heure sont indicatifs.',
    profileNameLabel: 'Nom du profil (facultatif)', profileNamePlaceholder: 'ex. Mon thème / Mon enfant',
    saveProfileHint: 'Enregistrez ces données pour les réutiliser la prochaine fois',
    freeNote: 'Chaque compte a droit à une lecture gratuite ; la génération prend généralement une minute.',
    tzCityMismatch: 'Le fuseau horaire ne correspond pas à la ville choisie : l’heure solaire vraie peut dériver de plusieurs heures. Choisissez à nouveau la ville.',
  },
  de: {
    errChooseProfile: 'Bitte wähle ein Geburtsprofil', errPlaceTimezone: 'Gib Geburtsort und Zeitzone ein',
    defaultProfileLabel: 'Mein Horoskop', newReadingEyebrow: 'Neue Deutung',
    tabSaved: 'Gespeicherte Profile', tabNew: 'Neue Daten', chooseBirthDetails: 'Geburtsdaten',
    timeUnknownNote: 'Geburtszeit unbekannt — standardmäßig wird 子时 (00:00–01:00) verwendet; stundenabhängige Details sind vorläufig.',
    profileNameLabel: 'Profilname (optional)', profileNamePlaceholder: 'z. B. Mein Horoskop / Mein Kind',
    saveProfileHint: 'Diese Daten speichern, um sie beim nächsten Mal direkt auszuwählen',
    freeNote: 'Jedes Konto erhält eine kostenlose Deutung; die Erstellung dauert in der Regel etwa eine Minute.',
    tzCityMismatch: 'Die Zeitzone passt nicht zur gewählten Geburtsstadt – die wahre Sonnenzeit kann um Stunden abweichen. Bitte wähle die Stadt erneut.',
  },
  ja: {
    errChooseProfile: '出生プロフィールを選択してください', errPlaceTimezone: '出生地とタイムゾーンを入力してください',
    defaultProfileLabel: 'マイ命盤', newReadingEyebrow: '新しい解読',
    tabSaved: '保存済みプロフィール', tabNew: '新しい情報', chooseBirthDetails: '出生情報',
    timeUnknownNote: '出生時刻が不明の場合は子時（00:00–01:00）をデフォルトとして使用します。時刻に依存する詳細は参考値となります。',
    profileNameLabel: 'プロフィール名（任意）', profileNamePlaceholder: '例：マイ命盤 / 子ども',
    saveProfileHint: '次回そのまま使えるよう、この情報を保存する',
    freeNote: 'アカウントごとに無料解読を1回利用できます。生成には通常1分ほどかかります。',
    tzCityMismatch: '選択したタイムゾーンが出生都市と一致していません。真太陽時が数時間ずれる可能性があるため、都市を選び直してください。',
  },
};

const PROFILE_NAME: Record<Lang, string> = {
  zh: '姓名', en: 'Name', es: 'Nombre', fr: 'Nom', de: 'Name', ja: 'お名前',
};

export default function NewChartPage() {
  const { lang } = useLang();
  const s = S[lang];
  const router = useRouter();
  const zones = useMemo(() => {
    try { return Intl.supportedValuesOf('timeZone'); } catch { return ['Asia/Shanghai', 'Asia/Kuala_Lumpur', 'Europe/London', 'America/New_York']; }
  }, []);

  const [profiles, setProfiles] = useState<DemoBirthProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [mode, setMode] = useState<'select' | 'new'>('select');

  // 新建档案的表单字段
  const [label, setLabel] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const monthInputRef = useRef<HTMLInputElement>(null);
  const dayInputRef = useRef<HTMLInputElement>(null);
  const [birthTime, setBirthTime] = useState('12:00');
  const [timeKnown, setTimeKnown] = useState(true);
  const [birthPlace, setBirthPlace] = useState('');
  const [timezone, setTimezone] = useState('Asia/Shanghai');
  const [longitude, setLongitude] = useState('');
  const [cityPicked, setCityPicked] = useState(false);
  // 最近一次从候选里选中的城市时区，用来发现「手动改了时区」的情况。
  const [pickedCityTz, setPickedCityTz] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [saveAsProfile, setSaveAsProfile] = useState(true);
  // /chart/new?full=1：为某位家人直接生成付费完整解读（一人一份，生成即消耗一次权益）。
  const [fullMode, setFullMode] = useState(false);

  // 未登录访客：不跳登录页，直接排盘拿基础解读（报告存本地 localStorage）。
  const [anonymous, setAnonymous] = useState(false);

  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState('');
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  // 生成通常要一分钟：给用户一个可感知的阶段，而不是一个转圈的按钮。
  useEffect(() => {
    if (!busy) { setStage(0); return; }
    setStage(1);
    const t2 = window.setTimeout(() => setStage(2), 3000);
    const t3 = window.setTimeout(() => setStage(3), 9000);
    const t4 = window.setTimeout(() => setStage(4), 22000);
    return () => { window.clearTimeout(t2); window.clearTimeout(t3); window.clearTimeout(t4); };
  }, [busy]);

  // 加载已保存的出生档案（演示/正式）
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('full') === '1') {
      setFullMode(true);
      setMode('new');
    }
    if (isDemoMode()) {
      if (!demoStore.getUser()) demoStore.setUser({ id: 'demo-user', email: 'demo@example.com' });
      const list = demoStore.getBirthProfiles();
      setProfiles(list);
      if (list.length) setSelectedId(list[0].id);
      else setMode('new');
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai');
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        // 未登录：不拦登录，直接用本地保存的出生资料排盘，先生成基础解读。
        setAnonymous(true);
        const list = demoStore.getBirthProfiles();
        setProfiles(list);
        if (list.length) setSelectedId(list[0].id);
        else setMode('new');
        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai');
        return;
      }
      const { data: rows } = await supabase
        .from('birth_profiles')
        .select('id, label, birth_date, birth_time, birth_time_known, birth_place, timezone, chart_preferences, created_at')
        .order('created_at', { ascending: true });
      const list = (rows ?? []).map((r: Record<string, unknown>) => {
        const prefs = (r.chart_preferences ?? {}) as { gender?: string; longitude?: number | null };
        return {
          id: String(r.id),
          label: String(r.label),
          birthDate: String(r.birth_date),
          birthTime: String(r.birth_time ?? '12:00').slice(0, 5),
          timeKnown: Boolean(r.birth_time_known),
          birthPlace: String(r.birth_place ?? ''),
          timezone: String(r.timezone),
          longitude: prefs.longitude != null ? String(prefs.longitude) : '',
          gender: (prefs.gender === 'female' ? 'female' : 'male') as 'male' | 'female',
          createdAt: String(r.created_at),
        };
      }) as DemoBirthProfile[];
      setProfiles(list);
      if (list.length) setSelectedId(list[0].id);
      else setMode('new');
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai');
    });
  }, [router]);

  function handleCitySelect(city: City) {
    setLongitude(String(city.lon));
    setTimezone(city.tz);
    setPickedCityTz(city.tz);
    setBirthPlace(cityName(city, lang));
    setCityPicked(true);
  }

  function handlePlaceChange(value: string) {
    setBirthPlace(value);
    if (cityPicked) { setCityPicked(false); setLongitude(''); setPickedCityTz(''); }
  }

  async function submit() {
    setBusy(true); setError('');
    // 完整解读必须登录后才可购买/生成。
    if (fullMode && anonymous) {
      router.replace('/auth?next=%2Fchart%2Fnew%3Ffull%3D1');
      return;
    }
    trackEvent(E.CHART_SUBMIT, {
      mode,
      time_known: mode === 'new' ? String(timeKnown) : 'select',
      save_profile: mode === 'new' ? String(saveAsProfile) : 'skip',
    });
    try {
      const payload: Record<string, unknown> = { lang, idempotencyKey };

      if (mode === 'select') {
        if (!selectedId) { setError(s.errChooseProfile); setBusy(false); return; }
        if (anonymous && selectedProfile) {
          // 匿名访客没有服务端档案可查，直接把本地档案展开成完整出生资料。
          Object.assign(payload, {
            birthDate: selectedProfile.birthDate,
            birthTime: selectedProfile.birthTime,
            timeKnown: selectedProfile.timeKnown,
            birthPlace: selectedProfile.birthPlace,
            timezone: selectedProfile.timezone,
            longitude: selectedProfile.longitude === '' ? null : Number(selectedProfile.longitude),
            gender: selectedProfile.gender,
            profileLabel: selectedProfile.label,
          });
        } else {
          payload.profileId = selectedId;
        }
      } else {
        if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) { setError(t(lang, 'birthDateRequired')); setBusy(false); return; }
        if (!birthPlace || !timezone) { setError(s.errPlaceTimezone); setBusy(false); return; }
        // 只打字没选中城市时 longitude 为空，真太阳时校正会静默失效，这里必须拦下。
        if (!cityPicked && longitude === '') { setError(t(lang, 'chooseCityHint')); setBusy(false); return; }
        Object.assign(payload, {
          birthDate, birthTime, timeKnown, birthPlace, timezone,
          longitude: longitude === '' ? null : Number(longitude),
          gender,
          profileLabel: label.trim() || s.defaultProfileLabel,
          saveAsProfile,
        });
      }

      // 演示模式 / 未登录访客：同一「姓名 + 出生资料」已有解读时直接复用，不重复生成。
      // （正式登录用户由 /api/reading 在服务端做同样的缓存命中；与 IP/网络无关。）
      if (!fullMode && (isDemoMode() || anonymous)) {
        const source = mode === 'select' && selectedProfile
          ? {
              name: selectedProfile.label,
              birthDate: selectedProfile.birthDate,
              birthTime: selectedProfile.birthTime,
              timeKnown: selectedProfile.timeKnown,
              timezone: selectedProfile.timezone,
              longitude: selectedProfile.longitude === '' ? null : Number(selectedProfile.longitude),
              gender: selectedProfile.gender,
            }
          : {
              name: label.trim() || s.defaultProfileLabel,
              birthDate,
              birthTime,
              timeKnown,
              timezone,
              longitude: longitude === '' ? null : Number(longitude),
              gender,
            };
        const cached = demoStore.findReportByCacheKey(chartCacheKey(source), lang);
        if (cached) {
          setBusy(false);
          router.push(`/report/${cached.id}`);
          return;
        }
      }

      const res = await fetch(fullMode ? '/api/reading/full' : '/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'NEED_LOGIN') router.replace('/auth?next=/chart/new');
        else if (data.error === 'FREE_USED') setError(t(lang, 'freeUsed'));
        else if (data.error === 'PAYMENT_REQUIRED') router.push('/full-preview');
        else if (data.error === 'NEED_VERIFY') setError('__NEED_VERIFY__');
        else if (data.error === 'RATE_LIMITED') setError(t(lang, 'rateLimited'));
        else if (data.error === 'INVALID_TIMEZONE') setError(t(lang, 'invalidTimezone'));
        else setError(t(lang, 'errorGeneric'));
        return;
      }
      // 演示模式 / 匿名访客：报告只在本地保存，服务端不落库、不占免费额度。
      if (data.report) {
        // 新建档案模式下，用户勾选了「保存为档案」则存入本地档案库。
        if (mode === 'new' && saveAsProfile) {
          demoStore.addBirthProfile({
            id: crypto.randomUUID(),
            label: label.trim() || s.defaultProfileLabel,
            birthDate, birthTime, timeKnown, birthPlace, timezone, longitude,
            gender,
            createdAt: new Date().toISOString(),
          });
        }
        demoStore.addReport(data.report as DemoReport);
        if (data.demo) demoStore.consumeEntitlement();
      }
      trackEvent(E.CHART_GENERATED, {
        demo: String(data.demo ?? false),
        anonymous: String(data.anonymous ?? false),
      });
      router.push(`/report/${data.reportId}`);
    } catch {
      setError(t(lang, 'errorGeneric'));
    } finally {
      setBusy(false);
    }
  }

  function profileSummary(p: DemoBirthProfile) {
    const date = p.birthDate;
    const time = p.timeKnown ? p.birthTime : t(lang, 'timeUnknown');
    return `${p.gender === 'female' ? t(lang, 'female') : t(lang, 'male')} · ${date} · ${time} · ${p.birthPlace}`;
  }

  // 演示用：出生日期 / 时间的三栏拆分（仅外观，值仍写回 birthDate / birthTime，业务逻辑不变）。
  const dateParts = (birthDate || '').split('-');
  const dateY = dateParts[0] ?? '';
  const dateM = dateParts[1] ?? '';
  const dateD = dateParts[2] ?? '';
  const setDatePart = (part: 0 | 1 | 2, raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, part === 0 ? 4 : 2);
    setBirthDate((current) => {
      const next = (current || '').split('-');
      next[part] = digits;
      return next.slice(0, 3).join('-');
    });
    if (part === 0 && digits.length === 4) monthInputRef.current?.focus();
    if (part === 1 && digits.length === 2) dayInputRef.current?.focus();
  };
  const normalizeDate = () => {
    setBirthDate((current) => {
      const next = (current || '').split('-');
      if (next[1]) next[1] = next[1].padStart(2, '0');
      if (next[2]) next[2] = next[2].padStart(2, '0');
      return next.slice(0, 3).join('-');
    });
  };
  const timeParts = (birthTime || '').split(':');
  const timeH = timeParts[0] ?? '';
  const timeMin = timeParts[1] ?? '';
  const setTimePart = (part: 0 | 1, raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 2);
    const next = [...timeParts];
    next[part] = digits;
    setBirthTime(next.slice(0, 2).join(':'));
  };
  const normalizeTime = () => {
    const next = [...timeParts];
    if (next[0]) next[0] = next[0].padStart(2, '0');
    if (next[1]) next[1] = next[1].padStart(2, '0');
    setBirthTime(next.slice(0, 2).join(':'));
  };
  const selectedProfile = profiles.find((p) => p.id === selectedId);

  // 从候选里选了城市后又手动改时区：两者不一致时提示，避免真太阳时偏差数小时。
  // 注意不能用「经度 vs 中央经线」判断——新疆按北京时间（+8）排盘时，经度天然离 120° 很远。
  const tzCityMismatch = cityPicked && pickedCityTz !== '' && timezone !== pickedCityTz;

  return (
    <main className="page">
      <div className="page-bg" aria-hidden="true" />
      <Starfield />

      <div className="wrap">
        <div className="page-grid">
          <aside className="side rise" style={d('.05s')}>
            <p className="label">
              <span className="cn">{t(lang, 'chartSideLabel')}</span>
              <span className="en">New Reading</span>
            </p>
            <h1>{t(lang, 'chartSideTitle')}</h1>
            <p className="intro">{t(lang, 'birthSubtitle')}</p>
            <p className="quota">{t(lang, 'chartSideQuota')}</p>
          </aside>

          <section className="form-col rise" style={d('.16s')} aria-label={t(lang, 'chartFormAria')}>
            <div className="sheet">
              <div className="sheet-head">
                <div>
                  <h2 className="sheet-title">{t(lang, 'chartSheetTitle')}</h2>
                  <p className="sheet-sub">Birth Record · Step 01</p>
                </div>
                <span className="seal" aria-hidden="true">
                  {sealLines(t(lang, 'sealChars')).map((ch, i) => (
                    <span key={i}>{ch}</span>
                  ))}
                </span>
              </div>

              {/* 数据来源切换（select / new，逻辑不动） */}
              {(profiles.length > 0 || mode === 'select') && (
                <div className="flex gap-7 border-b border-[rgba(27,23,16,.14)] pb-3">
                  <button
                    type="button"
                    onClick={() => setMode('select')}
                    className={`-mb-[13px] border-b-2 pb-2 text-sm tracking-wide transition-colors ${
                      mode === 'select'
                        ? 'border-[var(--cinnabar)] text-[#1B1710]'
                        : 'border-transparent text-[rgba(27,23,16,.45)] hover:text-[#1B1710]'
                    }`}
                  >
                    {s.tabSaved}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('new')}
                    className={`-mb-[13px] border-b-2 pb-2 text-sm tracking-wide transition-colors ${
                      mode === 'new'
                        ? 'border-[var(--cinnabar)] text-[#1B1710]'
                        : 'border-transparent text-[rgba(27,23,16,.45)] hover:text-[#1B1710]'
                    }`}
                  >
                    {s.tabNew}
                  </button>
                </div>
              )}

              {mode === 'select' ? (
                selectedProfile ? (
                  <div className="mt-6 border border-[rgba(27,23,16,.16)] bg-[rgba(27,23,16,.03)] px-5 py-4">
                    <p className="text-base tracking-wider text-[#1B1710]">{selectedProfile.label}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[rgba(27,23,16,.6)]">{profileSummary(selectedProfile)}</p>
                    <p className="mt-1 text-[11px] tracking-wide text-[rgba(27,23,16,.45)]">{selectedProfile.timezone}</p>
                    {!selectedProfile.timeKnown && (
                      <p className="mt-1.5 text-[11px] leading-relaxed text-[rgba(27,23,16,.5)]">{s.timeUnknownNote}</p>
                    )}
                  </div>
                ) : (
                  <p className="mt-6 text-xs leading-relaxed text-[rgba(27,23,16,.55)]">{s.errChooseProfile}</p>
                )
              ) : (
                <>
                  {/* 姓名 */}
                  <div className="row" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
                    <div className="fields">
                      <input
                        className="ink cn"
                        style={{ maxWidth: 'none' }}
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder={PROFILE_NAME[lang]}
                        aria-label={PROFILE_NAME[lang]}
                      />
                    </div>
                  </div>

                  {/* 出生日期：年 / 月 / 日 三栏墨字输入 */}
                  <div className="row">
                    <span className="fl">{t(lang, 'birthDate')}</span>
                    <div className="fields">
                      <input
                        className="ink year"
                        inputMode="numeric"
                        maxLength={4}
                        value={dateY}
                        onChange={(e) => setDatePart(0, e.target.value)}
                        onBlur={normalizeDate}
                        aria-label={t(lang, 'chartAriaBirthYear')}
                      />
                      <span className="sep">/</span>
                      <input
                        ref={monthInputRef}
                        className="ink num"
                        inputMode="numeric"
                        maxLength={2}
                        value={dateM}
                        onChange={(e) => setDatePart(1, e.target.value)}
                        onBlur={normalizeDate}
                        aria-label={t(lang, 'chartAriaBirthMonth')}
                      />
                      <span className="sep">/</span>
                      <input
                        ref={dayInputRef}
                        className="ink num"
                        inputMode="numeric"
                        maxLength={2}
                        value={dateD}
                        onChange={(e) => setDatePart(2, e.target.value)}
                        onBlur={normalizeDate}
                        aria-label={t(lang, 'chartAriaBirthDay')}
                      />
                    </div>
                  </div>

                  {/* 出生时间：时 : 分 + 24H + 时间未知 */}
                  <div className="row">
                    <span className="fl">{t(lang, 'birthTime')}</span>
                    <div>
                      <div className="fields">
                        <input
                          className="ink num"
                          inputMode="numeric"
                          maxLength={2}
                          value={timeH}
                          disabled={!timeKnown}
                          onChange={(e) => setTimePart(0, e.target.value)}
                          onBlur={normalizeTime}
                          aria-label={t(lang, 'chartAriaBirthHour')}
                        />
                        <span className="sep">:</span>
                        <input
                          className="ink num"
                          inputMode="numeric"
                          maxLength={2}
                          value={timeMin}
                          disabled={!timeKnown}
                          onChange={(e) => setTimePart(1, e.target.value)}
                          onBlur={normalizeTime}
                          aria-label={t(lang, 'chartAriaBirthMinute')}
                        />
                        <span
                          className="sep"
                          style={{ fontSize: '12px', letterSpacing: '.1em', color: 'rgba(27,23,16,.36)' }}
                        >
                          24H
                        </span>
                      </div>
                      <label className="check">
                        <input
                          type="checkbox"
                          checked={!timeKnown}
                          onChange={(e) => setTimeKnown(!e.target.checked)}
                        />
                        {t(lang, 'chartTimeUnknown')}
                      </label>
                    </div>
                  </div>

                  {/* 出生地点：CityPicker 传 sheet，使其在浅宣纸上可读 */}
                  <div className="row">
                    <span className="fl">
                      {t(lang, 'birthPlace')}
                      <small>{t(lang, 'chartPlaceHint')}</small>
                    </span>
                    <div>
                      <CityPicker
                        lang={lang}
                        value={birthPlace}
                        onChange={handlePlaceChange}
                        onSelect={handleCitySelect}
                        sheet
                      />
                      {cityPicked && longitude !== '' ? (
                        <p className="hint">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                            <path d="M4 12.5l5 5L20 6.5" />
                          </svg>
                          <span>{t(lang, 'autoResolved')}</span>
                          <span className="rounded-full border border-[rgba(27,23,16,.18)] bg-[rgba(27,23,16,.04)] px-2 py-0.5 text-[11px] text-[rgba(27,23,16,.6)]">
                            {t(lang, 'longitude')} {Number(longitude).toFixed(2)}°
                          </span>
                          <span className="rounded-full border border-[rgba(27,23,16,.18)] bg-[rgba(27,23,16,.04)] px-2 py-0.5 text-[11px] text-[rgba(27,23,16,.6)]">
                            {timezone}
                          </span>
                        </p>
                      ) : (
                        <p className="mt-1.5 text-xs leading-relaxed text-[rgba(27,23,16,.5)]">
                          {birthPlace.trim() ? t(lang, 'pickCityRequired') : t(lang, 'cityNote')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 性别：女 / 男 两个 radio */}
                  <div className="row">
                    <span className="fl">
                      {t(lang, 'gender')}
                      <small>{t(lang, 'chartGenderHint')}</small>
                    </span>
                    <div className="sex">
                      <label>
                        <input
                          type="radio"
                          name="gender"
                          checked={gender === 'female'}
                          onChange={() => setGender('female')}
                        />
                        {t(lang, 'female')}
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="gender"
                          checked={gender === 'male'}
                          onChange={() => setGender('male')}
                        />
                        {t(lang, 'male')}
                      </label>
                    </div>
                  </div>

                  {/* 高级：手动校正经纬度与时区（可保留，样式适配宣纸） */}
                  <div className="row">
                    <span className="fl">
                      <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="text-left"
                      >
                        {showAdvanced ? '▾' : '▸'} {t(lang, 'advanced')}
                      </button>
                    </span>
                    <div>
                      {showAdvanced && (
                        <div className="border border-[rgba(27,23,16,.14)] bg-[rgba(27,23,16,.03)] p-4">
                          <p className="text-xs leading-relaxed text-[rgba(27,23,16,.6)]">{t(lang, 'autoFilled')}</p>
                          <div className="mt-3 grid gap-4 md:grid-cols-2">
                            <div className="field">
                              <span className="fl">{t(lang, 'longitude')}</span>
                              <input
                                className="ink"
                                type="number"
                                step="0.01"
                                value={longitude}
                                onChange={(e) => setLongitude(e.target.value)}
                                placeholder="101.69"
                              />
                            </div>
                            <div className="field">
                              <span className="fl">{t(lang, 'timezone')}</span>
                              <input
                                className="ink"
                                list="tz-list"
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                              />
                              <datalist id="tz-list">
                                {zones.map((z) => (
                                  <option key={z} value={z} />
                                ))}
                              </datalist>
                            </div>
                          </div>
                          {tzCityMismatch && (
                            <p className="mt-3 text-[11px] leading-relaxed text-[#8e3527]">{s.tzCityMismatch}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(27,23,16,.14)', marginTop: '6px', paddingTop: '18px' }}>
                    <label className="check" style={{ margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={saveAsProfile}
                        onChange={(e) => setSaveAsProfile(e.target.checked)}
                      />
                      {s.saveProfileHint}
                    </label>
                  </div>
                </>
              )}

              <div className="sheet-actions">
                <button
                  className="btn w-full"
                  disabled={busy || (mode === 'select' ? !selectedId : !birthDate || !birthPlace || !timezone)}
                  onClick={submit}
                >
                  {busy ? t(lang, 'generating') : t(lang, 'submit')}
                  <span className="arw" aria-hidden="true">→</span>
                </button>

                {busy && (
                  <div className="mt-4 border border-[rgba(27,23,16,.12)] bg-[rgba(27,23,16,.03)] px-4 py-4">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(27,23,16,.12)]">
                      <div
                        className="h-full rounded-full bg-[var(--gold-deep)] transition-[width] duration-700 ease-out"
                        style={{ width: `${[0, 18, 42, 68, 88][stage] ?? 88}%` }}
                      />
                    </div>
                    <p className="mt-3 text-sm text-[rgba(27,23,16,.8)]">{t(lang, `genStage${Math.max(1, stage)}`)}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-[rgba(27,23,16,.5)]">{t(lang, 'genKeepOpen')}</p>
                  </div>
                )}

                {error === '__NEED_VERIFY__' ? (
                  <div className="form-err">
                    <p>{t(lang, 'needVerify')}</p>
                    <button
                      type="button"
                      className="mt-2 text-sm font-medium text-[#8e3527] underline-offset-4 hover:underline"
                      onClick={() => router.push('/auth?next=/chart/new')}
                    >
                      {t(lang, 'verifyNow')} →
                    </button>
                  </div>
                ) : error ? (
                  <p className="form-err">{error}</p>
                ) : null}

                <p className="fine">{t(lang, 'chartFinePrint')}</p>
              </div>
            </div>
          </section>

          {profiles.length > 0 && (
            <div className="saved-block rise" style={d('.26s')}>
              <div className="saved">
                <p className="saved-title">{t(lang, 'chartSavedTitle')}</p>
                {profiles.map((p) => {
                  const active = selectedId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className="saved-item"
                      onClick={() => {
                        setSelectedId(p.id);
                        setMode('select');
                      }}
                    >
                      <span className="min-w-0">
                        <span className="who" style={active ? { color: 'var(--gold-lit)' } : undefined}>
                          {p.label}
                        </span>
                        <span className="meta">{profileSummary(p)}</span>
                        {!p.timeKnown && <span className="meta">{s.timeUnknownNote}</span>}
                      </span>
                      <span className="go" aria-hidden="true" style={active ? { color: 'var(--gold-lit)' } : undefined}>
                        →
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
