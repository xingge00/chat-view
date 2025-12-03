// 折线图默认示例数据
export const lineSampleData = [
  { id: 1, label: "护理巡视", value: 92.4 },
  { id: 2, label: "用药核对", value: 88.6 },
  { id: 3, label: "压疮预防", value: 84.2 },
  { id: 4, label: "跌倒防护", value: 80.1 },
  { id: 5, label: "术后评估", value: 76.9 },
];

// 折线图配置项（分组结构）
export const lineConfig = [
  {
    group: 'lineStyle',
    groupLabel: '线条样式',
    collapsed: false,
    fields: [
      {
        field: 'smooth',
        label: '平滑曲线',
        type: 'switch',
        default: false,
      },
      {
        field: 'lineWidth',
        label: '线条宽度',
        type: 'slider',
        default: 2,
        min: 1,
        max: 10,
        step: 1,
      },
      {
        field: 'lineColor',
        label: '线条颜色',
        type: 'color',
        default: '#5470c6',
      },
    ],
  },
  {
    group: 'area',
    groupLabel: '面积设置',
    collapsed: true,
    fields: [
      {
        field: 'showArea',
        label: '显示面积',
        type: 'switch',
        default: false,
      },
      {
        field: 'areaOpacity',
        label: '面积透明度',
        type: 'slider',
        default: 0.3,
        min: 0,
        max: 1,
        step: 0.1,
        showWhen: (config) => config.showArea,
      },
    ],
  },
  {
    group: 'dataPoint',
    groupLabel: '数据点',
    collapsed: true,
    fields: [
      {
        field: 'showDataPoints',
        label: '显示数据点',
        type: 'switch',
        default: true,
      },
      {
        field: 'pointSize',
        label: '数据点大小',
        type: 'slider',
        default: 4,
        min: 2,
        max: 12,
        step: 1,
        showWhen: (config) => config.showDataPoints,
      },
    ],
  },
  {
    group: 'axis',
    groupLabel: '坐标轴',
    collapsed: true,
    fields: [
      {
        field: 'xAxisLabel',
        label: 'X轴标签',
        type: 'input',
        default: '',
        placeholder: '请输入X轴标签',
      },
      {
        field: 'yAxisLabel',
        label: 'Y轴标签',
        type: 'input',
        default: '',
        placeholder: '请输入Y轴标签',
      },
    ],
  },
];
