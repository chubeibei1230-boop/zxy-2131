import type { Activity, ProbabilityHint, RoundResult, ActivityResult } from '@/types'
import {
  calculateActualProbability,
  calculateActualReward,
  calculateQueuePenalty,
  simulateEvent
} from './probability'

export function settleRound(
  roundNumber: number,
  selectedActivities: Activity[],
  hints: ProbabilityHint[],
  queueLength: number,
  rewardPool: number
): RoundResult {
  const results: ActivityResult[] = []
  let totalReward = 0
  const events: string[] = []

  const queueMultiplier = 1 + (queueLength / 20)
  const poolBonus = Math.floor(rewardPool / 10)

  if (queueLength > 7) {
    events.push(`⚠️ 现场人数较多 (${queueLength}人)，排队成本增加`)
  }
  if (rewardPool > 200) {
    events.push(`🎁 奖池丰厚 (+${poolBonus}分基础加成)`)
  }

  for (const activity of selectedActivities) {
    const baseProbability = calculateActualProbability(
      activity.baseProbability,
      hints,
      activity.id
    )
    
    const crowdPenalty = queueLength > 5 ? (queueLength - 5) * 0.03 : 0
    const actualProbability = Math.max(0.05, baseProbability - crowdPenalty)
    
    const baseReward = calculateActualReward(
      activity.baseReward,
      hints,
      activity.id
    )
    const actualReward = baseReward + poolBonus
    const hintQueuePenalty = calculateQueuePenalty(hints, activity.id)
    const totalQueuePenalty = hintQueuePenalty + Math.floor(queueLength * 2)
    
    const success = simulateEvent(actualProbability)

    let reward = 0
    if (success) {
      reward = Math.floor(actualReward * (1 + (1 / queueMultiplier) * 0.3)) - totalQueuePenalty
      events.push(`${activity.icon} ${activity.name}：成功！获得 ${Math.max(0, reward)} 分`)
    } else {
      reward = -totalQueuePenalty
      events.push(`${activity.icon} ${activity.name}：失败，损失 ${totalQueuePenalty} 分排队成本`)
    }

    totalReward += reward

    results.push({
      activityId: activity.id,
      success,
      actualProbability,
      reward,
      queueWaitTime: totalQueuePenalty
    })
  }

  const crowdBonus = selectedActivities.length <= 2 ? 20 : 0
  if (crowdBonus > 0) {
    totalReward += crowdBonus
    events.push(`✨ 策略奖励：精选项目 +${crowdBonus} 分`)
  }

  const highRiskBonus = selectedActivities.some(a => a.riskLevel === 3) && totalReward > 0
    ? Math.floor(totalReward * 0.1)
    : 0
  if (highRiskBonus > 0) {
    totalReward += highRiskBonus
    events.push(`🔥 高风险加成：+${highRiskBonus} 分`)
  }

  return {
    roundNumber,
    totalReward,
    results,
    events
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
