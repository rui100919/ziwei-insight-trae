/**
 * server-only 的本地空实现。
 * 上游 ziwei-doushu 的 patterns 等模块用 import "server-only" 防止误入客户端包。
 * 本项目仅在 API Route（服务端）调用这些模块，用 tsconfig paths 映射到此空模块，
 * 避免联网安装该包；重装依赖后依然有效。
 */
export {};
