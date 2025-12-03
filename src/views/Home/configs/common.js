// 公共配置项 - 所有图表类型都会使用（分组结构）
export const commonConfig = [
  {
    group: 'title',
    groupLabel: '标题设置',
    collapsed: false,
    fields: [
      {
        field: 'showTitle',
        label: '显示标题',
        type: 'switch',
        default: true,
      },
      {
        field: 'title',
        label: '图表标题',
        type: 'input',
        default: '未命名图表',
        placeholder: '请输入图表标题',
        showWhen: (config) => config.showTitle,
      },
      {
        field: 'titlePosition',
        label: '标题位置',
        type: 'select',
        default: 'left',
        options: [
          { label: '左侧', value: 'left' },
          { label: '居中', value: 'center' },
          { label: '右侧', value: 'right' },
        ],
        showWhen: (config) => config.showTitle,
      },
    ],
  },
  {
    group: 'size',
    groupLabel: '尺寸设置',
    collapsed: false,
    fields: [
      {
        field: 'chartWidth',
        label: '图表宽度（px）',
        type: 'input',
        default: 600,
        placeholder: '请输入图表宽度',
      },
      {
        field: 'chartHeight',
        label: '图表高度（px）',
        type: 'input',
        default: 400,
        placeholder: '请输入图表高度',
      },
      {
        field: 'backgroundColor',
        label: '背景颜色',
        type: 'color',
        default: '#ffffff',
      },
    ],
  },
  {
    group: 'legend',
    groupLabel: '图例设置',
    collapsed: false,
    fields: [
      {
        field: 'showLegend',
        label: '显示图例',
        type: 'switch',
        default: true,
      },
      {
        field: 'legendPosition',
        label: '图例位置',
        type: 'select',
        default: 'top',
        options: [
          { label: '顶部', value: 'top' },
          { label: '底部', value: 'bottom' },
          { label: '左侧', value: 'left' },
          { label: '右侧', value: 'right' },
        ],
        showWhen: (config) => config.showLegend,
      },
    ],
  },
];
