<script setup lang="ts">
import type { UserRole } from '@/types'
import { User, Lightbulb, BarChart3 } from 'lucide-vue-next'

interface Props {
  currentRole: UserRole
}

defineProps<Props>()
const emit = defineEmits<{
  change: [role: UserRole]
}>()

const roles: { id: UserRole; name: string; icon: any; description: string; color: string }[] = [
  { 
    id: 'player', 
    name: '玩家', 
    icon: User, 
    description: '选择活动项目，做出决策',
    color: '#6C5CE7'
  },
  { 
    id: 'hint', 
    name: '提示员', 
    icon: Lightbulb, 
    description: '查看和发布概率情报',
    color: '#FDCB6E'
  },
  { 
    id: 'settlement', 
    name: '结算员', 
    icon: BarChart3, 
    description: '查看分数和复盘记录',
    color: '#00CEC9'
  }
]
</script>

<template>
  <div class="glass-card p-4">
    <h3 class="text-sm font-semibold opacity-70 mb-3">角色切换</h3>
    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="role in roles"
        :key="role.id"
        class="p-3 rounded-xl transition-all duration-300 text-center"
        :class="currentRole === role.id ? 'animate-pulse-glow' : ''"
        :style="{
          background: currentRole === role.id 
            ? `linear-gradient(135deg, ${role.color}33, ${role.color}11)`
            : 'rgba(255,255,255,0.05)',
          border: currentRole === role.id ? `2px solid ${role.color}` : '2px solid transparent'
        }"
        @click="emit('change', role.id)"
      >
        <component 
          :is="role.icon" 
          class="w-6 h-6 mx-auto mb-1"
          :style="{ color: role.color }"
        />
        <div class="text-sm font-semibold">{{ role.name }}</div>
        <div class="text-xs opacity-60 mt-0.5">{{ role.description }}</div>
      </button>
    </div>
  </div>
</template>
