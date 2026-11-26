import Client from './AccountClient';

/** 壳页：强制按请求渲染，避免静态预渲染被缓存长期命中后仍展示旧版账户页。 */
export const dynamic = 'force-dynamic';

export default function Page() {
  return <Client />;
}