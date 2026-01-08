<template>
  <div class="w-full select-none">
    <!-- Slider Container -->
    <div class="relative h-12 flex items-center">
      <!-- Background Track -->
      <div class="absolute left-0 right-0 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full top-1/2 -translate-y-1/2" />

      <!-- Active Range Track -->
      <div
        class="absolute h-1.5 rounded-full top-1/2 -translate-y-1/2 transition-all duration-75"
        :style="{
          left: `${(Math.min(modelValue.start, modelValue.end) / max) * 100}%`,
          right: `${100 - (Math.max(modelValue.start, modelValue.end) / max) * 100}%`,
          backgroundColor: thumbColor || '#3b82f6',
        }"
      />

      <!-- Start Thumb -->
      <input
        type="range"
        :min="0"
        :max="max"
        :value="modelValue.start"
        @input="updateStart"
        class="absolute w-full h-1.5 top-1/2 -translate-y-1/2 appearance-none bg-transparent rounded-full pointer-events-none z-5 thumb-input"
        :style="{ '--thumb-color': thumbColor || '#3b82f6' }"
      />

      <!-- End Thumb -->
      <input
        type="range"
        :min="0"
        :max="max"
        :value="modelValue.end"
        @input="updateEnd"
        class="absolute w-full h-1.5 top-1/2 -translate-y-1/2 appearance-none bg-transparent rounded-full pointer-events-none z-4 thumb-input"
        :style="{ '--thumb-color': thumbColor || '#3b82f6' }"
      />
    </div>

    <!-- Value Labels -->
    <div class="flex justify-between mt-3 px-0 text-xs font-semibold text-gray-700 dark:text-gray-300">
      <span class="bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded border border-gray-200 dark:border-slate-700">
        {{ modelValue.start }}
      </span>
      <span class="bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded border border-gray-200 dark:border-slate-700">
        {{ modelValue.end }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface RangeValue {
  start: number
  end: number
}

interface Props {
  modelValue: RangeValue
  max: number
  thumbColor?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: RangeValue]
}>()

const updateStart = (e: Event) => {
  const val = Number((e.target as HTMLInputElement).value)
  const end = props.modelValue.end
  if (val <= end) {
    emit('update:modelValue', { start: val, end })
  } else {
    emit('update:modelValue', { start: end, end: val })
  }
}

const updateEnd = (e: Event) => {
  const val = Number((e.target as HTMLInputElement).value)
  const start = props.modelValue.start
  if (val >= start) {
    emit('update:modelValue', { start, end: val })
  } else {
    emit('update:modelValue', { start: val, end: start })
  }
}
</script>

<style scoped>
/* Webkit browsers (Chrome, Safari, Edge) */
input.thumb-input[type='range']::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--thumb-color);
  cursor: grab;
  pointer-events: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.3);
  border: 2.5px solid white;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

input.thumb-input[type='range']::-webkit-slider-thumb:hover {
  width: 22px;
  height: 22px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.3);
  cursor: grabbing;
}

input.thumb-input[type='range']::-webkit-slider-thumb:active {
  width: 24px;
  height: 24px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Firefox */
input.thumb-input[type='range']::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--thumb-color);
  cursor: grab;
  pointer-events: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.3);
  border: 2.5px solid white;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

input.thumb-input[type='range']::-moz-range-thumb:hover {
  width: 22px;
  height: 22px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.3);
  cursor: grabbing;
}

input.thumb-input[type='range']::-moz-range-thumb:active {
  width: 24px;
  height: 24px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Hide track in Firefox */
input.thumb-input[type='range']::-moz-range-track {
  background: transparent;
  border: none;
}

input.thumb-input[type='range']::-moz-range-progress {
  background: transparent;
}
</style>
