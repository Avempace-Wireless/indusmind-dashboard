<template>
  <div>
    <div style="height: 360px;">
      <canvas ref="chartRef"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { aggregateSeries, unifiedTimestampsForMeters } from '@/utils/seriesAggregation'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js'
// Use Intl.DateTimeFormat to avoid extra dependency

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, LineController, Tooltip, Legend)

interface Props {
  meters: any[]
  duration: 'hour'|'day'|'month'
  showZoom?: boolean
}
const props = defineProps<Props>()

const chartRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: ChartJS | any = null

const initChart = () => {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.destroy()
  const ctx = chartRef.value.getContext('2d')
  if (!ctx) return

  // Aggregate series per duration and derive unified timestamps
  const allTimestamps = unifiedTimestampsForMeters(props.meters, props.duration)

  // Format labels according to duration
  const formatLabel = (iso: string) => {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    if (props.duration === 'hour') return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(d)
    if (props.duration === 'day') return new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short' }).format(d)
    return new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(d)
  }

  const labels = allTimestamps.map(formatLabel)

  const datasets = props.meters.map(m => {
    const agg = aggregateSeries(m.series, props.duration)
    const map = new Map(agg.map((p:any)=>[p.timestamp, p.value]))
    return {
      label: m.name,
      data: allTimestamps.map(ts => map.has(ts) ? map.get(ts) : null),
      borderColor: m.color,
      backgroundColor: m.color,
      tension: 0.2,
      pointRadius: 2,
    }
  })

  const isDark = document.documentElement.classList.contains('dark')
  const textColor = isDark ? '#d1d5db' : '#374151'

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    parsing: false,
    scales: {
      x: {
        type: 'category',
        ticks: { maxRotation: 0, color: textColor },
      },
      y: {
        beginAtZero: false,
        ticks: { color: textColor }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: isDark ? '#475569' : '#cbd5e1',
        borderWidth: 1,
        padding: 12
      },
      datalabels: {
        display: false
      }
    }
  }

  chartInstance = new ChartJS(ctx, {
    type: 'line',
    data: { labels, datasets },
    options,
  })
}

onMounted(() => initChart())

watch([() => props.meters, () => props.duration], () => initChart(), { deep: true })
</script>
