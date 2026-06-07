<script setup lang="ts">
import type { PartialAchievementProgress } from '@/types'
import { 
  BarChart3, Target, TrendingUp, Activity, Tag, Star, ChevronDown, ChevronUp
} from 'lucide-vue-next'
import { ref } from 'vue'

interface Props {
  progress: PartialAchievementProgress | null
}

const props = defineProps<Props>()
const expanded = ref(false)
</script>

<template>
  <div class="glass-card p-4">
    <div class="flex items-center justify-between mb-3 cursor-pointer"
         @click="expanded = !expanded">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center"
             :style="{ background: 'linear-gradient(135deg, rgba(253, 203, 110, 0.3), rgba(253, 203, 110, 0.1))' }">
          <BarChart3 class="w-4 h-4" :style="{ color: '#FDCB6E' }" />
        </div>
        <div>
          <h3 class="font-display font-bold text-sm">赛季成就进度</h3>
          <p class="text-xs opacity-60">
            第 {{ progress?.currentRound || 0 }}/{{ progress?.totalRounds || 10 }} 轮
          </p>
        </div>
      </div>
      <component :is="expanded ? ChevronUp : ChevronDown" class="w-4 h-4 opacity-50" />
    </div>

    <div v-if="progress">
      <div class="mb-3">
        <div class="progress-bar">
          <div class="progress-fill" 
               :style="{ 
                 width: (progress.currentRound / progress.totalRounds * 100) + '%',
                 background: 'linear-gradient(90deg, #6C5CE7, #A29BFE)'
               }" />
        </div>
      </div>

      <div class="flex items-center justify-between p-3 rounded-lg mb-3"
           :style="{ background: 'rgba(255,255,255,0.05)' }">
        <div>
          <div class="text-xs opacity-60 mb-0.5">当前得分</div>
          <div class="font-display font-bold text-lg">{{ progress.currentScore }}</div>
        </div>
        <div class="text-right">
          <div class="text-xs opacity-60 mb-0.5">预计评级</div>
          <div class="flex items-center gap-1 justify-end">
            <Star v-for="i in 5" :key="i" 
                  class="w-3.5 h-3.5"
                  :fill="i <= progress.projectedRank.stars ? progress.projectedRank.color : 'transparent'"
                  :style="{ color: i <= progress.projectedRank.stars ? progress.projectedRank.color : 'rgba(255,255,255,0.2)' }" />
          </div>
          <div class="text-xs font-medium mt-0.5" :style="{ color: progress.projectedRank.color }">
            {{ progress.projectedRank.title }}
          </div>
        </div>
      </div>

      <div v-show="expanded" class="space-y-3 animate-slide-in">
        <div class="grid grid-cols-2 gap-2">
          <div class="p-2.5 rounded-lg" :style="{ background: 'rgba(255,255,255,0.05)' }">
            <div class="flex items-center gap-1.5 mb-1.5">
              <Target class="w-3.5 h-3.5" :style="{ color: '#FDCB6E' }" />
              <span class="text-xs opacity-70">挑战进度</span>
            </div>
            <div class="font-display font-bold text-sm">
              {{ progress.challengesProgress.completed }}/{{ progress.challengesProgress.total }}
            </div>
            <div v-if="progress.challengesProgress.inProgress > 0" class="text-[10px] opacity-50">
              {{ progress.challengesProgress.inProgress }} 个进行中
            </div>
          </div>

          <div class="p-2.5 rounded-lg" :style="{ background: 'rgba(255,255,255,0.05)' }">
            <div class="flex items-center gap-1.5 mb-1.5">
              <TrendingUp class="w-3.5 h-3.5" :style="{ color: '#00CEC9' }" />
              <span class="text-xs opacity-70">最高单轮</span>
            </div>
            <div class="font-display font-bold text-sm" style="color: #00CEC9">
              {{ progress.currentHighestProfitRound.roundNumber > 0 ? '+' + progress.currentHighestProfitRound.profit : '--' }}
            </div>
            <div v-if="progress.currentHighestProfitRound.roundNumber > 0" class="text-[10px] opacity-50">
              第 {{ progress.currentHighestProfitRound.roundNumber }} 轮
            </div>
          </div>
        </div>

        <div class="p-2.5 rounded-lg" :style="{ background: 'rgba(255,255,255,0.05)' }">
          <div class="flex items-center gap-1.5 mb-2">
            <Tag class="w-3.5 h-3.5" :style="{ color: '#A29BFE' }" />
            <span class="text-xs opacity-70">涌现标签</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="(tag, i) in progress.emergingTags" :key="i"
                  class="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  :style="{ 
                    background: 'rgba(162, 155, 254, 0.15)',
                    color: '#A29BFE'
                  }">
              {{ tag }}
            </span>
            <span v-if="progress.emergingTags.length === 0" class="text-[10px] opacity-40">
              更多数据后显现
            </span>
          </div>
        </div>

        <div class="p-2.5 rounded-lg" :style="{ background: 'rgba(255,255,255,0.05)' }">
          <div class="flex items-center gap-1.5 mb-2">
            <Activity class="w-3.5 h-3.5" :style="{ color: '#74B9FF' }" />
            <span class="text-xs opacity-70">活动偏好</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="(type, i) in progress.currentPreferredTypes.slice(0, 2)" :key="i"
                  class="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  :style="{ 
                    background: 'rgba(116, 185, 255, 0.15)',
                    color: '#74B9FF'
                  }">
              {{ type.category }} × {{ type.count }}
            </span>
            <span v-if="progress.currentPreferredTypes.length === 0" class="text-[10px] opacity-40">
              尚未统计
            </span>
          </div>
        </div>

        <div class="text-[10px] text-center opacity-40 pt-1">
          游戏结束后生成完整成就档案
        </div>
      </div>
    </div>

    <div v-else class="text-center py-4">
      <p class="text-xs opacity-50">完成第一轮后显示进度</p>
    </div>
  </div>
</template>
