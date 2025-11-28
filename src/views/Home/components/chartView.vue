<script setup>
import { computed, onMounted, ref } from 'vue'
import { getQueryObject } from '@/utils'
import VChart from '@/components/vchart.vue'
// import { dynamicApi } from '@/api/index'
const dynamicApi = async () => {}
const mock = {
  code: 200,
  message: '操作成功',
  data: [
    {
      formId: 1001,
      formName: '护理质量检查表',
      avgQualityRate: 92.35,
    },
    {
      formId: 1002,
      formName: '用药安全检查表',
      avgQualityRate: 88.76,
    },
  ],
  success: true,
  timestamp: '2025-09-05T10:30:00',
}

const MAX_WIDTH = 700

const renderChartHeight = ref(400)
const chartData = ref([])

const colors = [
  '#ff0000',
  '#ffc000',
  '#ffff00',
  '#92d050',
  '#00b0f0',
  '#a9d18e',
  '#ffd966',
  '#4f81bd',
  '#0086bf',
  '#de3c4b',
  '#8fbc57',
  '#8764a3',
  '#00b1c7',
  '#ff8a40',
  '#005076',
  '#8b1e29',
  '#56762e',
  '#523b62',
  '#006e7d',
]

const combinationOption = (
  dataList,
  config = {
    xIndexField: 'questionStr',
    count: 'count',
  },
) => {
  const xAxisData = dataList.map(i => i[config.xIndexField])
  // 通过率
  const seriesData = dataList.map(i => i[config.count])

  // x轴字体大小
  const xLabelFontsize = 12

  return {
    animation: false,
    grid: {
      y: 30, // 上内边距
      x2: 45, // 右内边距
      x: 35, // 左内边距
      y2: 75, // 下内边距
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        // 坐标轴指示器，坐标轴触发有效
        type: 'cross', // 默认为直线，可选为：'line' | 'shadow'
        label: {
          show: false,
        },
      },
      formatter(params) {
        // return `问题频次：${params[0].name}<br/>缺陷数量：${params[0].value}<br/>累计百分比：${params[0].value}%`
        return `<b>${params[0].name}</b><br/>
                ${params[0]?.seriesName} : ${params[0]?.value}<br/>
                `
      },
    },
    xAxis: [
      {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          show: true,
          interval: 0, // 强制显示全部刻度名
          textStyle: {
            fontSize: `${xLabelFontsize}px`,
          },
          rotate: 45,
          width: 80,
          overflow: 'truncate',
          ellipsis: '...',
        },
        axisPointer: {
          // 坐标轴指示器，坐标轴触发有效
          type: 'shadow',
        },
        splitLine: false,
      },
    ],
    yAxis: [
      {
        type: 'value',
        axisLine: { show: true },
        splitLine: 1,
      },
    ],
    series: [
      {
        name: '通过率',
        type: 'bar',
        // barMaxWidth: '60',
        barGap: '10%',
        barCategoryGap: '30%',
        itemStyle: {
          normal: {
            color(obj) {
              if (obj.dataIndex >= 0) {
                return colors[obj.dataIndex % colors.length]
              }
            },
          },
        },
        data: seriesData,
      },
    ],
  }
}

const VCharOption = computed(() => {
  const list = chartData.value
  return combinationOption(list, {
    xIndexField: 'formName',
    count: 'avgQualityRate',
  })
})
const title = ref('')
const noDataFlag = ref(false)
const getData = async () => {
  const url = window.location.href
  const { token, code, ...params } = getQueryObject(url)
  // const res = await dynamicApi('BI/getFormQualityRate', params, token)
  const res = mock

  if (!res?.data?.length) {
    noDataFlag.value = true
  }

  chartData.value = [
    // ...(res?.data || []).map((i) => ({ ...i, formName: i.formName + '11' })),
    // ...(res?.data || []).map((i) => ({ ...i, formName: i.formName + '22' })),
    // ...(res?.data || []).map((i) => ({ ...i, formName: i.formName + '33' })),
    // ...(res?.data || []).map((i) => ({ ...i, formName: i.formName + '44' })),
    // ...(res?.data || []).map((i) => ({ ...i, formName: i.formName + '55' })),
    ...(res?.data || []),
  ]

  window?.parent?.postMessage(
    {
      type: 'getReportData',
      data: renderChartHeight.value + 20,
      iframeId: code,
    },
    '*',
  )
}

onMounted(async () => {
  await getData()
})
</script>

<template>
  <div id="container" class="container">
    <div v-if="noDataFlag" class="no-data">
      {{ '暂无数据' }}
    </div>
    <div v-else>
      <div>{{ title }}</div>
      <VChart
        :option="VCharOption"
        :height="renderChartHeight"
        :width="MAX_WIDTH"
        class="mt20"
        manual-update
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .container {
    width: 100%;
    height: 100%;

    .no-data {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>
