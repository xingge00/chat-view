// 图表配置入口文件
import { commonConfig } from './common';
import { lineConfig, lineSampleData } from './Line';
import { pieConfig, pieSampleData } from './Pie';

// 图表类型列表
export const chartTypes = [
  {
    type: 'line',
    label: '折线图',
    icon: 'TrendCharts',
  },
  {
    type: 'pie',
    label: '饼图',
    icon: 'PieChart',
  },
];

// 图表配置映射
export const chartConfigMap = {
  line: lineConfig,
  pie: pieConfig,
};

export const chartDataDefaults = {
  line: lineSampleData,
  pie: pieSampleData,
};

// 获取完整配置（公共配置 + 图表特定配置）- 返回分组结构
export function getChartConfig(chartType) {
  const specificConfig = chartConfigMap[chartType] || [];
  return [...commonConfig, ...specificConfig];
}

// 获取所有配置字段（扁平化，用于初始化默认值）
export function getAllConfigFields(chartType) {
  const groups = getChartConfig(chartType);
  return groups.flatMap((group) => group.fields || []);
}

export function getChartDefaultData(chartType) {
  return chartDataDefaults[chartType] || [];
}

export { commonConfig, lineConfig, pieConfig, lineSampleData, pieSampleData };
