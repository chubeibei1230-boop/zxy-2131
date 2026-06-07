<script setup lang="ts">
import type { ProbabilityHint, Activity } from '@/types'
import { Lightbulb } from 'lucide-vue-next'

interface Props {
  hints: ProbabilityHint[]
  activities: Activity[]
}

const props = defineProps<Props>()

function getHintIcon(type: string): string {
  switch (type) {
    case 'crowd': return '👥'
    case 'reward': return '🎁'
    case 'luck': return '🍀'
    case 'queue': return '⏰'
    default: return '💡'
  }
}

function getActivityName(activityId?: string): string {
  if (!activityId) return ''
  const activity = props.activities.find(a => a.id === activityId)
  return activity ? activity.name : ''
}

function getHintTypeColor(type: string): string {
  switch (type) {
    case 'crowd': return '#FF7675'
    case 'reward': return '#FDCB6E'
    case 'luck': return '#00CEC9'
    case 'queue': return '#74B9FF'
    default: return '#6C5CE7'
  }
}
</script>

<template>
  <div class="glass-card p-5">
    <div class="flex items-center gap-2 mb-4">
      <Lightbulb class="w-5 h-5" :style="{ color: '#FDCB6E' }" />
      <h2 class="font-display font-bold text-lg">提示员情报</h2>
    </div>
    
    <p class="text-sm opacity-70 mb-4">
      每轮开始前，提示员会收集到一些情报。合理利用这些线索可以帮助你做出更好的决策。
    </p>

    <div class="space-y-3">
      <div v-for="hint in hints" :key="hint.id" 
           class="p-3 rounded-xl animate-slide-in"
           :style="{ background: 'rgba(255,255,255,0.05)', borderLeft: `3px solid ${getHintTypeColor(hint.type)}` }">
        <div class="flex items-start gap-3">
          <span class="text-2xl">{{ getHintIcon(hint.type) }}</span>
          <div class="flex-1">
            <h3 class="font-semibold text-sm">{{ hint.title }}</h3>
            <p class="text-xs opacity-70 mt-1">{{ hint.description }}</p>
            <p v-if="hint.impact.activityId" class="text-xs mt-2 font-medium"
               :style="{ color: getHintTypeColor(hint.type) }">
              影响: {{ getActivityName(hint.impact.activityId) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 pt-4 border-t border-white/10">
      <div class="flex items-center gap-4 text-xs opacity-60">
        <div class="flex items-center gap-1">
          <span>👥</span><span>人数波动</span>
        </div>
        <div class="flex items-center gap-1">
          <span>🎁</span><span>奖励加成</span>
        </div>
        <div class="flex items-center gap-1">
          <span>🍀</span><span>幸运加成</span>
        </div>
        <div class="flex items-center gap-1">
          <span>⏰</span><span>排队影响</span>
        </div>
      </div>
    </div>
  </div>
</template>
