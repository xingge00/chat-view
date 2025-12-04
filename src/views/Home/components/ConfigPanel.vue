<script setup>
import { toRef } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowDown, ArrowRight } from "@element-plus/icons-vue";
import { useChartConfig, useChartData, useChartOption } from "../hooks";
import DataEditorDialog from "./DataEditorDialog.vue";

const props = defineProps({
  chartType: {
    type: String,
    default: "line",
  },
});

// 将 props.chartType 转换为 ref，以便传递给 hooks
const chartTypeRef = toRef(props, "chartType");

// 使用图表配置 hook
const {
  chartConfig,
  configGroups,
  collapsedGroups,
  toggleGroup,
  getVisibleFields,
  resetConfig,
} = useChartConfig({ chartType: chartTypeRef });

// 使用图表数据 hook
const {
  dataRows,
  dataEditorVisible,
  chartData,
  dataPreview,
  openDataEditor,
  handleDataSave,
  resetData,
} = useChartData({ chartType: chartTypeRef });

// 使用图表选项 hook
const { chartOption, chartSize } = useChartOption({
  chartType: chartTypeRef,
  chartConfig,
  chartData,
});

const warning = (content, title) => ElMessageBox.confirm(
  content,
  title,
  {
    type: "warning",
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  }
)

// 重置图表数据
const handleResetData = async () => {
  await warning("重置后图表数据将恢复为默认示例，是否继续？", "确认重置数据");

  resetData(chartConfig.chartType);
  ElMessage.success("图表数据已重置");
};

// 重置配置项
const handleResetConfig = async () => {
  await warning("重置后配置项将恢复为默认值，是否继续？", "确认重置数据");

  resetConfig(chartConfig.chartType);
  ElMessage.success("配置项已重置");
};

// 重置全部（数据 + 配置）
const handleResetAll = async () => {
  await warning("重置后图表数据和配置项将全部恢复为默认状态，是否继续", "确认重置数据");

  const type = chartConfig.chartType;
  resetData(type);
  resetConfig(type);
  ElMessage.success("数据和配置已全部重置");
};

const handleFieldAction = async (field) => {
  // 预留字段操作处理
};

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
        <span>
          <el-button size="small" @click="handleResetConfig">
            重置配置
          </el-button>
          <el-button size="small" type="danger" plain @click="handleResetAll">
            重置全部
          </el-button>
        </span>
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
