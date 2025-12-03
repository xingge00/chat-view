// 公共配置项 - 所有图表类型都会使用
export const commonConfig = [
  {
    field: 'title',
    label: '图表标题',
    type: 'input',
    default: '未命名图表',
    placeholder: '请输入图表标题',
  },
  {
    field: 'backgroundColor',
    label: '背景颜色',
    type: 'color',
    default: '#ffffff',
  },
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
];
