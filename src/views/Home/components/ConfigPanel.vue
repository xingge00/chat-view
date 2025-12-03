<script setup>
import { computed, reactive, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getChartConfig, getChartDefaultData } from "../configs";
import DataEditorDialog from "./DataEditorDialog.vue";

const props = defineProps({
  chartType: {
    type: String,
    default: "line",
  },
});
const STORAGE_KEY_PREFIX = "chart-view:data";
const isBrowser = typeof window !== "undefined";

const cloneRows = (rows = []) =>
  rows.map((item, index) => ({
    id: item.id ?? `${Date.now()}-${index}`,
    label: item.label ?? "",
    value: Number(item.value) || 0,
  }));

const getDefaultRows = (type) => {
  const base = getChartDefaultData(type);
  if (base?.length) {
    return cloneRows(base);
  }
  const fallback = getChartDefaultData(type);
  return cloneRows(fallback?.length ? fallback : []);
};

const getStorageKey = (type) => `${STORAGE_KEY_PREFIX}:${type}`;

const loadPersistedRows = (type) => {
  if (!isBrowser) return [];
  try {
    const raw = window.localStorage?.getItem(getStorageKey(type));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return cloneRows(parsed).filter((item) => item.label);
  } catch (error) {
    console.warn("加载持久化数据失败", error);
    return [];
  }
};

const persistRows = (type, rows) => {
  if (!isBrowser) return;
  try {
    window.localStorage?.setItem(getStorageKey(type), JSON.stringify(rows));
  } catch (error) {
    console.warn("保存持久化数据失败", error);
  }
};

const clearPersistedRows = (type) => {
  if (!isBrowser) return;
  try {
    window.localStorage?.removeItem(getStorageKey(type));
  } catch (error) {
    console.warn("清理持久化数据失败", error);
  }
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

// 获取当前图表类型的配置项
const configFields = computed(() => getChartConfig(props.chartType));

// 可见的配置项（根据 showWhen 条件过滤）
const visibleConfigFields = computed(() =>
  configFields.value.filter((field) => {
    if (typeof field.showWhen === "function") {
      return field.showWhen(chartConfig);
    }
    return true;
  })
);

// 初始化配置默认值
const initConfigDefaults = () => {
  configFields.value.forEach((field) => {
    if (field.type === "action") {
      return;
    }
    if (!(field.field in chartConfig)) {
      chartConfig[field.field] = field.default;
    }
  });
};

// 监听图表类型变化
watch(
  () => props.chartType,
  (newType) => {
    chartConfig.chartType = newType;
    initConfigDefaults();
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

const handleResetData = async () => {
  await ElMessageBox.confirm(
    "重置后当前图表的数据将恢复为默认示例，已保存的数据也会被清空，是否继续？",
    "确认重置数据",
    {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    }
  );
  clearPersistedRows(chartConfig.chartType);
  dataRows.value = getDefaultRows(chartConfig.chartType);
  ElMessage.success("图表数据已恢复为默认示例");
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
      text: chartConfig.title || "",
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

defineExpose({
  chartOption,
});
</script>

<template>
  <aside class="config-panel">
    <div class="config-panel__section">
      <div class="config-panel__title">
        配置面板
      </div>
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
        暂无数据，请点击“可视化编辑”开始配置
      </div>
    </div>

    <div class="config-panel__content">
      <div
        v-for="field in visibleConfigFields"
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
    gap: 16px;
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
</style>
