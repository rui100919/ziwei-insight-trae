import type { ChartInput } from '@/lib/engine';

/**
 * /full-preview 专用的虚构样例出生资料。
 *
 * 合规要求：样例页不得展示任何真实用户的出生资料与命盘，也不得让访客把
 * 自己的资料当作「样例」渲染。因此样例由服务端固定，忽略请求体里的出生字段；
 * 如需更换样例，只改这里，前端无需同步。
 */
export const SAMPLE_BIRTH: ChartInput = {
  birthDate: '1990-06-15',
  birthTime: '14:30',
  timeKnown: true,
  birthPlace: '上海',
  timezone: 'Asia/Shanghai',
  longitude: 121.5,
  gender: 'female',
};

/** 样例档案在报告里显示的占位名（不指向任何真实用户）。 */
export const SAMPLE_PROFILE_LABEL = 'Zi Wei Sample';
