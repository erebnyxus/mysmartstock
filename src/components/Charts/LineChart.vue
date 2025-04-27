<template>
  <div>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const props = defineProps({
  chartData: {
    type: Object,
    required: true,
  },
  chartOptions: {
    type: Object,
    required: false,
    default: () => ({}),
  },
});

const chartCanvas = ref(null);
let chartInstance = null;

// Function to initialize or update the chart
const renderChart = () => {
  if (chartInstance) {
    chartInstance.destroy(); // Destroy the existing chart instance
  }

  if (chartCanvas.value) {
    chartInstance = new Chart(chartCanvas.value, {
      type: 'line',
      data: props.chartData,
      options: {
        ...props.chartOptions,
        plugins: {
          ...props.chartOptions.plugins,
          legend: {
            ...props.chartOptions.plugins?.legend,
            labels: {
              ...props.chartOptions.plugins?.legend?.labels,
              filter: (legendItem) =>
                legendItem.text !== 'Item In Quantity' && legendItem.text !== 'Item Out Quantity', // Hide "Item In Quantity" and "Item Out Quantity" from the legend
            },
          },
        },
      },
    });
  }
};

// Watch for changes in chartData and re-render the chart
watch(
  () => props.chartData,
  () => {
    renderChart();
  },
  { deep: true },
);

onMounted(() => {
  renderChart();
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>

<style scoped>
canvas {
  max-width: 100%;
  height: auto;
}
</style>
