import { computed, ref, watch } from "vue";
import { getChartDefaultData } from "../configs";
import {
  clearPersistedRows,
  cloneRows,
  loadPersistedRows,
  persistRows,
} from "../utils/storage";

/**
 * 图表数据管理 Hook
 * @param {Object} options - 配置选项
 * @param {import('vue').Ref<string>} options.chartType - 图表类型的 ref
 * @returns {Object} 数据管理相关方法和状态
 */
export function useChartData(options) {
  const { chartType } = options;

  // 获取默认数据行
  const getDefaultRows = (type) => {
    const base = getChartDefaultData(type);
    if (base?.length) {
      return cloneRows(base);
    }
    return [];
  };

  // 数据行
  const dataRows = ref(getDefaultRows(chartType.value));

  // 数据编辑对话框可见性
  const dataEditorVisible = ref(false);

  // 应用图表类型对应的数据
  const applyDataForChartType = (type) => {
    const stored = loadPersistedRows(type);
    dataRows.value = stored.length ? stored : getDefaultRows(type);
  };

  // 图表数据（格式化后）
  const chartData = computed(() =>
    dataRows.value.map((item) => ({
      label: item.label || "",
      value: Number(item.value) || 0,
    }))
  );

  // 数据预览（前5条）
  const dataPreview = computed(() => dataRows.value.slice(0, 5));

  // 打开数据编辑器
  const openDataEditor = () => {
    dataEditorVisible.value = true;
  };

  // 保存数据
  const handleDataSave = (rows) => {
    const sanitized = rows.map((item, index) => ({
      id: item.id ?? `${Date.now()}-${index}`,
      label: item.label,
      value: Number(item.value),
    }));
    dataRows.value = sanitized;
    persistRows(chartType.value, sanitized);
  };

  // 重置数据
  const resetData = (type) => {
    clearPersistedRows(type);
    dataRows.value = getDefaultRows(type);
  };

  // 监听图表类型变化
  watch(
    chartType,
    (newType) => {
      applyDataForChartType(newType);
    },
    { immediate: true }
  );

  return {
    dataRows,
    dataEditorVisible,
    chartData,
    dataPreview,
    openDataEditor,
    handleDataSave,
    resetData,
  };
}
