<script setup lang="ts">
import { Undo2, Redo2, Play, RotateCcw, ChevronRight } from 'lucide-vue-next'

interface Props {
  phase: 'selecting' | 'result' | 'gameover'
  canUndo: boolean
  canRedo: boolean
  canConfirm: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  undo: []
  redo: []
  confirm: []
  nextRound: []
  newGame: []
}>()
</script>

<template>
  <div class="glass-card p-4">
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <button
          class="btn-ghost flex items-center gap-2"
          :disabled="!canUndo"
          @click="emit('undo')"
          title="撤销上一步"
        >
          <Undo2 class="w-4 h-4" />
          <span class="hidden sm:inline">撤销</span>
        </button>
        <button
          class="btn-ghost flex items-center gap-2"
          :disabled="!canRedo"
          @click="emit('redo')"
          title="重做"
        >
          <Redo2 class="w-4 h-4" />
          <span class="hidden sm:inline">重做</span>
        </button>
      </div>

      <div class="flex-1 flex justify-center">
        <div v-if="phase === 'selecting'" class="flex items-center gap-2">
          <span class="text-sm opacity-70">选择 1-3 个活动后</span>
        </div>
        <div v-else-if="phase === 'result'" class="flex items-center gap-2">
          <span class="text-sm opacity-70">查看结果后</span>
        </div>
        <div v-else class="flex items-center gap-2">
          <span class="text-sm opacity-70">游戏结束</span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="phase === 'selecting'"
          class="btn-primary flex items-center gap-2"
          :disabled="!canConfirm"
          @click="emit('confirm')"
        >
          <Play class="w-4 h-4" />
          <span>确认选择</span>
        </button>

        <button
          v-else-if="phase === 'result'"
          class="btn-primary flex items-center gap-2"
          @click="emit('nextRound')"
        >
          <span>下一轮</span>
          <ChevronRight class="w-4 h-4" />
        </button>

        <button
          v-else
          class="btn-primary flex items-center gap-2"
          @click="emit('newGame')"
        >
          <RotateCcw class="w-4 h-4" />
          <span>再来一局</span>
        </button>
      </div>
    </div>
  </div>
</template>
