<template>
  <div>
    <div class="mb-2 flex items-center justify-between">
      <div class="font-semibold">{{ title }}</div>
      <div class="text-sm text-gray-500">{{ subtitle }}</div>
    </div>
    <div style="height: 320px;">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { Chart, CategoryScale, LinearScale, BarElement, BarController, Tooltip, Legend } from 'chart.js'

Chart.register(CategoryScale, LinearScale, BarElement, BarController, Tooltip, Legend)

const props = defineProps<{
  labels: string[]
  data: number[]
  color: string
  title?: string
  subtitle?: string
  highlightIndex?: number
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const init = () => {
  if (!canvasRef.value) return
  if (chart) chart.destroy()
  const ctx = canvasRef.value.getContext('2d')
  chart = new Chart(ctx as CanvasRenderingContext2D, {
    type: 'bar',
    data: {
      labels: props.labels,
      datasets: [{
        data: props.data,
        backgroundColor: props.labels.map((_,i)=> i===props.highlightIndex ? shadeColor(props.color, -15) : props.color),
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } },
      plugins: { legend: { display: false } }
    }
  })
}

function shadeColor(col:string, percent:number){
  try{
    const c = col.replace('#','')
    const num = parseInt(c,16)
    const r = Math.min(255, Math.max(0, (num >> 16) + percent))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent))
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent))
    return `rgb(${r},${g},${b})`
  }catch{ return col }
}

onMounted(init)
watch([() => props.labels, () => props.data, () => props.color, () => props.highlightIndex], () => init(), { deep:true })
onBeforeUnmount(()=>{ if (chart) chart.destroy() })
</script>
