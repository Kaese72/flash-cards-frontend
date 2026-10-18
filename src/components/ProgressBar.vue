<script setup>
import { computed } from 'vue'

const props = defineProps({
  // { correct, wrong, unseen }
  stats: { type: Object, required: true },
})

const total = computed(() => props.stats.correct + props.stats.wrong + props.stats.unseen)

function pct(n) {
  return total.value ? `${(n / total.value) * 100}%` : '0%'
}
</script>

<template>
  <div class="progress">
    <div
      class="bar"
      role="img"
      :aria-label="`${stats.correct} right, ${stats.wrong} wrong, ${stats.unseen} not seen yet`"
    >
      <div class="segment correct" :style="{ width: pct(stats.correct) }" />
      <div class="segment wrong" :style="{ width: pct(stats.wrong) }" />
      <div class="segment unseen" :style="{ width: pct(stats.unseen) }" />
    </div>
    <div class="legend">
      <span><i class="dot correct" />{{ stats.correct }} right</span>
      <span><i class="dot wrong" />{{ stats.wrong }} wrong</span>
      <span><i class="dot unseen" />{{ stats.unseen }} not seen</span>
    </div>
  </div>
</template>

<style scoped>
.progress {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bar {
  display: flex;
  height: 12px;
  border-radius: 6px;
  overflow: hidden;
  background: #e4e4e7;
}

.segment {
  transition: width 0.4s ease;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 1.25rem;
  font-size: 0.85rem;
  color: #555;
}

.legend span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.correct {
  background: #2e7d32;
}

.wrong {
  background: #c62828;
}

.unseen {
  background: #d4d4d8;
}
</style>
