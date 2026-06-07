<script setup lang="ts">
import { computed } from 'vue'
import type { RoundResult, Activity, RoundChallengeUpdate } from '@/types'
import { CheckCircle, XCircle, TrendingUp, TrendingDown, Target } from 'lucide-vue-next'

interface Props {
  result: RoundResult
  selectedActivities: Activity[]
  challengeUpdates?: RoundChallengeUpdate
}

const props = defineProps<Props>()

const isPositive = computed(() => props.result.totalReward >= 0)

const hasChallengeUpdates = computed(() => {
  if (!props.challengeUpdates) return false
  return props.challengeUpdates.challengeUpdates.some(
    u => u.completed || u.newProgress > u.previousProgress
  )
})

const completedChallenges = computed(() => {
  if (!props.challengeUpdates) return []
  return props.challengeUpdates.challengeUpdates.filter(u => u.completed)
})

const progressedChallenges = computed(() => {
  if (!props.challengeUpdates) return []
  return props.challengeUpdates.challengeUpdates.filter(
    u => !u.completed && u.newProgress > u.previousProgress
  )
})

const totalChallengeBonus = computed(() => {
  if (!props.challengeUpdates) return 0
  return props.challengeUpdates.challengeUpdates.reduce((sum, u) => sum + u.bonusEarned, 0)
})

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

    <div v-if="hasChallengeUpdates" 
         class="p-4 rounded-xl mt-4"
         :style="{ background: 'linear-gradient(135deg, rgba(253, 203, 110, 0.15), rgba(255, 118, 117, 0.1))' }">
      <div class="flex items-center gap-2 mb-3">
        <Target class="w-4 h-4" :style="{ color: '#FDCB6E' }" />
        <h3 class="font-semibold">策略挑战更新</h3>
      </div>
      
      <div class="space-y-2">
        <div v-for="update in completedChallenges" :key="update.challengeId"
             class="text-sm p-2 rounded-lg"
             :style="{ background: 'rgba(0, 206, 201, 0.1)' }">
          <div class="flex items-center gap-2">
            <CheckCircle class="w-4 h-4 flex-shrink-0" :style="{ color: '#00CEC9' }" />
            <span class="font-semibold flex-1">{{ update.challengeTitle }}</span>
            <span class="font-bold text-gradient-gold">+{{ update.bonusEarned }}</span>
          </div>
          <p class="text-xs opacity-60 mt-1 ml-6">
            <span style="color: #00CEC9">挑战达成!</span> {{ update.challengeDescription }}
          </p>
        </div>
        
        <div v-for="update in progressedChallenges" :key="update.challengeId"
             class="text-sm p-2 rounded-lg"
             :style="{ background: 'rgba(253, 203, 110, 0.08)' }">
          <div class="flex items-center gap-2">
            <TrendingUp class="w-4 h-4 flex-shrink-0" :style="{ color: '#FDCB6E' }" />
            <span class="font-medium flex-1">{{ update.challengeTitle }}</span>
            <span class="text-xs opacity-70">
              {{ update.previousProgress }} → {{ update.newProgress }}
            </span>
          </div>
          <p class="text-xs opacity-50 mt-1 ml-6">
            {{ update.challengeDescription }}
          </p>
        </div>
      </div>
      
      <div v-if="totalChallengeBonus > 0" 
           class="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
        <span class="text-sm opacity-70">本轮挑战奖励</span>
        <span class="font-display font-bold text-xl text-gradient-gold">
          +{{ totalChallengeBonus }}
        </span>
      </div>
    </div>
  </div>
</template>
