/**
 * 引擎与规则版本常量。
 * 单独成文件是为了让浏览器端（缓存键计算）也能引用，而不把 iztro 等重型依赖打进客户端包。
 */
export const ENGINE_NAME = 'ziwei-doushu';
export const ENGINE_VERSION = 'MIT-2026.11';
export const CHART_RULE_VERSION = 'default-split-v1';
export const PROMPT_VERSION = 'basic-plain-v3';
