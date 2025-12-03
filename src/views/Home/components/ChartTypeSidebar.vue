<script setup>
import { TrendCharts, PieChart } from '@element-plus/icons-vue';
import { chartTypes } from '../configs';

const props = defineProps({
  modelValue: {
    type: String,
    default: 'line',
  },
});

const emit = defineEmits(['update:modelValue']);

const iconMap = {
  TrendCharts,
  PieChart,
};

const handleSelect = (type) => {
  emit('update:modelValue', type);
};
</script>

<template>
  <aside class="chart-sidebar">
    <div class="chart-sidebar__title">图表类型</div>
    <div class="chart-sidebar__list">
      <div
        v-for="item in chartTypes"
        :key="item.type"
        :class="['chart-sidebar__item', { 'is-active': modelValue === item.type }]"
        @click="handleSelect(item.type)"
      >
        <el-icon :size="24">
          <component :is="iconMap[item.icon]" />
        </el-icon>
        <span class="chart-sidebar__label">{{ item.label }}</span>
      </div>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.chart-sidebar {
  width: 100px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 14px;
  padding: 16px 12px;
  box-shadow: 0 10px 30px rgba(17, 24, 39, 0.08);

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: #1f2933;
    text-align: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px 8px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #6b7280;

    &:hover {
      background: #f3f4f6;
      color: #374151;
    }

    &.is-active {
      background: #eff6ff;
      color: #2563eb;
    }
  }

  &__label {
    font-size: 12px;
    font-weight: 500;
  }
}
</style>
