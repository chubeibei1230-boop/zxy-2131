<script setup lang="ts">
import { onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import ActivityCard from '@/components/ActivityCard.vue'
import HintPanel from '@/components/HintPanel.vue'
import ScoreBoard from '@/components/ScoreBoard.vue'
import ResultPanel from '@/components/ResultPanel.vue'
import ControlBar from '@/components/ControlBar.vue'
import ReviewPanel from '@/components/ReviewPanel.vue'
import GameOverPanel from '@/components/GameOverPanel.vue'
import { Dice1 } from 'lucide-vue-next'

const game = useGameStore()

onMounted(() => {
  game.startNewGame()
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
          <ScoreBoard
            :totalScore="game.present.totalScore"
            :currentRound="game.present.currentRound"
            :maxRounds="game.present.maxRounds"
            :queueLength="game.present.queueLength"
            :rewardPool="game.present.rewardPool"
            :selectedCount="game.present.selectedActivities.length"
            :maxSelected="3"
          />
          <HintPanel
            :hints="game.present.hints"
            :activities="game.present.availableActivities"
          />
        </div>

        <div class="lg:col-span-6 space-y-6">
          <ControlBar
            :phase="game.present.phase"
            :canUndo="game.canUndo"
            :canRedo="game.canRedo"
            :canConfirm="game.present.selectedActivities.length > 0"
            @undo="game.undo()"
            @redo="game.redo()"
            @confirm="game.confirmSelection()"
            @nextRound="game.nextRound()"
            @newGame="game.startNewGame()"
          />

          <div v-if="game.present.phase === 'gameover'">
            <GameOverPanel
              :totalScore="game.present.totalScore"
              :maxRounds="game.present.maxRounds"
              @newGame="game.startNewGame()"
            />
          </div>

          <div v-else-if="game.present.phase === 'result' && game.present.currentResult">
            <ResultPanel
              :result="game.present.currentResult"
              :selectedActivities="game.present.selectedActivities"
            />
          </div>

          <div v-else class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="font-display font-bold text-lg">选择活动项目</h2>
              <span class="text-sm opacity-70">
                已选 {{ game.present.selectedActivities.length }} / 3
              </span>
            </div>
            
            <p class="text-sm opacity-60">
              点击卡片选择 1-3 个活动项目。选择更少的项目可以获得策略奖励。
              注意查看提示员情报来做出明智的决策！
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ActivityCard
                v-for="activity in game.present.availableActivities"
                :key="activity.id"
                :activity="activity"
                :selected="game.isSelected(activity.id)"
                :hints="game.present.hints"
                @toggle="game.toggleActivity"
              />
            </div>
          </div>
        </div>

        <div class="lg:col-span-3">
          <ReviewPanel :records="game.roundRecords" />
        </div>
      </div>
    </main>

    <footer class="py-6 text-center text-xs opacity-40">
      <p>所有数据保存在本地浏览器 IndexedDB 中 • 支持撤销/重做</p>
    </footer>
  </div>
</template>
