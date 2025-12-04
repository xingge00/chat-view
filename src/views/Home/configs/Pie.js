// 饼图默认示例数据
export const pieSampleData = [
  { id: 1, label: "医疗质量", value: 38 },
  { id: 2, label: "护理满意度", value: 26 },
  { id: 3, label: "服务效率", value: 18 },
  { id: 4, label: "风险控制", value: 12 },
  { id: 5, label: "患者反馈", value: 6 },
];

// 饼图配置项（分组结构）
export const pieConfig = [
  {
    group: 'pieStyle',
    groupLabel: '饼图样式',
    collapsed: false,
    fields: [
      {
        field: 'roseType',
        label: '玫瑰图模式',
        type: 'select',
        default: 'none',
        options: [
          { label: '关闭', value: 'none' },
          { label: '半径模式', value: 'radius' },
          { label: '面积模式', value: 'area' },
        ],
      },
      {
        field: 'innerRadius',
        label: '内半径(%)',
        type: 'slider',
        default: 0,
        min: 0,
        max: 80,
        step: 5,
      },
      {
        field: 'outerRadius',
        label: '外半径(%)',
        type: 'slider',
        default: 70,
        min: 30,
        max: 90,
        step: 5,
      },
    ],
  },
  {
    group: 'pieLabel',
    groupLabel: '标签设置',
    collapsed: false,
    fields: [
      {
        field: 'showLabel',
        label: '显示标签',
        type: 'switch',
        default: true,
      },
      {
        field: 'labelPosition',
        label: '标签位置',
        type: 'select',
        default: 'outside',
        options: [
          { label: '外部', value: 'outside' },
          { label: '内部', value: 'inside' },
          { label: '中心', value: 'center' },
        ],
        showWhen: (config) => config.showLabel,
      },
      {
        field: 'labelFormatter',
        label: '标签格式',
        type: 'select',
        default: 'name',
        options: [
          { label: '仅名称', value: 'name' },
          { label: '仅数值', value: 'value' },
          { label: '仅百分比', value: 'percent' },
          { label: '名称+数值', value: 'name-value' },
          { label: '名称+百分比', value: 'name-percent' },
        ],
        showWhen: (config) => config.showLabel,
      },
    ],
  },
  {
    group: 'pieBorder',
    groupLabel: '边框设置',
    collapsed: true,
    fields: [
      {
        field: 'borderRadius',
        label: '扇区圆角',
        type: 'slider',
        default: 0,
        min: 0,
        max: 20,
        step: 1,
      },
      {
        field: 'borderWidth',
        label: '扇区间隔',
        type: 'slider',
        default: 0,
        min: 0,
        max: 10,
        step: 1,
      },
    ],
  },
];

/**
 * 获取标签格式化函数
 * @param {string} format - 标签格式类型
 * @returns {string} ECharts 格式化字符串
 */
function getLabelFormatter(format) {
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
}

/**
 * 生成饼图 ECharts 配置
 * @param {Object} config - 图表配置对象
 * @param {Array} data - 图表数据 [{ label, value }, ...]
 * @returns {Object} ECharts series 配置
 */
export function buildPieOption(config, data) {
  const seriesData = data.map((item) => ({
    name: item.label,
    value: item.value,
  }));

  return {
    series: [
      {
        type: "pie",
        data: seriesData,
        radius: [
          `${config.innerRadius || 0}%`,
          `${config.outerRadius || 70}%`,
        ],
        roseType: config.roseType === "none" ? false : config.roseType,
        label: {
          show: config.showLabel !== false,
          position: config.labelPosition || "outside",
          formatter: getLabelFormatter(config.labelFormatter || "name"),
        },
        itemStyle: {
          borderRadius: config.borderRadius || 0,
          borderWidth: config.borderWidth || 0,
          borderColor: "#fff",
        },
      },
    ],
  };
}
