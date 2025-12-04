import { computed, reactive, ref, watch } from "vue";
import { getAllConfigFields, getChartConfig } from "../configs";
import {
  clearPersistedConfig,
  loadPersistedConfig,
  persistConfig,
} from "../utils/storage";

/**
 * 图表配置管理 Hook
 * @param {Object} options - 配置选项
 * @param {import('vue').Ref<string>} options.chartType - 图表类型的 ref
 * @returns {Object} 配置管理相关方法和状态
 */
export function useChartConfig(options) {
  const { chartType } = options;

  // 图表配置
  const chartConfig = reactive({
    title: "护理质控巡检",
    chartType: chartType.value,
  });

  // 分组折叠状态
  const collapsedGroups = ref({});

  // 获取当前图表类型的配置分组
  const configGroups = computed(() => getChartConfig(chartType.value));

  // 初始化分组折叠状态
  const initCollapsedState = () => {
    configGroups.value.forEach((group) => {
      if (!(group.group in collapsedGroups.value)) {
        collapsedGroups.value[group.group] = group.collapsed ?? false;
      }
    });
  };

  // 切换分组折叠状态
  const toggleGroup = (groupKey) => {
    collapsedGroups.value[groupKey] = !collapsedGroups.value[groupKey];
  };

  // 获取分组内可见的字段
  const getVisibleFields = (group) => {
    return (group.fields || []).filter((field) => {
      if (typeof field.showWhen === "function") {
        return field.showWhen(chartConfig);
      }
      return true;
    });
  };

  // 初始化配置默认值
  const initConfigDefaults = (type) => {
    const allFields = getAllConfigFields(type);
    allFields.forEach((field) => {
      if (field.type === "action") {
        return;
      }
      if (!(field.field in chartConfig)) {
        chartConfig[field.field] = field.default;
      }
    });
  };

  // 应用持久化的配置
  const applyPersistedConfig = (type) => {
    const stored = loadPersistedConfig(type);
    if (stored) {
      Object.keys(stored).forEach((key) => {
        if (key !== "chartType") {
          chartConfig[key] = stored[key];
        }
      });
    }
  };

  // 保存配置到本地存储
  const saveConfig = () => {
    const configToSave = { ...chartConfig };
    delete configToSave.chartType;
    persistConfig(chartConfig.chartType, configToSave);
  };

  // 重置配置项
  const resetConfig = (type) => {
    clearPersistedConfig(type);
    const allFields = getAllConfigFields(type);
    allFields.forEach((field) => {
      if (field.type !== "action" && field.field in chartConfig) {
        chartConfig[field.field] = field.default;
      }
    });
  };

  // 监听配置变化，自动保存
  watch(
    chartConfig,
    () => {
      saveConfig();
    },
    { deep: true }
  );

  // 监听图表类型变化
  watch(
    chartType,
    (newType) => {
      chartConfig.chartType = newType;
      initConfigDefaults(newType);
      applyPersistedConfig(newType);
      initCollapsedState();
    },
    { immediate: true }
  );

  return {
    chartConfig,
    configGroups,
    collapsedGroups,
    toggleGroup,
    getVisibleFields,
    resetConfig,
  };
}
