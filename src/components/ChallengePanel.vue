<script setup lang="ts">
import type { ChallengeTarget } from '@/types'
import { Target, Trophy, CheckCircle2, Star } from 'lucide-vue-next'

interface Props {
  challenges: ChallengeTarget[]
  challengeBonus: number
}

const props = defineProps<Props>()

function getProgressPercent(current: number, target: number): number {
  return Math.min(100, (current / target) * 100)
}

function getProgressStyle(challenge: ChallengeTarget): Record<string, string> {
  const width = getProgressPercent(challenge.current, challenge.target) + '%'
  const background = challenge.completed
    ? 'linear-gradient(90deg, #00CEC9, #6C5CE7)'
    : 'linear-gradient(90deg, #FDCB6E, #FF7675)'
  return { width, background }
}

function getChallengeIcon(type: string): string {
  const icons: Record<string, string> = {
    consecutive_low_risk: '🛡️',
    high_crowd_profit: '🏆',
    single_round_reward: '💎',
    total_high_risk: '🔥',
    perfect_rounds: '⭐',
    no_failure_streak: '✨',
    specific_activity: '🎯',
    queue_length_strategy: '⏰'
  }
  return icons[type] || '🎯'
}
</script>

<template>
  <div class="glass-card p-5">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <Target class="w-5 h-5" :style="{ color: '#FDCB6E' }" />
        <h2 class="font-display font-bold text-lg">策略挑战</h2>
      </div>
      <div v-if="challengeBonus > 0" 
           class="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold"
           :style="{ background: 'rgba(253, 203, 110, 0.2)', color: '#FDCB6E' }">
        <Star class="w-3 h-3" />
        <span>+{{ challengeBonus }}</span>
      </div>
    </div>

    <p class="text-sm opacity-70 mb-4">
      完成挑战目标可获得额外分数奖励！
    </p>

    <div class="space-y-3">
      <div
        v-for="challenge in challenges"
        :key="challenge.id"
        class="p-3 rounded-xl transition-all duration-300"
        :class="challenge.completed ? 'challenge-completed' : ''"
        :style="{
          background: challenge.completed 
            ? 'linear-gradient(135deg, rgba(0, 206, 201, 0.15), rgba(108, 92, 231, 0.1))'
            : 'rgba(255,255,255,0.05)'
        }"
      >
        <div class="flex items-start gap-3">
          <div 
            class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
            :style="{
              background: challenge.completed 
                ? 'linear-gradient(135deg, rgba(0, 206, 201, 0.3), rgba(108, 92, 231, 0.2))'
                : 'rgba(255,255,255,0.08)'
            }"
          >
            <span v-if="!challenge.completed">{{ getChallengeIcon(challenge.type) }}</span>
            <CheckCircle2 v-else class="w-5 h-5" :style="{ color: '#00CEC9' }" />
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2 mb-1">
              <h3 class="font-semibold text-sm truncate"
                  :class="{ 'line-through opacity-60': challenge.completed }">
                {{ challenge.title }}
              </h3>
              <div class="flex items-center gap-1 flex-shrink-0">
                <span class="text-xs font-bold"
                      :style="{ color: challenge.completed ? '#00CEC9' : '#FDCB6E' }">
                  +{{ challenge.bonus }}
                </span>
                <Trophy class="w-3 h-3" :style="{ color: '#FDCB6E' }" />
              </div>
            </div>
            
            <p class="text-xs opacity-60 mb-2 line-clamp-2">
              {{ challenge.description }}
            </p>
            
            <div class="flex items-center gap-2">
              <div class="flex-1 h-1.5 rounded-full overflow-hidden"
                   :style="{ background: 'rgba(255,255,255,0.1)' }">
                <div 
                  class="h-full rounded-full transition-all duration-500"
                  :style="getProgressStyle(challenge)"
                />
              </div>
              <span class="text-xs font-mono opacity-70 flex-shrink-0">
                {{ challenge.progressText }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.challenge-completed {
  animation: challenge-complete 0.5s ease-out;
}

@keyframes challenge-complete {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
