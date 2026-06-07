<script setup lang="ts">
import { computed } from 'vue'
import { Trophy, Star, RotateCcw } from 'lucide-vue-next'

interface Props {
  totalScore: number
  maxRounds: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  newGame: []
}>()

const rank = computed(() => {
  if (props.totalScore >= 2000) return { title: '传奇大师', stars: 5, color: '#FDCB6E' }
  if (props.totalScore >= 1500) return { title: '概率专家', stars: 4, color: '#A29BFE' }
  if (props.totalScore >= 1000) return { title: '策略达人', stars: 3, color: '#00CEC9' }
  if (props.totalScore >= 500) return { title: '初级玩家', stars: 2, color: '#74B9FF' }
  return { title: '新手上路', stars: 1, color: '#B2BEC3' }
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

    <div class="grid grid-cols-3 gap-4 mb-8">
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

    <button class="btn-primary w-full flex items-center justify-center gap-2"
            @click="emit('newGame')">
      <RotateCcw class="w-5 h-5" />
      <span>再来一局</span>
    </button>
  </div>
</template>
