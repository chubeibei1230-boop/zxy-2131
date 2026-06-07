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
  hints: ProbabilityHint[]
): RoundResult {
  const results: ActivityResult[] = []
  let totalReward = 0
  const events: string[] = []

  for (const activity of selectedActivities) {
    const actualProbability = calculateActualProbability(
      activity.baseProbability,
      hints,
      activity.id
    )
    const actualReward = calculateActualReward(
      activity.baseReward,
      hints,
      activity.id
    )
    const queuePenalty = calculateQueuePenalty(hints, activity.id)
    const success = simulateEvent(actualProbability)

    let reward = 0
    if (success) {
      reward = actualReward - queuePenalty
      events.push(`${activity.name}：成功！获得 ${reward} 分`)
    } else {
      reward = -queuePenalty
      events.push(`${activity.name}：失败，损失 ${queuePenalty} 分排队成本`)
    }

    totalReward += reward

    results.push({
      activityId: activity.id,
      success,
      actualProbability,
      reward,
      queueWaitTime: queuePenalty
    })
  }

  const crowdBonus = selectedActivities.length <= 2 ? 20 : 0
  if (crowdBonus > 0) {
    totalReward += crowdBonus
    events.push(`策略奖励：精选项目 +${crowdBonus} 分`)
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
