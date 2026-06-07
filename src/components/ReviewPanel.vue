<script setup lang="ts">
import { ref } from 'vue'
import type { RoundRecord } from '@/types'
import { History, ChevronDown, ChevronUp } from 'lucide-vue-next'

interface Props {
  records: RoundRecord[]
}

const props = defineProps<Props>()
const expandedId = ref<string | null>(null)

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}
</script>

<template>
  <div class="glass-card p-5 h-full flex flex-col">
    <div class="flex items-center gap-2 mb-4">
      <History class="w-5 h-5" :style="{ color: '#A29BFE' }" />
      <h2 class="font-display font-bold text-lg">复盘记录</h2>
      <span class="text-xs opacity-50 ml-auto">(自动保存)</span>
    </div>

    <p class="text-sm opacity-70 mb-4">
      所有游戏记录已自动保存到本地浏览器。你可以回顾每一轮的决策和结果。
    </p>

    <div class="flex-1 overflow-y-auto scrollbar-thin pr-2 space-y-2">
      <div v-if="records.length === 0" class="text-center py-8 opacity-50">
        <p class="text-4xl mb-2">📋</p>
        <p class="text-sm">暂无记录</p>
        <p class="text-xs mt-1">完成第一轮后这里会显示复盘记录</p>
      </div>

      <div v-for="record in [...records].reverse()" :key="record.id"
           class="rounded-xl overflow-hidden"
           :style="{ background: 'rgba(255,255,255,0.05)' }">
        <div
          class="p-3 cursor-pointer hover:bg-white/5 transition-colors"
          @click="toggleExpand(record.id)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm"
                   :style="{ background: record.scoreDelta >= 0 ? 'rgba(0, 206, 201, 0.2)' : 'rgba(255, 118, 117, 0.2)', 
                             color: record.scoreDelta >= 0 ? '#00CEC9' : '#FF7675' }">
                {{ record.roundNumber }}
              </div>
              <div>
                <div class="font-semibold text-sm">第 {{ record.roundNumber }} 轮</div>
                <div class="text-xs opacity-60">
                  选择了 {{ record.selectedActivities.length }} 个活动
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-display font-bold"
                    :style="{ color: record.scoreDelta >= 0 ? '#00CEC9' : '#FF7675' }">
                {{ record.scoreDelta >= 0 ? '+' : '' }}{{ record.scoreDelta }}
              </span>
              <component :is="expandedId === record.id ? ChevronUp : ChevronDown" 
                         class="w-4 h-4 opacity-50" />
            </div>
          </div>
        </div>

        <div v-if="expandedId === record.id" class="px-3 pb-3 border-t border-white/5">
          <div class="pt-3 space-y-3">
            <div>
              <div class="text-xs opacity-60 mb-2">选择的活动:</div>
              <div class="flex flex-wrap gap-2">
                <span v-for="activity in record.selectedActivities" :key="activity.id"
                      class="px-2 py-1 rounded-lg text-xs"
                      :style="{ background: 'rgba(108, 92, 231, 0.2)' }">
                  {{ activity.icon }} {{ activity.name }}
                </span>
              </div>
            </div>

            <div>
              <div class="text-xs opacity-60 mb-2">结算结果:</div>
              <ul class="text-xs space-y-1 opacity-80">
                <li v-for="(event, i) in record.result.events" :key="i">
                  • {{ event }}
                </li>
              </ul>
            </div>

            <div class="text-xs opacity-50">
              {{ new Date(record.timestamp).toLocaleString() }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
