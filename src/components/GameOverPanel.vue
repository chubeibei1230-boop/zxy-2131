<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ChallengeTarget } from '@/types'
import { Trophy, Star, RotateCcw, Target, CheckCircle2, XCircle, FileText, RefreshCw, AlertCircle } from 'lucide-vue-next'

interface Props {
  totalScore: number
  maxRounds: number
  challenges?: ChallengeTarget[]
  challengeBonus?: number
  hasAchievement?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  newGame: []
  viewAchievement: []
  generateAchievement: []
}>()

const isGenerating = ref(false)

async function handleGenerate() {
  isGenerating.value = true
  emit('generateAchievement')
  setTimeout(() => {
    isGenerating.value = false
  }, 1000)
}

const rank = computed(() => {
  if (props.totalScore >= 2000) return { title: '传奇大师', stars: 5, color: '#FDCB6E' }
  if (props.totalScore >= 1500) return { title: '概率专家', stars: 4, color: '#A29BFE' }
  if (props.totalScore >= 1000) return { title: '策略达人', stars: 3, color: '#00CEC9' }
  if (props.totalScore >= 500) return { title: '初级玩家', stars: 2, color: '#74B9FF' }
  return { title: '新手上路', stars: 1, color: '#B2BEC3' }
})

const completedChallenges = computed(() => {
  if (!props.challenges) return []
  return props.challenges.filter(c => c.completed)
})

const totalChallengeBonus = computed(() => {
  return props.challengeBonus || 0
})
</script>

<template>
  <div class="glass-card p-8 text-center animate-slide-in">
    <div class="mb-6">
      <div class="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 animate-pulse-glow"
           :style="{ background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)' }">
        <Trophy class="w-10 h-10" :style="{ color: '#FDCB6E' }" />
      </div>
      <h2 class="font-display text-3xl font-black mb-2">游戏结束!</h2>
      <p class="opacity-70">完成了 {{ maxRounds }} 轮挑战</p>
    </div>

    <div class="mb-6 p-6 rounded-2xl" 
         :style="{ background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.2), rgba(253, 203, 110, 0.1))' }">
      <div class="text-sm opacity-70 mb-2">最终得分</div>
      <div class="font-display text-5xl font-black text-gradient-gold mb-3">
        {{ totalScore }}
      </div>
      <div class="flex items-center justify-center gap-1 mb-2">
        <Star v-for="i in 5" :key="i" 
              class="w-5 h-5"
              :fill="i <= rank.stars ? rank.color : 'transparent'"
              :style="{ color: i <= rank.stars ? rank.color : 'rgba(255,255,255,0.2)' }" />
      </div>
      <div class="font-bold text-lg" :style="{ color: rank.color }">
        {{ rank.title }}
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="p-3 rounded-xl" :style="{ background: 'rgba(255,255,255,0.05)' }">
        <div class="text-2xl mb-1">🎯</div>
        <div class="text-xs opacity-70">总轮次</div>
        <div class="font-display font-bold">{{ maxRounds }}</div>
      </div>
      <div class="p-3 rounded-xl" :style="{ background: 'rgba(255,255,255,0.05)' }">
        <div class="text-2xl mb-1">💎</div>
        <div class="text-xs opacity-70">评级</div>
        <div class="font-display font-bold">{{ rank.stars }}星</div>
      </div>
      <div class="p-3 rounded-xl" :style="{ background: 'rgba(255,255,255,0.05)' }">
        <div class="text-2xl mb-1">📊</div>
        <div class="text-xs opacity-70">平均分</div>
        <div class="font-display font-bold">{{ Math.round(totalScore / maxRounds) }}</div>
      </div>
    </div>

    <div v-if="challenges && challenges.length > 0" class="mb-6">
      <div class="flex items-center justify-center gap-2 mb-3">
        <Target class="w-4 h-4" :style="{ color: '#FDCB6E' }" />
        <h3 class="font-display font-bold">策略挑战完成情况</h3>
        <span class="text-xs px-2 py-0.5 rounded-full"
              :style="{ background: 'rgba(253, 203, 110, 0.2)', color: '#FDCB6E' }">
          {{ completedChallenges.length }}/{{ challenges.length }}
        </span>
      </div>
      
      <div class="p-4 rounded-xl text-left space-y-2"
           :style="{ background: 'rgba(255,255,255,0.05)' }">
        <div v-for="challenge in challenges" :key="challenge.id"
             class="flex items-center gap-3">
          <component :is="challenge.completed ? CheckCircle2 : XCircle"
                     class="w-4 h-4 flex-shrink-0"
                     :style="{ color: challenge.completed ? '#00CEC9' : '#FF7675' }" />
          <span class="text-sm flex-1"
                :class="{ 'opacity-50 line-through': !challenge.completed }">
            {{ challenge.title }}
          </span>
          <span class="text-xs font-bold"
                :style="{ color: challenge.completed ? '#00CEC9' : '#B2BEC3' }">
            {{ challenge.completed ? '+' + challenge.bonus : '未完成' }}
          </span>
        </div>
        
        <div v-if="totalChallengeBonus > 0" 
             class="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <span class="text-sm opacity-70">挑战奖励合计</span>
          <span class="font-display font-bold text-gradient-gold">+{{ totalChallengeBonus }}</span>
        </div>
      </div>
    </div>

    <div v-if="hasAchievement" class="mb-3">
      <button class="btn-secondary w-full flex items-center justify-center gap-2"
              @click="emit('viewAchievement')">
        <FileText class="w-5 h-5" />
        <span>查看成就档案</span>
      </button>
    </div>

    <div v-else class="mb-3">
      <div class="p-3 rounded-xl mb-3 flex items-center gap-3"
           :style="{ background: 'rgba(253, 203, 110, 0.1)', border: '1px solid rgba(253, 203, 110, 0.2)' }">
        <AlertCircle class="w-5 h-5 flex-shrink-0" :style="{ color: '#FDCB6E' }" />
        <p class="text-xs opacity-80">
          成就档案尚未生成，点击下方按钮手动生成
        </p>
      </div>
      <button class="btn-secondary w-full flex items-center justify-center gap-2"
              :disabled="isGenerating"
              @click="handleGenerate">
        <RefreshCw class="w-5 h-5" :class="{ 'animate-spin': isGenerating }" />
        <span>{{ isGenerating ? '生成中...' : '生成成就档案' }}</span>
      </button>
    </div>

    <button class="btn-primary w-full flex items-center justify-center gap-2"
            @click="emit('newGame')">
      <RotateCcw class="w-5 h-5" />
      <span>再来一局</span>
    </button>
  </div>
</template>
