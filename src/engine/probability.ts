import type { Activity, ProbabilityHint } from '@/types'

const HINT_TEMPLATES = [
  {
    type: 'crowd' as const,
    titles: ['人数激增警告', '热门项目预警', '拥挤警报'],
    descriptions: ['检测到某活动人数突然增加，成功率会下降', '大量玩家涌入同一项目，竞争加剧'],
    impact: { probabilityDelta: -0.15 }
  },
  {
    type: 'reward' as const,
    titles: ['奖励翻倍机会', '幸运加成', '额外奖励'],
    descriptions: ['某活动临时提升奖励额度', '赞助商追加了奖池金额'],
    impact: { rewardDelta: 50 }
  },
  {
    type: 'luck' as const,
    titles: ['好运降临', '幸运光环', '概率提升'],
    descriptions: ['今日运势不错，某活动成功率提升', '幸运女神眷顾了某个项目'],
    impact: { probabilityDelta: 0.2 }
  },
  {
    type: 'queue' as const,
    titles: ['排队过长警告', '等待时间延长', '队伍拥堵'],
    descriptions: ['某活动排队人数过多，等待会损失分数', '热门项目排起了长龙'],
    impact: { queuePenalty: 30 }
  }
]

export function generateHints(activities: Activity[], count: number = 2): ProbabilityHint[] {
  const hints: ProbabilityHint[] = []
  
  for (let i = 0; i < count; i++) {
    const template = HINT_TEMPLATES[Math.floor(Math.random() * HINT_TEMPLATES.length)]
    const targetActivity = activities[Math.floor(Math.random() * activities.length)]
    
    hints.push({
      id: `hint-${Date.now()}-${i}`,
      type: template.type,
      title: template.titles[Math.floor(Math.random() * template.titles.length)],
      description: template.descriptions[Math.floor(Math.random() * template.descriptions.length)],
      impact: {
        activityId: targetActivity.id,
        ...template.impact
      }
    })
  }
  
  return hints
}

export function calculateActualProbability(
  baseProbability: number,
  hints: ProbabilityHint[],
  activityId: string
): number {
  let probability = baseProbability
  
  for (const hint of hints) {
    if (hint.impact.activityId === activityId && hint.impact.probabilityDelta) {
      probability += hint.impact.probabilityDelta
    }
  }
  
  return Math.max(0.05, Math.min(0.95, probability))
}

export function calculateActualReward(
  baseReward: number,
  hints: ProbabilityHint[],
  activityId: string
): number {
  let reward = baseReward
  
  for (const hint of hints) {
    if (hint.impact.activityId === activityId && hint.impact.rewardDelta) {
      reward += hint.impact.rewardDelta
    }
  }
  
  return reward
}

export function calculateQueuePenalty(
  hints: ProbabilityHint[],
  activityId: string
): number {
  let penalty = 0
  
  for (const hint of hints) {
    if (hint.impact.activityId === activityId && hint.impact.queuePenalty) {
      penalty += hint.impact.queuePenalty
    }
  }
  
  return penalty
}

export function simulateEvent(probability: number): boolean {
  return Math.random() < probability
}
