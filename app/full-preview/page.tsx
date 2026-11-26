import Client from './FullPreviewClient';

/**
 * 壳页：强制按请求渲染。
 * 页面内容全在客户端组件里，静态预渲染只会生成一层壳；
 * 一旦被缓存长期命中，部署后用户仍会拿到旧壳与旧 chunk。
 */
export const dynamic = 'force-dynamic';

export default function Page() {
  return <Client />;
}