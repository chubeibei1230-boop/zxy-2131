<script setup lang="ts">
import { computed } from 'vue'
import type { AchievementProfile } from '@/types'
import { 
  Trophy, Star, Target, TrendingUp, Activity, 
  Tag, FileText, X, Award, BarChart3, Sparkles 
} from 'lucide-vue-next'

interface Props {
  profile: AchievementProfile | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const tendencyIcon = computed(() => {
  if (!props.profile) return TrendingUp
  switch (props.profile.tendency.type) {
    case 'success': return Award
    case 'failure': return Sparkles
    default: return BarChart3
  }
})

const tendencyColor = computed(() => {
  if (!props.profile) return '#B2BEC3'
  switch (props.profile.tendency.type) {
    case 'success': return '#00CEC9'
    case 'failure': return '#FDCB6E'
    default: return '#A29BFE'
  }
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
       @click.self="emit('close')">
    <div class="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin animate-slide-in">
      <div class="sticky top-0 z-10 p-5 pb-3 border-b border-white/10"
           :style="{ background: 'rgba(26, 26, 46, 0.95)', backdropFilter: 'blur(20px)' }">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                 :style="{ background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)' }">
              <Trophy class="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 class="font-display text-xl font-bold">赛季成就档案</h2>
              <p class="text-xs opacity-60">第 {{ profile?.sessionId.slice(0, 8) }} 号档案</p>
            </div>
          </div>
          <button class="btn-ghost p-2 rounded-lg" @click="emit('close')">
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div v-if="profile" class="p-5 space-y-5">
        <div class="p-6 rounded-2xl text-center"
             :style="{ background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.2), rgba(253, 203, 110, 0.1))' }">
          <div class="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 animate-pulse-glow"
               :style="{ background: `linear-gradient(135deg, ${profile.rank.color}40, ${profile.rank.color}20)` }">
            <Trophy class="w-10 h-10" :style="{ color: profile.rank.color }" />
          </div>
          <div class="text-sm opacity-70 mb-2">最终得分</div>
          <div class="font-display text-5xl font-black mb-3"
               :style="{ color: profile.rank.color }">
            {{ profile.totalScore }}
          </div>
          <div class="flex items-center justify-center gap-1 mb-2">
            <Star v-for="i in 5" :key="i" 
                  class="w-5 h-5"
                  :fill="i <= profile.rank.stars ? profile.rank.color : 'transparent'"
                  :style="{ color: i <= profile.rank.stars ? profile.rank.color : 'rgba(255,255,255,0.2)' }" />
          </div>
          <div class="font-bold text-lg" :style="{ color: profile.rank.color }">
            {{ profile.rank.title }}
          </div>
          <div class="text-xs opacity-50 mt-2">
            完成于 {{ new Date(profile.completedAt).toLocaleString() }}
          </div>
        </div>

        <div class="p-4 rounded-xl" :style="{ background: 'rgba(255,255,255,0.05)' }">
          <div class="flex items-center gap-2 mb-3">
            <FileText class="w-4 h-4" :style="{ color: '#A29BFE' }" />
            <h3 class="font-display font-bold text-sm">档案总结</h3>
          </div>
          <p class="text-sm leading-relaxed opacity-80">
            {{ profile.summary }}
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-4 rounded-xl" :style="{ background: 'rgba(255,255,255,0.05)' }">
            <div class="flex items-center gap-2 mb-3">
              <Target class="w-4 h-4" :style="{ color: '#FDCB6E' }" />
              <h3 class="font-display font-bold text-sm">挑战完成</h3>
            </div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-2xl font-display font-bold text-gradient-gold">
                {{ profile.challenges.completed }}/{{ profile.challenges.total }}
              </span>
              <span class="text-xs px-2 py-1 rounded-full"
                    :style="{ 
                      background: profile.challenges.completed === profile.challenges.total 
                        ? 'rgba(0, 206, 201, 0.2)' 
                        : 'rgba(253, 203, 110, 0.1)',
                      color: profile.challenges.completed === profile.challenges.total 
                        ? '#00CEC9' 
                        : '#FDCB6E'
                    }">
                +{{ profile.challenges.bonus }} 奖励
              </span>
            </div>
            <div class="space-y-2 max-h-32 overflow-y-auto scrollbar-thin">
              <div v-for="(challenge, i) in profile.challenges.list" :key="i"
                   class="flex items-center gap-2 text-xs">
                <div class="w-2 h-2 rounded-full flex-shrink-0"
                     :style="{ background: challenge.completed ? '#00CEC9' : '#FF7675' }" />
                <span class="flex-1 truncate" :class="{ 'opacity-50': !challenge.completed }">
                  {{ challenge.title }}
                </span>
                <span v-if="challenge.completed" class="font-bold" style="color: #00CEC9">
                  +{{ challenge.bonus }}
                </span>
              </div>
            </div>
          </div>

          <div class="p-4 rounded-xl" :style="{ background: 'rgba(255,255,255,0.05)' }">
            <div class="flex items-center gap-2 mb-3">
              <TrendingUp class="w-4 h-4" :style="{ color: '#00CEC9' }" />
              <h3 class="font-display font-bold text-sm">最高收益轮次</h3>
            </div>
            <div class="text-center py-3">
              <div class="text-xs opacity-60 mb-1">第 {{ profile.highestProfitRound.roundNumber }} 轮</div>
              <div class="text-3xl font-display font-black" style="color: #00CEC9">
                +{{ profile.highestProfitRound.profit }}
              </div>
              <div class="text-xs opacity-50 mt-1">分</div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-4 rounded-xl" :style="{ background: 'rgba(255,255,255,0.05)' }">
            <div class="flex items-center gap-2 mb-3">
              <component :is="tendencyIcon" class="w-4 h-4" :style="{ color: tendencyColor }" />
              <h3 class="font-display font-bold text-sm">表现倾向</h3>
            </div>
            <div class="text-center py-2">
              <div class="text-lg font-bold mb-1" :style="{ color: tendencyColor }">
                {{ profile.tendency.label }}
              </div>
              <p class="text-xs opacity-60 leading-relaxed">
                {{ profile.tendency.description }}
              </p>
            </div>
          </div>

          <div class="p-4 rounded-xl" :style="{ background: 'rgba(255,255,255,0.05)' }">
            <div class="flex items-center gap-2 mb-3">
              <Activity class="w-4 h-4" :style="{ color: '#74B9FF' }" />
              <h3 class="font-display font-bold text-sm">偏好活动类型</h3>
            </div>
            <div class="space-y-2">
              <div v-for="(type, i) in profile.preferredActivityTypes.slice(0, 3)" :key="i">
                <div class="flex items-center justify-between text-xs mb-1">
                  <span>{{ type.category }}</span>
                  <span class="opacity-60">{{ type.count }}次 ({{ type.percentage }}%)</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" 
                       :style="{ 
                         width: type.percentage + '%', 
                         background: i === 0 ? 'linear-gradient(90deg, #6C5CE7, #A29BFE)' 
                                  : i === 1 ? 'linear-gradient(90deg, #FDCB6E, #F39C12)'
                                  : 'linear-gradient(90deg, #00CEC9, #81ECEC)'
                       }" />
                </div>
              </div>
              <div v-if="profile.preferredActivityTypes.length === 0" 
                   class="text-center text-xs opacity-50 py-2">
                暂无数据
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 rounded-xl" :style="{ background: 'rgba(255,255,255,0.05)' }">
          <div class="flex items-center gap-2 mb-3">
            <Tag class="w-4 h-4" :style="{ color: '#FDCB6E' }" />
            <h3 class="font-display font-bold text-sm">策略标签</h3>
          </div>
          <div class="flex flex-wrap gap-2">
            <span v-for="(tag, i) in profile.strategyTags" :key="i"
                  class="px-3 py-1.5 rounded-full text-xs font-medium"
                  :style="{ 
                    background: i === 0 ? 'rgba(253, 203, 110, 0.2)' 
                              : i === 1 ? 'rgba(162, 155, 254, 0.2)'
                              : i === 2 ? 'rgba(0, 206, 201, 0.2)'
                              : 'rgba(255,255,255,0.1)',
                    color: i === 0 ? '#FDCB6E' 
                            : i === 1 ? '#A29BFE'
                            : i === 2 ? '#00CEC9'
                            : 'rgba(255,255,255,0.8)'
                  }">
              {{ tag }}
            </span>
            <span v-if="profile.strategyTags.length === 0" 
                  class="text-xs opacity-50">
              暂无标签
            </span>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div class="p-3 rounded-xl text-center" :style="{ background: 'rgba(255,255,255,0.05)' }">
            <div class="text-xl mb-1">🎯</div>
            <div class="text-xs opacity-70">总轮次</div>
            <div class="font-display font-bold">{{ profile.totalRounds }}</div>
          </div>
          <div class="p-3 rounded-xl text-center" :style="{ background: 'rgba(255,255,255,0.05)' }">
            <div class="text-xl mb-1">⭐</div>
            <div class="text-xs opacity-70">评级</div>
            <div class="font-display font-bold">{{ profile.rank.stars }}星</div>
          </div>
          <div class="p-3 rounded-xl text-center" :style="{ background: 'rgba(255,255,255,0.05)' }">
            <div class="text-xl mb-1">📊</div>
            <div class="text-xs opacity-70">平均分</div>
            <div class="font-display font-bold">{{ Math.round(profile.totalScore / profile.totalRounds) }}</div>
          </div>
        </div>
      </div>

      <div v-else class="p-12 text-center">
        <div class="text-5xl mb-4 opacity-30">📋</div>
        <p class="opacity-60">暂无成就档案</p>
        <p class="text-sm opacity-40 mt-2">完成一局游戏后将自动生成</p>
      </div>
    </div>
  </div>
</template>
