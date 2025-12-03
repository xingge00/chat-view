// 图表数据和配置持久化工具

const STORAGE_KEY_PREFIX = 'chart-view';
const isBrowser = typeof window !== 'undefined';

/**
 * 获取数据存储键名
 * @param {string} type - 图表类型
 * @returns {string} 存储键名
 */
export const getDataStorageKey = (type) => `${STORAGE_KEY_PREFIX}:data:${type}`;

/**
 * 获取配置存储键名
 * @param {string} type - 图表类型
 * @returns {string} 存储键名
 */
export const getConfigStorageKey = (type) => `${STORAGE_KEY_PREFIX}:config:${type}`;

/**
 * 克隆并规范化数据行
 * @param {Array} rows - 原始数据行
 * @returns {Array} 规范化后的数据行
 */
export const cloneRows = (rows = []) =>
  rows.map((item, index) => ({
    id: item.id ?? `${Date.now()}-${index}`,
    label: item.label ?? '',
    value: Number(item.value) || 0,
  }));

// ==================== 数据行持久化 ====================

/**
 * 从本地存储加载持久化的数据行
 * @param {string} type - 图表类型
 * @returns {Array} 数据行数组
 */
export const loadPersistedRows = (type) => {
  if (!isBrowser) return [];
  try {
    const raw = window.localStorage?.getItem(getDataStorageKey(type));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return cloneRows(parsed).filter((item) => item.label);
  } catch (error) {
    console.warn('加载持久化数据失败', error);
    return [];
  }
};

/**
 * 将数据行持久化到本地存储
 * @param {string} type - 图表类型
 * @param {Array} rows - 数据行数组
 */
export const persistRows = (type, rows) => {
  if (!isBrowser) return;
  try {
    window.localStorage?.setItem(getDataStorageKey(type), JSON.stringify(rows));
  } catch (error) {
    console.warn('保存持久化数据失败', error);
  }
};

/**
 * 清除指定图表类型的持久化数据
 * @param {string} type - 图表类型
 */
export const clearPersistedRows = (type) => {
  if (!isBrowser) return;
  try {
    window.localStorage?.removeItem(getDataStorageKey(type));
  } catch (error) {
    console.warn('清理持久化数据失败', error);
  }
};

// ==================== 配置持久化 ====================

/**
 * 从本地存储加载持久化的配置
 * @param {string} type - 图表类型
 * @returns {Object|null} 配置对象，如果不存在则返回 null
 */
export const loadPersistedConfig = (type) => {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage?.getItem(getConfigStorageKey(type));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    return parsed;
  } catch (error) {
    console.warn('加载持久化配置失败', error);
    return null;
  }
};

/**
 * 将配置持久化到本地存储
 * @param {string} type - 图表类型
 * @param {Object} config - 配置对象
 */
export const persistConfig = (type, config) => {
  if (!isBrowser) return;
  try {
    window.localStorage?.setItem(getConfigStorageKey(type), JSON.stringify(config));
  } catch (error) {
    console.warn('保存持久化配置失败', error);
  }
};

/**
 * 清除指定图表类型的持久化配置
 * @param {string} type - 图表类型
 */
export const clearPersistedConfig = (type) => {
  if (!isBrowser) return;
  try {
    window.localStorage?.removeItem(getConfigStorageKey(type));
  } catch (error) {
    console.warn('清理持久化配置失败', error);
  }
};

/**
 * 清除指定图表类型的所有持久化内容（数据 + 配置）
 * @param {string} type - 图表类型
 */
export const clearAllPersisted = (type) => {
  clearPersistedRows(type);
  clearPersistedConfig(type);
};
