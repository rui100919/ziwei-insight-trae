import { buildChart, chartFacts } from '../lib/engine';

const cases = [
  { birthDate: '1990-01-01', birthTime: '12:00', timeKnown: true, birthPlace: '北京', timezone: 'Asia/Shanghai', longitude: 116.4, gender: 'male' as const },
  { birthDate: '1985-07-15', birthTime: '23:30', timeKnown: true, birthPlace: 'Kuala Lumpur', timezone: 'Asia/Kuala_Lumpur', longitude: 101.69, gender: 'female' as const },
  { birthDate: '2000-03-21', birthTime: '09:00', timeKnown: false, birthPlace: 'London', timezone: 'Europe/London', longitude: null, gender: 'male' as const },
];

for (const input of cases) {
  const built = buildChart(input, 'zh');
  const facts = chartFacts(built.chart, built.timeNote, 'zh') as {
    lunarDate: string;
    wuxingJu: string;
    mingGongBranch: number;
    palaces: Array<{ name: string; majorStars: string[] }>;
  };
  console.log('---');
  console.log('input:', input.birthDate, input.birthTime, input.timezone);
  console.log('note:', built.timeNote);
  console.log('lunar:', facts.lunarDate, facts.wuxingJu, '命宫支:', facts.mingGongBranch);
  console.log('命宫:', facts.palaces.find((p) => p.name === '命宫')?.majorStars.join('、') || '(空宫)');
  console.log('palaces:', facts.palaces.length);
}
