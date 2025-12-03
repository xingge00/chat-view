<script setup>
import { computed, reactive, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowDown, ArrowRight } from "@element-plus/icons-vue";
import { getAllConfigFields, getChartConfig, getChartDefaultData } from "../configs";
import {
  clearPersistedConfig,
  clearPersistedRows,
  cloneRows,
  loadPersistedConfig,
  loadPersistedRows,
  persistConfig,
  persistRows,
} from "../utils/storage";
import DataEditorDialog from "./DataEditorDialog.vue";

const props = defineProps({
  chartType: {
    type: String,
    default: "line",
  },
});

const getDefaultRows = (type) => {
  const base = getChartDefaultData(type);
  if (base?.length) {
    return cloneRows(base);
  }
  const fallback = getChartDefaultData(type);
  return cloneRows(fallback?.length ? fallback : []);
};

// 数据行
const dataRows = ref(getDefaultRows(props.chartType));

const applyDataForChartType = (type) => {
  const stored = loadPersistedRows(type);
  dataRows.value = stored.length ? stored : getDefaultRows(type);
};

const dataEditorVisible = ref(false);

// 图表配置
const chartConfig = reactive({
  title: "护理质控巡检",
  chartType: props.chartType,
});

// 获取当前图表类型的配置分组
const configGroups = computed(() => getChartConfig(props.chartType));

// 分组折叠状态
const collapsedGroups = ref({});

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
  () => props.chartType,
  (newType) => {
    chartConfig.chartType = newType;
    initConfigDefaults(newType);
    applyPersistedConfig(newType);
    initCollapsedState();
    applyDataForChartType(newType);
  },
  { immediate: true }
);

// 图表数据
const chartData = computed(() =>
  dataRows.value.map((item) => ({
    label: item.label || "",
    value: Number(item.value) || 0,
  }))
);

const dataPreview = computed(() => dataRows.value.slice(0, 5));

const openDataEditor = () => {
  dataEditorVisible.value = true;
};

const handleDataSave = (rows) => {
  const sanitized = rows.map((item, index) => ({
    id: item.id ?? `${Date.now()}-${index}`,
    label: item.label,
    value: Number(item.value),
  }));
  dataRows.value = sanitized;
  persistRows(chartConfig.chartType, sanitized);
};

// 重置图表数据
const handleResetData = async () => {
  await ElMessageBox.confirm(
    "重置后图表数据将恢复为默认示例，是否继续？",
    "确认重置数据",
    {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    }
  );
  const type = chartConfig.chartType;
  clearPersistedRows(type);
  dataRows.value = getDefaultRows(type);
  ElMessage.success("图表数据已重置");
};

// 重置配置项
const handleResetConfig = async () => {
  await ElMessageBox.confirm(
    "重置后配置项将恢复为默认值，是否继续？",
    "确认重置配置",
    {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    }
  );
  const type = chartConfig.chartType;
  clearPersistedConfig(type);
  const allFields = getAllConfigFields(type);
  allFields.forEach((field) => {
    if (field.type !== "action" && field.field in chartConfig) {
      chartConfig[field.field] = field.default;
    }
  });
  ElMessage.success("配置项已重置");
};

// 重置全部（数据 + 配置）
const handleResetAll = async () => {
  await ElMessageBox.confirm(
    "重置后图表数据和配置项将全部恢复为默认状态，是否继续？",
    "确认重置全部",
    {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    }
  );
  const type = chartConfig.chartType;
  // 重置数据
  clearPersistedRows(type);
  dataRows.value = getDefaultRows(type);
  // 重置配置
  clearPersistedConfig(type);
  const allFields = getAllConfigFields(type);
  allFields.forEach((field) => {
    if (field.type !== "action" && field.field in chartConfig) {
      chartConfig[field.field] = field.default;
    }
  });
  ElMessage.success("数据和配置已全部重置");
};

const handleFieldAction = async (field) => {

};

// 生成折线图配置
const buildLineOption = () => {
  const xData = chartData.value.map((item) => item.label);
  const yData = chartData.value.map((item) => item.value);

  return {
    xAxis: {
      type: "category",
      data: xData,
      name: chartConfig.xAxisLabel || "",
    },
    yAxis: {
      type: "value",
      name: chartConfig.yAxisLabel || "",
    },
    series: [
      {
        type: "line",
        data: yData,
        smooth: chartConfig.smooth || false,
        areaStyle: chartConfig.showArea
          ? { opacity: chartConfig.areaOpacity || 0.3 }
          : null,
        lineStyle: {
          width: chartConfig.lineWidth || 2,
          color: chartConfig.lineColor || "#5470c6",
        },
        itemStyle: {
          color: chartConfig.lineColor || "#5470c6",
        },
        showSymbol: chartConfig.showDataPoints !== false,
        symbolSize: chartConfig.pointSize || 4,
      },
    ],
  };
};

// 生成饼图配置
const buildPieOption = () => {
  const seriesData = chartData.value.map((item) => ({
    name: item.label,
    value: item.value,
  }));

  // 标签格式化
  const getLabelFormatter = () => {
    const format = chartConfig.labelFormatter || "name";
    switch (format) {
      case "value":
        return "{c}";
      case "percent":
        return "{d}%";
      case "name-value":
        return "{b}: {c}";
      case "name-percent":
        return "{b}: {d}%";
      default:
        return "{b}";
    }
  };

  return {
    series: [
      {
        type: "pie",
        data: seriesData,
        radius: [
          `${chartConfig.innerRadius || 0}%`,
          `${chartConfig.outerRadius || 70}%`,
        ],
        roseType:
          chartConfig.roseType === "none" ? false : chartConfig.roseType,
        label: {
          show: chartConfig.showLabel !== false,
          position: chartConfig.labelPosition || "outside",
          formatter: getLabelFormatter(),
        },
        itemStyle: {
          borderRadius: chartConfig.borderRadius || 0,
          borderWidth: chartConfig.borderWidth || 0,
          borderColor: "#fff",
        },
      },
    ],
  };
};

// 生成 ECharts option
const chartOption = computed(() => {
  // 公共配置
  const baseOption = {
    title: {
      show: chartConfig.showTitle !== false,
      text: chartConfig.title || "",
      left: chartConfig.titlePosition || "left",
    },
    tooltip: {
      trigger: props.chartType === "pie" ? "item" : "axis",
    },
    legend: {
      show: chartConfig.showLegend !== false,
      orient:
        chartConfig.legendPosition === "left"
        || chartConfig.legendPosition === "right"
          ? "vertical"
          : "horizontal",
      left:
        chartConfig.legendPosition === "left"
          ? "left"
          : chartConfig.legendPosition === "right"
            ? "right"
            : "center",
      top:
        chartConfig.legendPosition === "bottom"
          ? "bottom"
          : chartConfig.legendPosition === "left"
            || chartConfig.legendPosition === "right"
            ? "middle"
            : "top",
    },
    backgroundColor: chartConfig.backgroundColor || "#ffffff",
  };

  // 根据图表类型合并特定配置
  const specificOption
    = props.chartType === "pie" ? buildPieOption() : buildLineOption();

  return { ...baseOption, ...specificOption };
});

const chartSize = computed(() => ({
  width: Number(chartConfig.chartWidth) || 600,
  height: Number(chartConfig.chartHeight) || 400,
}));

defineExpose({
  chartOption,
  chartSize,
});
</script>

<template>
  <aside class="config-panel">
    <div class="config-panel__section">
      <div class="config-panel__title">
        配置面板
      </div>
      <el-button size="small" @click="handleResetConfig">
        重置配置
      </el-button>
      <el-button size="small" type="danger" plain @click="handleResetAll">
        重置全部
      </el-button>
    </div>

    <div class="config-panel__section config-panel__data-section">
      <div class="config-panel__data-head">
        <div>
          <div class="config-panel__sub-title">
            图表数据
          </div>
          <p class="config-panel__data-count">
            共 {{ dataRows.length }} 条
          </p>
        </div>
        <div>
          <el-button type="warning" plain size="small" @click="handleResetData()">
            重置数据
          </el-button>
          <el-button size="small" type="primary" plain @click="openDataEditor">
            编辑
          </el-button>
        </div>
      </div>
      <ul v-if="dataRows.length" class="config-panel__data-list">
        <li
          v-for="row in dataPreview"
          :key="row.id"
          class="config-panel__data-item"
        >
          <span class="config-panel__data-label">{{ row.label }}</span>
          <span class="config-panel__data-value">{{ row.value }}</span>
        </li>
        <li
          v-if="dataRows.length > dataPreview.length"
          class="config-panel__data-more"
        >
          还有 {{ dataRows.length - dataPreview.length }} 条数据…
        </li>
      </ul>
      <div v-else class="config-panel__data-empty">
        暂无数据，请点击"编辑"开始配置
      </div>
    </div>

    <div class="config-panel__content">
      <!-- 分组配置 -->
      <div
        v-for="group in configGroups"
        :key="group.group"
        class="config-panel__group"
      >
        <div
          class="config-panel__group-header"
          @click="toggleGroup(group.group)"
        >
          <el-icon class="config-panel__group-icon">
            <ArrowDown v-if="!collapsedGroups[group.group]" />
            <ArrowRight v-else />
          </el-icon>
          <span class="config-panel__group-label">{{ group.groupLabel }}</span>
        </div>

        <transition name="collapse">
          <div
            v-show="!collapsedGroups[group.group]"
            class="config-panel__group-content"
          >
            <div
              v-for="field in getVisibleFields(group)"
              :key="field.field"
              class="config-panel__field"
            >
              <label class="config-panel__label">{{ field.label }}</label>

              <!-- 输入框 -->
              <el-input
                v-if="field.type === 'input'"
                v-model="chartConfig[field.field]"
                :placeholder="field.placeholder"
                size="small"
              />

              <!-- 开关 -->
              <el-switch
                v-else-if="field.type === 'switch'"
                v-model="chartConfig[field.field]"
              />

              <!-- 选择器 -->
              <el-select
                v-else-if="field.type === 'select'"
                v-model="chartConfig[field.field]"
                size="small"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in field.options"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>

              <!-- 颜色选择器 -->
              <el-color-picker
                v-else-if="field.type === 'color'"
                v-model="chartConfig[field.field]"
                show-alpha
              />

              <!-- 滑块 -->
              <el-slider
                v-else-if="field.type === 'slider'"
                v-model="chartConfig[field.field]"
                :min="field.min"
                :max="field.max"
                :step="field.step"
                :show-tooltip="true"
              />

              <el-button
                v-else-if="field.type === 'action'"
                type="warning"
                plain
                size="small"
                @click="handleFieldAction(field)"
              >
                {{ field.buttonLabel || field.label }}
              </el-button>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <DataEditorDialog
      v-model="dataEditorVisible"
      :data="dataRows"
      @save="handleDataSave"
    />
  </aside>
</template>

<style lang="scss" scoped>
.config-panel {
  width: 380px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 10px 30px rgba(17, 24, 39, 0.08);
  max-height: calc(100vh - 80px);
  overflow-y: auto;

  &__section {
    margin-bottom: 20px;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: #1f2933;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
  }

  &__sub-title {
    font-size: 13px;
    font-weight: 600;
    color: #111827;
  }

  &__data-section {
    background: #f9fafb;
    border-radius: 12px;
    padding: 12px;
  }

  &__data-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  &__data-count {
    margin: 4px 0 0;
    font-size: 12px;
    color: #6b7280;
  }

  &__data-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__data-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    padding: 8px 10px;
    border-radius: 10px;
    background: #fff;
    box-shadow: inset 0 0 0 1px #e5e7eb;
  }

  &__data-label {
    color: #374151;
    font-weight: 500;
  }

  &__data-value {
    color: #111827;
    font-weight: 600;
  }

  &__data-more {
    font-size: 12px;
    color: #6b7280;
    padding: 0 2px;
  }

  &__data-empty {
    font-size: 12px;
    color: #9ca3af;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__group {
    background: #f9fafb;
    border-radius: 10px;
    overflow: hidden;
  }

  &__group-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s;

    &:hover {
      background: #f3f4f6;
    }
  }

  &__group-icon {
    font-size: 12px;
    color: #6b7280;
    transition: transform 0.2s;
  }

  &__group-label {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
  }

  &__group-content {
    padding: 0 12px 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__label {
    font-size: 13px;
    font-weight: 500;
    color: #374151;
  }
}

// 折叠动画
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
