<script setup>
import { getCurrentInstance, provide, ref, watch } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart, RadarChart } from 'echarts/charts'
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent,
  TitleComponent,
  // ToolboxComponent,
  TooltipComponent,
  DataZoomComponent,
} from 'echarts/components'
import VChart, { THEME_KEY } from 'vue-echarts'

const props = defineProps({
  option: Object,
  updateOptions: Object,
  height: {
    type: [Number, String],
    default: 500,
  },
  width: {
    type: [Number, String],
    default: '',
  },
  loading: Boolean,
  manualUpdate: {
    type: Boolean,
    default: false,
  },
  isMergeOption: {
    type: Boolean,
    default: true,
  },
})
const emit = defineEmits('chartClick')
provide(THEME_KEY, 'light')

use([
  DatasetComponent,
  CanvasRenderer,
  PieChart,
  LineChart,
  BarChart,
  RadarChart,
  TitleComponent,
  TooltipComponent,
  // ToolboxComponent,
  LegendComponent,
  GridComponent,
  MarkLineComponent,
  MarkPointComponent,
  DataZoomComponent,
])
const vm = getCurrentInstance()
const vchart = ref(null)
const setOption = (option, flag = true) => {
  vchart.value.setOption(option, flag)
}
const handleChartClick = (params) => {
  emit('chartClick', params)
  console.log('waaacccccccccccccccc', params)
}
watch(
  () => props.option,
  () => {
    setOption(props.option, props.isMergeOption)
  },
  { deep: true },
)

// onMounted(() => {
//   setTimeout(() => {
//     chaneImg()
//   }, 0)
// })

const getChartRef = () => {
  return vchart.value
}

const exportChartImage = (type = 'png', options = {}) => {
  const chartInstance = vchart.value?.chart
  if (!chartInstance) return ''
  return chartInstance.getDataURL({
    type,
    pixelRatio: options.pixelRatio ?? 2,
    backgroundColor: options.backgroundColor ?? '#fff',
    excludeComponents: options.excludeComponents ?? [],
  })
}
defineExpose({
  setOption,
  getChartRef,
  exportChartImage,
})
</script>

<template>
  <!-- <el-image :src="imgData"></el-image> -->
  <VChart ref="vchart" :option="option" :update-options="updateOptions"
    :style="{ height: height ? `${height}px` : '100%', width: width ? `${width}px` : '100%' }" autoresize
    :loading="loading" :manual-update="manualUpdate" @click="handleChartClick" />
</template>

<style lang="scss" scoped></style>
