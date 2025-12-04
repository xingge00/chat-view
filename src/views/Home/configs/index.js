// 图表配置入口文件
import { commonConfig } from './common';
import { buildLineOption, lineConfig, lineSampleData } from './Line';
import { buildPieOption, pieConfig, pieSampleData } from './Pie';

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

// 图表默认数据映射
export const chartDataDefaults = {
  line: lineSampleData,
  pie: pieSampleData,
};

// 图表构建函数映射
export const chartBuilderMap = {
  line: buildLineOption,
  pie: buildPieOption,
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

// 获取图表默认数据
export function getChartDefaultData(chartType) {
  return chartDataDefaults[chartType] || [];
}

/**
 * 构建图表配置
 * @param {string} chartType - 图表类型
 * @param {Object} config - 图表配置对象
 * @param {Array} data - 图表数据
 * @returns {Object} ECharts 配置对象
 */
export function buildChartOption(chartType, config, data) {
  const builder = chartBuilderMap[chartType];
  if (builder) {
    return builder(config, data);
  }
  // 默认返回空配置
  return {};
}

export {
  commonConfig,
  lineConfig,
  pieConfig,
  lineSampleData,
  pieSampleData,
  buildLineOption,
  buildPieOption,
};
