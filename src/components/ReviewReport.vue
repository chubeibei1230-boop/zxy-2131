<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ReviewReport, StrategyAdvice, RoundReviewDetail } from '@/types'
import { 
  X, Trophy, Star, TrendingUp, TrendingDown, Target, 
  BarChart3, AlertCircle, CheckCircle2, Lightbulb, 
  Clock, Coins, Activity, PieChart, ChevronDown, ChevronUp,
  Zap, Shield, Flame, Scale as Balance
} from 'lucide-vue-next'

interface Props {
  report: ReviewReport | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const expandedRound = ref<number | null>(null)

function toggleRound(roundNumber: number) {
  expandedRound.value = expandedRound.value === roundNumber ? null : roundNumber
}

const riskIcon = computed(() => {
  if (!props.report) return Shield
  switch (props.report.riskAnalysis.riskLevel) {
    case 'aggressive': return Flame
    case 'conservative': return Shield
    default: return Balance
  }
})

const riskColor = computed(() => {
  if (!props.report) return '#A29BFE'
  switch (props.report.riskAnalysis.riskLevel) {
    case 'aggressive': return '#FF7675'
    case 'conservative': return '#00CEC9'
    default: return '#A29BFE'
  }
})

function getAdviceIcon(type: StrategyAdvice['type']) {
  switch (type) {
    case 'success': return CheckCircle2
    case 'warning': return AlertCircle
    default: return Lightbulb
  }
}

function getAdviceColor(type: StrategyAdvice['type']) {
  switch (type) {
    case 'success': return '#00CEC9'
    case 'warning': return '#FDCB6E'
    default: return '#74B9FF'
  }
}

function getActivityResultColor(success: boolean) {
  return success ? '#00CEC9' : '#FF7675'
}

const sortedRounds = computed(() => {
  if (!props.report) return []
  return [...props.report.roundDetails].reverse()
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
       @click.self="emit('close')">
    <div class="glass-card w-full max-w-4xl max-h-[92vh] overflow-y-auto scrollbar-thin animate-slide-in">
      <div class="sticky top-0 z-10 p-5 pb-3 border-b border-white/10"
           :style="{ background: 'rgba(26, 26, 46, 0.95)', backdropFilter: 'blur(20px)' }">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                 :style="{ background: 'linear-gradient(135deg, #FDCB6E, #F39C12)' }">
              <BarChart3 class="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 class="font-display text-xl font-bold">策略复盘报告</h2>
              <p class="text-xs opacity-60">第 {{ report?.sessionId.slice(0, 8) }} 号报告</p>
            </div>
          </div>
          <button class="btn-ghost p-2 rounded-lg" @click="emit('close')">
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div v-if="report" class="p-5 space-y-5">
        <div class="p-6 rounded-2xl text-center"
             :style="{ background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.2), rgba(253, 203, 110, 0.1))' }">
          <div class="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 animate-pulse-glow"
               :style="{ background: `linear-gradient(135deg, ${report.rank.color}40, ${report.rank.color}20)` }">
            <Trophy class="w-10 h-10" :style="{ color: report.rank.color }" />
          </div>
          <div class="text-sm opacity-70 mb-2">最终得分</div>
          <div class="font-display text-5xl font-black mb-3"
               :style="{ color: report.rank.color }">
            {{ report.totalScore }}
          </div>
          <div class="flex items-center justify-center gap-1 mb-2">
            <Star v-for="i in 5" :key="i" 
                  class="w-5 h-5"
                  :fill="i <= report.rank.stars ? report.rank.color : 'transparent'"
                  :style="{ color: i <= report.rank.stars ? report.rank.color : 'rgba(255,255,255,0.2)' }" />
          </div>
          <div class="font-bold text-lg" :style="{ color: report.rank.color }">
            {{ report.rank.title }}
          </div>
          <div class="text-xs opacity-50 mt-2">
            完成于 {{ new Date(report.completedAt).toLocaleString() }}
          </div>
        </div>

        <div class="p-4 rounded-xl" :style="{ background: 'rgba(255,255,255,0.05)' }">
          <div class="flex items-center gap-2 mb-3">
            <Lightbulb class="w-4 h-4" :style="{ color: '#FDCB6E' }" />
            <h3 class="font-display font-bold text-sm">报告摘要</h3>
          </div>
          <p class="text-sm leading-relaxed opacity-80">
            {{ report.summary }}
          </p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div class="p-3 rounded-xl text-center" :style="{ background: 'rgba(255,255,255,0.05)' }">
            <div class="text-xl mb-1">🎯</div>
            <div class="text-xs opacity-70">总轮次</div>
            <div class="font-display font-bold">{{ report.totalRounds }}</div>
          </div>
          <div class="p-3 rounded-xl text-center" :style="{ background: 'rgba(255,255,255,0.05)' }">
            <div class="text-xl mb-1">📊</div>
            <div class="text-xs opacity-70">平均分</div>
            <div class="font-display font-bold">{{ report.overallStats.averageScorePerRound }}</div>
          </div>
          <div class="p-3 rounded-xl text-center" :style="{ background: 'rgba(255,255,255,0.05)' }">
            <div class="text-xl mb-1">✅</div>
            <div class="text-xs opacity-70">成功率</div>
            <div class="font-display font-bold" style="color: #00CEC9">
              {{ Math.round(report.overallStats.successRate * 100) }}%
            </div>
          </div>
          <div class="p-3 rounded-xl text-center" :style="{ background: 'rgba(255,255,255,0.05)' }">
            <div class="text-xl mb-1">⏰</div>
            <div class="text-xs opacity-70">总排队成本</div>
            <div class="font-display font-bold" style="color: #FF7675">
              -{{ report.overallStats.totalQueueCost }}
            </div>
          </div>
          <div class="p-3 rounded-xl text-center" :style="{ background: 'rgba(255,255,255,0.05)' }">
            <div class="text-xl mb-1">💰</div>
            <div class="text-xs opacity-70">总奖励</div>
            <div class="font-display font-bold" style="color: #FDCB6E">
              +{{ report.overallStats.totalReward }}
            </div>
          </div>
          <div class="p-3 rounded-xl text-center" :style="{ background: 'rgba(255,255,255,0.05)' }">
            <div class="text-xl mb-1">🎁</div>
            <div class="text-xs opacity-70">挑战奖励</div>
            <div class="font-display font-bold" style="color: #00CEC9">
              +{{ report.overallStats.totalChallengeBonus }}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-4 rounded-xl" 
               :style="{ background: 'linear-gradient(135deg, rgba(0, 206, 201, 0.15), rgba(0, 206, 201, 0.05))' }">
            <div class="flex items-center gap-2 mb-3">
              <TrendingUp class="w-5 h-5" style="color: #00CEC9" />
              <h3 class="font-display font-bold">最佳表现</h3>
            </div>
            <div class="text-center py-2">
              <div class="text-sm opacity-70 mb-1">第 {{ report.bestRound.roundNumber }} 轮</div>
              <div class="text-3xl font-display font-black" style="color: #00CEC9">
                +{{ report.bestRound.scoreDelta }}
              </div>
              <div class="text-xs opacity-60 mt-2">{{ report.bestRound.reason }}</div>
            </div>
          </div>

          <div class="p-4 rounded-xl"
               :style="{ background: 'linear-gradient(135deg, rgba(255, 118, 117, 0.15), rgba(255, 118, 117, 0.05))' }">
            <div class="flex items-center gap-2 mb-3">
              <TrendingDown class="w-5 h-5" style="color: #FF7675" />
              <h3 class="font-display font-bold">待改进轮次</h3>
            </div>
            <div class="text-center py-2">
              <div class="text-sm opacity-70 mb-1">第 {{ report.worstRound.roundNumber }} 轮</div>
              <div class="text-3xl font-display font-black" style="color: #FF7675">
                {{ report.worstRound.scoreDelta >= 0 ? '+' : '' }}{{ report.worstRound.scoreDelta }}
              </div>
              <div class="text-xs opacity-60 mt-2">{{ report.worstRound.reason }}</div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-4 rounded-xl" :style="{ background: 'rgba(255,255,255,0.05)' }">
            <div class="flex items-center gap-2 mb-3">
              <component :is="riskIcon" class="w-4 h-4" :style="{ color: riskColor }" />
              <h3 class="font-display font-bold text-sm">风险偏好分析</h3>
            </div>
            <div class="text-center py-2 mb-3">
              <div class="text-lg font-bold mb-1" :style="{ color: riskColor }">
                {{ report.riskAnalysis.label }}
              </div>
              <p class="text-xs opacity-60 leading-relaxed">
                {{ report.riskAnalysis.description }}
              </p>
            </div>
            <div class="space-y-2">
              <div>
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="flex items-center gap-1">
                    <Shield class="w-3 h-3" style="color: #00CEC9" />
                    低风险
                  </span>
                  <span class="opacity-60">{{ report.riskAnalysis.lowRiskRatio }}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" 
                       :style="{ width: report.riskAnalysis.lowRiskRatio + '%', background: 'linear-gradient(90deg, #00CEC9, #81ECEC)' }" />
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="flex items-center gap-1">
                    <Balance class="w-3 h-3" style="color: #A29BFE" />
                    中风险
                  </span>
                  <span class="opacity-60">{{ report.riskAnalysis.mediumRiskRatio }}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" 
                       :style="{ width: report.riskAnalysis.mediumRiskRatio + '%', background: 'linear-gradient(90deg, #A29BFE, #6C5CE7)' }" />
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="flex items-center gap-1">
                    <Flame class="w-3 h-3" style="color: #FF7675" />
                    高风险
                  </span>
                  <span class="opacity-60">{{ report.riskAnalysis.highRiskRatio }}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" 
                       :style="{ width: report.riskAnalysis.highRiskRatio + '%', background: 'linear-gradient(90deg, #FF7675, #D63031)' }" />
                </div>
              </div>
            </div>
            <div class="mt-3 pt-3 border-t border-white/10 text-center">
              <div class="text-xs opacity-60">平均风险指数</div>
              <div class="font-display font-bold text-lg" :style="{ color: riskColor }">
                {{ report.riskAnalysis.averageRiskScore }}
              </div>
            </div>
          </div>

          <div class="p-4 rounded-xl" :style="{ background: 'rgba(255,255,255,0.05)' }">
            <div class="flex items-center gap-2 mb-3">
              <Target class="w-4 h-4" :style="{ color: '#FDCB6E' }" />
              <h3 class="font-display font-bold text-sm">挑战贡献分析</h3>
            </div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-2xl font-display font-bold text-gradient-gold">
                {{ report.challengeAnalysis.completed }}/{{ report.challengeAnalysis.total }}
              </span>
              <span class="text-xs px-2 py-1 rounded-full"
                    :style="{ 
                      background: report.challengeAnalysis.completed === report.challengeAnalysis.total 
                        ? 'rgba(0, 206, 201, 0.2)' 
                        : 'rgba(253, 203, 110, 0.1)',
                      color: report.challengeAnalysis.completed === report.challengeAnalysis.total 
                        ? '#00CEC9' 
                        : '#FDCB6E'
                    }">
                +{{ report.challengeAnalysis.bonus }} 奖励
              </span>
            </div>
            <div class="space-y-2 max-h-36 overflow-y-auto scrollbar-thin">
              <div v-for="(challenge, i) in report.challengeAnalysis.list" :key="i"
                   class="flex items-center gap-2 text-xs">
                <div class="w-2 h-2 rounded-full flex-shrink-0"
                     :style="{ background: challenge.completed ? '#00CEC9' : '#FF7675' }" />
                <span class="flex-1 truncate" :class="{ 'opacity-50': !challenge.completed }">
                  {{ challenge.title }}
                </span>
                <span v-if="challenge.completed" class="font-bold flex-shrink-0" style="color: #00CEC9">
                  +{{ challenge.bonus }}
                  <span v-if="challenge.contributionPercent > 0" class="opacity-60 ml-1">
                    ({{ challenge.contributionPercent }}%)
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 rounded-xl" :style="{ background: 'rgba(255,255,255,0.05)' }">
          <div class="flex items-center gap-2 mb-4">
            <Zap class="w-4 h-4" :style="{ color: '#FDCB6E' }" />
            <h3 class="font-display font-bold text-sm">策略建议</h3>
          </div>
          <div class="space-y-3">
            <div v-for="advice in report.strategyAdvices" :key="advice.id"
                 class="p-3 rounded-xl"
                 :style="{ background: `${getAdviceColor(advice.type)}10` }">
              <div class="flex items-start gap-3">
                <component :is="getAdviceIcon(advice.type)" 
                           class="w-5 h-5 flex-shrink-0 mt-0.5" 
                           :style="{ color: getAdviceColor(advice.type) }" />
                <div class="flex-1 min-w-0">
                  <div class="font-semibold text-sm mb-1" :style="{ color: getAdviceColor(advice.type) }">
                    {{ advice.title }}
                  </div>
                  <p class="text-xs opacity-70 mb-2">{{ advice.description }}</p>
                  <p class="text-xs font-medium" :style="{ color: getAdviceColor(advice.type) }">
                    💡 {{ advice.actionable }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 rounded-xl" :style="{ background: 'rgba(255,255,255,0.05)' }">
          <div class="flex items-center gap-2 mb-4">
            <Activity class="w-4 h-4" :style="{ color: '#A29BFE' }" />
            <h3 class="font-display font-bold text-sm">各轮详情</h3>
            <span class="text-xs opacity-50 ml-auto">点击展开</span>
          </div>
          <div class="space-y-2">
            <div v-for="detail in sortedRounds" :key="detail.roundNumber"
                 class="rounded-xl overflow-hidden"
                 :style="{ background: 'rgba(255,255,255,0.03)' }">
              <div
                class="p-3 cursor-pointer hover:bg-white/5 transition-colors"
                @click="toggleRound(detail.roundNumber)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm"
                         :style="{ 
                           background: detail.scoreDelta >= 0 
                             ? 'rgba(0, 206, 201, 0.2)' 
                             : 'rgba(255, 118, 117, 0.2)', 
                           color: detail.scoreDelta >= 0 ? '#00CEC9' : '#FF7675' 
                         }">
                      {{ detail.roundNumber }}
                    </div>
                    <div>
                      <div class="font-semibold text-sm">第 {{ detail.roundNumber }} 轮</div>
                      <div class="text-xs opacity-60 flex items-center gap-2">
                        <span class="flex items-center gap-1">
                          <Clock class="w-3 h-3" />
                          排队: -{{ detail.queueCost }}
                        </span>
                        <span class="flex items-center gap-1">
                          <Coins class="w-3 h-3" />
                          奖励: +{{ detail.totalReward }}
                        </span>
                        <span v-if="detail.challengeContribution > 0" class="flex items-center gap-1" style="color: #FDCB6E">
                          <Target class="w-3 h-3" />
                          挑战: +{{ detail.challengeContribution }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="font-display font-bold"
                          :style="{ color: detail.scoreDelta >= 0 ? '#00CEC9' : '#FF7675' }">
                      {{ detail.scoreDelta >= 0 ? '+' : '' }}{{ detail.scoreDelta }}
                    </span>
                    <component :is="expandedRound === detail.roundNumber ? ChevronUp : ChevronDown" 
                               class="w-4 h-4 opacity-50" />
                  </div>
                </div>
              </div>

              <div v-if="expandedRound === detail.roundNumber" class="px-3 pb-3 border-t border-white/5">
                <div class="pt-3 space-y-3">
                  <div>
                    <div class="text-xs opacity-60 mb-2">选择的活动:</div>
                    <div class="flex flex-wrap gap-2">
                      <span v-for="activity in detail.selectedActivities" :key="activity.id"
                            class="px-2 py-1 rounded-lg text-xs"
                            :style="{ background: 'rgba(108, 92, 231, 0.2)' }">
                        {{ activity.icon }} {{ activity.name }}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div class="text-xs opacity-60 mb-2">活动结果:</div>
                    <div class="space-y-2">
                      <div v-for="result in detail.results" :key="result.activityId"
                           class="flex items-center justify-between p-2 rounded-lg text-xs"
                           :style="{ background: 'rgba(255,255,255,0.03)' }">
                        <div class="flex items-center gap-2">
                          <component :is="result.success ? CheckCircle2 : X" 
                                     class="w-4 h-4"
                                     :style="{ color: getActivityResultColor(result.success) }" />
                          <span>
                            {{ detail.selectedActivities.find(a => a.id === result.activityId)?.name }}
                          </span>
                        </div>
                        <div class="flex items-center gap-3">
                          <span class="opacity-60">
                            概率 {{ Math.round(result.actualProbability * 100) }}%
                          </span>
                          <span class="font-bold"
                                :style="{ color: result.reward >= 0 ? '#00CEC9' : '#FF7675' }">
                            {{ result.reward >= 0 ? '+' : '' }}{{ result.reward }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="detail.hints.length > 0">
                    <div class="text-xs opacity-60 mb-2">提示情报:</div>
                    <div class="space-y-1">
                      <div v-for="hint in detail.hints" :key="hint.id"
                           class="p-2 rounded-lg text-xs"
                           :style="{ background: 'rgba(0, 206, 201, 0.08)' }">
                        <span class="font-medium" style="color: #00CEC9">{{ hint.title }}</span>
                        <span class="opacity-70 ml-2">{{ hint.description }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center justify-between text-xs opacity-50">
                    <span>
                      情报命中: {{ detail.hintHits }} / {{ detail.hintHits + detail.hintMisses }}
                    </span>
                    <span>{{ new Date(detail.timestamp).toLocaleString() }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="p-12 text-center">
        <div class="text-5xl mb-4 opacity-30">📊</div>
        <p class="opacity-60">暂无复盘报告</p>
        <p class="text-sm opacity-40 mt-2">完成一局游戏后将自动生成</p>
      </div>
    </div>
  </div>
</template>
