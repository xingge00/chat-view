import { computed } from "vue";
import { buildChartOption } from "../configs";

/**
 * 图表选项生成 Hook
 * @param {Object} options - 配置选项
 * @param {import('vue').Ref<string>} options.chartType - 图表类型的 ref
 * @param {Object} options.chartConfig - 图表配置对象
 * @param {import('vue').ComputedRef<Array>} options.chartData - 图表数据
 * @returns {Object} 图表选项相关计算属性
 */
export function useChartOption(options) {
  const { chartType, chartConfig, chartData } = options;

  // 生成公共配置
  const buildBaseOption = () => {
    return {
      title: {
        show: chartConfig.showTitle !== false,
        text: chartConfig.title || "",
        left: chartConfig.titlePosition || "left",
      },
      tooltip: {
        trigger: chartType.value === "pie" ? "item" : "axis",
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
  };

  // 生成 ECharts option
  const chartOption = computed(() => {
    const baseOption = buildBaseOption();
    const specificOption = buildChartOption(
      chartType.value,
      chartConfig,
      chartData.value
    );
    return { ...baseOption, ...specificOption };
  });

  // 图表尺寸
  const chartSize = computed(() => ({
    width: Number(chartConfig.chartWidth) || 600,
    height: Number(chartConfig.chartHeight) || 400,
  }));

  return {
    chartOption,
    chartSize,
  };
}
