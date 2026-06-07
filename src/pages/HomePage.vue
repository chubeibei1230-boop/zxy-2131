<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import ActivityCard from '@/components/ActivityCard.vue'
import HintPanel from '@/components/HintPanel.vue'
import ScoreBoard from '@/components/ScoreBoard.vue'
import ResultPanel from '@/components/ResultPanel.vue'
import ControlBar from '@/components/ControlBar.vue'
import ReviewPanel from '@/components/ReviewPanel.vue'
import GameOverPanel from '@/components/GameOverPanel.vue'
import RoleSelector from '@/components/RoleSelector.vue'
import ChallengePanel from '@/components/ChallengePanel.vue'
import AchievementProfile from '@/components/AchievementProfile.vue'
import AchievementProgress from '@/components/AchievementProgress.vue'
import { Dice1, Lock } from 'lucide-vue-next'

const game = useGameStore()

const showActivities = computed(() => 
  game.present.currentRole === 'player' || game.present.currentRole === 'hint'
)

const showResult = computed(() => 
  game.present.currentRole === 'player' || game.present.currentRole === 'settlement'
)

const canSelectActivities = computed(() => 
  game.present.currentRole === 'player' && game.present.phase === 'selecting'
)

onMounted(async () => {
  await game.initGame()
})
</script>

<template>
  <div class="min-h-screen relative z-10">
    <header class="py-6 px-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center"
               :style="{ background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)' }">
            <Dice1 class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="font-display text-xl font-bold">概率决策</h1>
            <p class="text-xs opacity-60">在风险与收益之间寻找平衡</p>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 pb-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-3 space-y-6">
          <RoleSelector
            :currentRole="game.present.currentRole"
            @change="game.setRole"
          />
          
          <ScoreBoard
            :totalScore="game.present.totalScore"
            :currentRound="game.present.currentRound"
            :maxRounds="game.present.maxRounds"
            :queueLength="game.present.queueLength"
            :rewardPool="game.present.rewardPool"
            :selectedCount="game.present.selectedActivities.length"
            :maxSelected="3"
          />

          <ChallengePanel
            :challenges="game.present.challenges"
            :challengeBonus="game.present.challengeBonus"
          />

          <AchievementProgress :progress="game.partialProgress" />

          <div v-if="game.present.currentRole === 'hint'" class="glass-card p-5">
            <h3 class="font-display font-bold text-lg mb-3" style="color: #FDCB6E">
              💡 提示员权限
            </h3>
            <ul class="text-sm space-y-2 opacity-80">
              <li>• 查看所有活动的详细概率数据</li>
              <li>• 分析提示情报的影响范围</li>
              <li>• 观察排队人数的实时变化</li>
              <li>• 无法直接选择或操作活动</li>
            </ul>
          </div>

          <div v-if="game.present.currentRole === 'settlement'" class="glass-card p-5">
            <h3 class="font-display font-bold text-lg mb-3" style="color: #00CEC9">
              📊 结算员权限
            </h3>
            <ul class="text-sm space-y-2 opacity-80">
              <li>• 查看完整的结算明细</li>
              <li>• 分析每轮的盈亏构成</li>
              <li>• 查看历史复盘记录</li>
              <li>• 无法修改选择或重玩</li>
            </ul>
          </div>
        </div>

        <div class="lg:col-span-6 space-y-6">
          <ControlBar
            :phase="game.present.phase"
            :canUndo="game.canUndo && game.present.currentRole === 'player'"
            :canRedo="game.canRedo && game.present.currentRole === 'player'"
            :canConfirm="game.present.selectedActivities.length > 0 && game.present.currentRole === 'player'"
            @undo="game.undo()"
            @redo="game.redo()"
            @confirm="game.confirmSelection()"
            @nextRound="game.nextRound()"
            @newGame="game.startNewGame()"
          />

          <div v-if="!game.isInitialized" class="glass-card p-12 text-center">
            <div class="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p class="opacity-70">正在加载游戏数据...</p>
          </div>

          <template v-else>
            <div v-if="game.present.phase === 'gameover'">
              <GameOverPanel
                :totalScore="game.present.totalScore"
                :maxRounds="game.present.maxRounds"
                :challenges="game.present.challenges"
                :challengeBonus="game.present.challengeBonus"
                :hasAchievement="!!game.latestAchievement"
                @newGame="game.startNewGame()"
                @viewAchievement="game.toggleAchievementModal(true)"
              />
            </div>

            <div v-else-if="game.present.phase === 'result' && game.present.currentResult && showResult">
              <ResultPanel
                :result="game.present.currentResult"
                :selectedActivities="game.present.selectedActivities"
                :challengeUpdates="game.roundRecords[game.roundRecords.length - 1]?.challengeUpdates"
              />
            </div>

            <div v-else-if="showActivities" class="space-y-4">
              <div class="flex items-center justify-between">
                <h2 class="font-display font-bold text-lg">选择活动项目</h2>
                <span class="text-sm opacity-70">
                  已选 {{ game.present.selectedActivities.length }} / 3
                </span>
              </div>
              
              <div v-if="!canSelectActivities" class="glass-card p-4 flex items-center gap-3">
                <Lock class="w-5 h-5 opacity-50" />
                <p class="text-sm opacity-70">
                  当前角色为「{{ game.present.currentRole === 'hint' ? '提示员' : '结算员' }}」，无法选择活动。请切换到「玩家」角色进行操作。
                </p>
              </div>

              <p v-else class="text-sm opacity-60">
                点击卡片选择 1-3 个活动项目。选择更少的项目可以获得策略奖励。
                注意查看提示员情报来做出明智的决策！
              </p>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="activity in game.present.availableActivities"
                  :key="activity.id"
                  :class="{ 'opacity-60 pointer-events-none': !canSelectActivities }"
                >
                  <ActivityCard
                    :activity="activity"
                    :selected="game.isSelected(activity.id)"
                    :hints="game.present.hints"
                    @toggle="game.toggleActivity"
                  />
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="lg:col-span-3 space-y-6">
          <HintPanel
            v-if="game.present.currentRole !== 'settlement'"
            :hints="game.present.hints"
            :activities="game.present.availableActivities"
          />
          
          <ReviewPanel :records="game.roundRecords" />
        </div>
      </div>
    </main>

    <footer class="py-6 text-center text-xs opacity-40">
      <p>所有数据保存在本地浏览器 IndexedDB 中 • 支持撤销/重做 • 刷新页面自动恢复</p>
    </footer>

    <AchievementProfile
      v-if="game.showAchievementModal"
      :profile="game.latestAchievement"
      @close="game.toggleAchievementModal(false)"
    />
  </div>
</template>
