<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
      <span>{{ $t('current.rangeSlider.start') }}: {{ modelValue.start }}</span>
      <span>{{ $t('current.rangeSlider.end') }}: {{ modelValue.end }}</span>
    </div>
    <div class="relative h-2 bg-gray-200 dark:bg-slate-700 rounded-full">
      <!-- Selected Range Background -->
      <div
        class="absolute h-2 rounded-full transition-all"
        :style="{
          left: `${(modelValue.start / max) * 100}%`,
          width: `${((modelValue.end - modelValue.start) / max) * 100}%`,
          backgroundColor: thumbColor
        }"
      />

      <!-- Start Thumb -->
      <input
        type="range"
        :min="0"
        :max="max"
        :value="modelValue.start"
        @input="onStartChange"
        class="absolute w-full h-2 appearance-none bg-transparent pointer-events-auto cursor-pointer range-thumb"
        :style="{ '--thumb-color': thumbColor }"
      />

      <!-- End Thumb -->
      <input
        type="range"
        :min="0"
        :max="max"
        :value="modelValue.end"
        @input="onEndChange"
        class="absolute w-full h-2 appearance-none bg-transparent pointer-events-auto cursor-pointer range-thumb"
        :style="{ '--thumb-color': thumbColor }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: { start: number; end: number }
  max: number
  thumbColor: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: { start: number; end: number }]
}>()

const onStartChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newStart = parseInt(target.value)
  const newValue = {
    start: Math.min(newStart, props.modelValue.end),
    end: props.modelValue.end
  }
  emit('update:modelValue', newValue)
}

const onEndChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newEnd = parseInt(target.value)
  const newValue = {
    start: props.modelValue.start,
    end: Math.max(newEnd, props.modelValue.start)
  }
  emit('update:modelValue', newValue)
}
</script>

<style scoped>
.range-thumb::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--thumb-color);
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.range-thumb::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--thumb-color);
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
