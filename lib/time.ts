/** 根据 IANA 时区与公历日期，求当地相对 UTC 的偏移（分钟，东正西负）。 */
export function getTimezoneOffsetMinutes(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): number {
  const localWall = Date.UTC(year, month - 1, day, hour, minute, 0);

  const readOffset = (instant: number): number => {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).formatToParts(new Date(instant));
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
    const localAsUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
    return Math.round((localAsUtc - instant) / 60000);
  };

  let offset = readOffset(localWall);
  offset = readOffset(localWall - offset * 60000);
  return readOffset(localWall - offset * 60000);
}
