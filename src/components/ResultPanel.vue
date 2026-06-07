<script setup lang="ts">
import { computed } from 'vue'
import type { RoundResult, Activity } from '@/types'
import { CheckCircle, XCircle, TrendingUp, TrendingDown } from 'lucide-vue-next'

interface Props {
  result: RoundResult
  selectedActivities: Activity[]
}

const props = defineProps<Props>()

const isPositive = computed(() => props.result.totalReward >= 0)

function getActivityById(id: string): Activity | undefined {
  return props.selectedActivities.find(a => a.id === id)
}
</script>

<template>
  <div class="glass-card p-5 animate-slide-in">
    <div class="text-center mb-6">
      <h2 class="font-display text-2xl font-bold mb-2">
        第 {{ result.roundNumber }} 轮结算
      </h2>
      <div class="flex items-center justify-center gap-3">
        <component :is="isPositive ? TrendingUp : TrendingDown" 
                   class="w-6 h-6"
                   :style="{ color: isPositive ? '#00CEC9' : '#FF7675' }" />
        <span class="font-display text-4xl font-black"
              :class="isPositive ? 'text-gradient-gold' : ''"
              :style="{ color: isPositive ? '' : '#FF7675' }">
          {{ isPositive ? '+' : '' }}{{ result.totalReward }}
        </span>
      </div>
    </div>

    <div class="space-y-3 mb-6">
      <div v-for="(item, index) in result.results" :key="item.activityId"
           class="flex items-center gap-3 p-3 rounded-xl animate-slide-in"
           :style="{ background: 'rgba(255,255,255,0.05)', animationDelay: `${index * 100}ms` }">
        <component :is="item.success ? CheckCircle : XCircle"
                   class="w-6 h-6 flex-shrink-0"
                   :style="{ color: item.success ? '#00CEC9' : '#FF7675' }" />
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ getActivityById(item.activityId)?.icon }}</span>
            <span class="font-semibold">{{ getActivityById(item.activityId)?.name }}</span>
          </div>
          <div class="text-xs opacity-70 mt-1">
            实际概率: {{ (item.actualProbability * 100).toFixed(0) }}%
            <span v-if="item.queueWaitTime > 0" class="ml-2" style="color: #FF7675">
              排队损失: -{{ item.queueWaitTime }}
            </span>
          </div>
        </div>
        <div class="text-right font-bold"
             :style="{ color: item.reward >= 0 ? '#00CEC9' : '#FF7675' }">
          {{ item.reward >= 0 ? '+' : '' }}{{ item.reward }}
        </div>
      </div>
    </div>

    <div class="p-4 rounded-xl" :style="{ background: 'rgba(108, 92, 231, 0.15)' }">
      <h3 class="font-semibold mb-2">📜 结算员报告</h3>
      <ul class="text-sm space-y-1 opacity-80">
        <li v-for="(event, i) in result.events" :key="i">• {{ event }}</li>
      </ul>
    </div>
  </div>
</template>
