<script setup>
import { computed, ref } from "vue";
import { ElMessage } from "element-plus";
import ConfigPanel from "./components/ConfigPanel.vue";
import ChartTypeSidebar from "./components/ChartTypeSidebar.vue";
import VChart from "@/components/VChart.vue";

const chartViewRef = ref(null);
const configPanelRef = ref(null);

// 当前选中的图表类型
const currentChartType = ref("line");

const chartOption = computed(() => {
  return configPanelRef.value?.chartOption ?? {};
});

const chartSize = computed(() => {
  const sizeData = configPanelRef.value?.chartSize;
  if (!sizeData) {
    return { width: 600, height: 400 };
  }
  const sizeValue = sizeData ?? {};
  return {
    width: Number(sizeValue.width) || 600,
    height: Number(sizeValue.height) || 400,
  };
});

const handleExportImage = () => {
  try {
    const dataUrl = chartViewRef.value?.exportChartImage?.("png", {
      pixelRatio: 3,
      backgroundColor: chartOption.value?.backgroundColor || "#fff",
    });

    if (!dataUrl) {
      ElMessage.warning("图表尚未渲染完成，请稍后再试");
      return;
    }

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${chartOption.value?.title?.text || "chart"}.png`;
    link.click();
    ElMessage.success("PNG 图片导出成功");
  } catch (error) {
    console.error("导出图表失败", error);
    ElMessage.error("导出失败，请稍后重试");
  }
};
</script>

<template>
  <div class="home-page">
    <div class="home-page__workspace">
      <ChartTypeSidebar v-model="currentChartType" />
      <section class="home-page__workspace__preview">
        <div class="button-wrapper">
          <el-button
            type="primary"
            plain
            size="small"
            @click="handleExportImage"
          >
            导出 PNG
          </el-button>
        </div>
        <div class="chart-view">
          <VChart
            ref="chartViewRef"
            :option="chartOption"
            :height="chartSize.height"
            :width="chartSize.width"
          />
        </div>
      </section>
      <ConfigPanel ref="configPanelRef" :chart-type="currentChartType" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  box-sizing: border-box;
  width: 100%;
  padding: 20px;
  background: #f4f6fb;
  overflow: hidden;

  &__workspace {
    display: flex;
    gap: 20px;
    align-items: stretch;
    min-height: calc(100vh - 40px);
    &__preview {
      background: #ededf0;
      border-radius: 14px;
      padding: 20px;
      flex: 1;
      min-width: 0;
      overflow: hidden;
      $button-height: 32px;
      .button-wrapper {
        text-align: right;
        margin-bottom: 16px;
        height: $button-height;
      }
      .chart-view {
        height: calc(100% - #{$button-height} - 16px);
        display: flex;
        justify-content: center;
        align-items: center;

      }
    }
  }

}
</style>
