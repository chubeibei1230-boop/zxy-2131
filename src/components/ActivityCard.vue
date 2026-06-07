<script setup lang="ts">
import { computed } from 'vue'
import type { Activity, ProbabilityHint } from '@/types'
import { calculateActualProbability, calculateActualReward, calculateQueuePenalty } from '@/engine/probability'

interface Props {
  activity: Activity
  selected: boolean
  hints: ProbabilityHint[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  toggle: [activity: Activity]
}>()

const actualProbability = computed(() => 
  calculateActualProbability(props.activity.baseProbability, props.hints, props.activity.id)
)

const actualReward = computed(() => 
  calculateActualReward(props.activity.baseReward, props.hints, props.activity.id)
)

const queuePenalty = computed(() => 
  calculateQueuePenalty(props.hints, props.activity.id)
)

const probabilityColor = computed(() => {
  const p = actualProbability.value
  if (p >= 0.7) return 'linear-gradient(90deg, #00CEC9, #81ECEC)'
  if (p >= 0.4) return 'linear-gradient(90deg, #FDCB6E, #F39C12)'
  return 'linear-gradient(90deg, #FF7675, #D63031)'
})

const riskDots = computed(() => {
  return Array(3).fill(0).map((_, i) => i < props.activity.riskLevel)
})

const affectedByHint = computed(() => {
  return props.hints.some(h => h.impact.activityId === props.activity.id)
})
</script>

<template>
  <div
    class="activity-card glass-card p-5 relative"
    :class="{ selected }"
    @click="emit('toggle', activity)"
  >
    <div v-if="affectedByHint" class="absolute -top-2 -right-2 px-2 py-1 text-xs rounded-full"
         :style="{ background: 'var(--color-accent-cyan)' }">
      有影响
    </div>

    <div class="flex items-start gap-3 mb-3">
      <span class="text-3xl">{{ activity.icon }}</span>
      <div class="flex-1">
        <h3 class="font-bold text-lg">{{ activity.name }}</h3>
        <p class="text-sm opacity-70">{{ activity.description }}</p>
      </div>
    </div>

    <div class="space-y-3">
      <div>
        <div class="flex justify-between text-sm mb-1">
          <span class="opacity-70">成功率</span>
          <span class="font-semibold">{{ (actualProbability * 100).toFixed(0) }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" 
               :style="{ width: `${actualProbability * 100}%`, background: probabilityColor }"></div>
        </div>
      </div>

      <div class="flex justify-between items-center">
        <div>
          <span class="text-sm opacity-70">预期奖励</span>
          <div class="text-xl font-bold text-gradient-gold">
            +{{ actualReward }}
          </div>
        </div>
        <div class="text-right">
          <span class="text-sm opacity-70">风险等级</span>
          <div class="flex gap-1 mt-1">
            <span v-for="(active, i) in riskDots" :key="i"
                  class="w-2 h-2 rounded-full"
                  :style="{ background: active ? '#FF7675' : 'rgba(255,255,255,0.2)' }"></span>
          </div>
        </div>
      </div>

      <div v-if="queuePenalty > 0" class="text-sm text-center py-1 rounded"
           :style="{ background: 'rgba(255, 118, 117, 0.2)', color: '#FF7675' }">
        排队成本: -{{ queuePenalty }} 分
      </div>
    </div>

    <div v-if="selected" class="absolute inset-0 rounded-2xl pointer-events-none"
         :style="{ border: '2px solid var(--color-primary-light)', boxSizing: 'border-box' }"></div>
  </div>
</template>
