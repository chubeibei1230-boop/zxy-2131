<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Trophy, Users, Gift, Target } from 'lucide-vue-next'

interface Props {
  totalScore: number
  currentRound: number
  maxRounds: number
  queueLength: number
  rewardPool: number
  selectedCount: number
  maxSelected: number
}

const props = defineProps<Props>()

const displayScore = ref(0)
const isAnimating = ref(false)

function animateScore(from: number, to: number) {
  isAnimating.value = true
  const diff = to - from
  const steps = 20
  const stepValue = diff / steps
  let current = from
  let step = 0
  
  const animate = () => {
    step++
    current += stepValue
    displayScore.value = Math.round(current)
    
    if (step < steps) {
      requestAnimationFrame(animate)
    } else {
      displayScore.value = to
      setTimeout(() => {
        isAnimating.value = false
      }, 200)
    }
  }
  
  requestAnimationFrame(animate)
}

onMounted(() => {
  displayScore.value = props.totalScore
})

watch(() => props.totalScore, (newVal, oldVal) => {
  if (oldVal !== undefined && newVal !== oldVal) {
    animateScore(oldVal, newVal)
  } else {
    displayScore.value = newVal
  }
})
</script>

<template>
  <div class="glass-card p-5">
    <div class="grid grid-cols-2 gap-4">
      <div class="col-span-2 text-center p-4 rounded-xl" 
           :style="{ background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.2), rgba(253, 203, 110, 0.1))' }">
        <div class="flex items-center justify-center gap-2 mb-2">
          <Trophy class="w-5 h-5" :style="{ color: '#FDCB6E' }" />
          <span class="text-sm opacity-70">总分数</span>
        </div>
        <div class="font-display text-4xl font-black text-gradient-gold"
             :class="{ 'animate-score-pop': isAnimating }">
          {{ displayScore }}
        </div>
      </div>

      <div class="p-3 rounded-xl" :style="{ background: 'rgba(255,255,255,0.05)' }">
        <div class="flex items-center gap-2 mb-1">
          <Target class="w-4 h-4" :style="{ color: '#A29BFE' }" />
          <span class="text-xs opacity-70">当前轮次</span>
        </div>
        <div class="font-display text-xl font-bold">
          {{ currentRound }} <span class="text-sm opacity-50">/ {{ maxRounds }}</span>
        </div>
      </div>

      <div class="p-3 rounded-xl" :style="{ background: 'rgba(255,255,255,0.05)' }">
        <div class="flex items-center gap-2 mb-1">
          <Gift class="w-4 h-4" :style="{ color: '#FDCB6E' }" />
          <span class="text-xs opacity-70">奖池加成</span>
        </div>
        <div class="font-display text-xl font-bold text-gradient-gold">
          +{{ rewardPool }}
        </div>
      </div>

      <div class="p-3 rounded-xl" :style="{ background: 'rgba(255,255,255,0.05)' }">
        <div class="flex items-center gap-2 mb-1">
          <Users class="w-4 h-4" :style="{ color: '#74B9FF' }" />
          <span class="text-xs opacity-70">排队人数</span>
        </div>
        <div class="font-display text-xl font-bold">
          {{ queueLength }} <span class="text-sm opacity-50">人</span>
        </div>
      </div>

      <div class="p-3 rounded-xl" :style="{ background: 'rgba(255,255,255,0.05)' }">
        <div class="flex items-center gap-2 mb-1">
          <Target class="w-4 h-4" :style="{ color: '#00CEC9' }" />
          <span class="text-xs opacity-70">已选项目</span>
        </div>
        <div class="font-display text-xl font-bold">
          {{ selectedCount }} <span class="text-sm opacity-50">/ {{ maxSelected }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
