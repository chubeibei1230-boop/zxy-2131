import type { 
  ChallengeTarget, 
  ChallengeProgress, 
  ChallengeType,
  Activity,
  RoundResult,
  RoundChallengeUpdate
} from '@/types'
import { ACTIVITIES } from './activities'
import { generateId } from './settlement'

interface ChallengeTemplate {
  type: ChallengeType
  title: string
  description: string
  targets: number[]
  bonus: number
  progressText: (current: number, target: number) => string
}

const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    type: 'consecutive_low_risk',
    title: '稳健策略家',
    description: '连续选择低风险活动',
    targets: [2, 3, 4],
    bonus: 100,
    progressText: (current, target) => `连续 ${current}/${target} 轮`
  },
  {
    type: 'high_crowd_profit',
    title: '拥挤淘金者',
    description: '在高拥挤度下仍获得正收益',
    targets: [2, 3, 4],
    bonus: 120,
    progressText: (current, target) => `${current}/${target} 次`
  },
  {
    type: 'single_round_reward',
    title: '单轮突破',
    description: '单轮累计奖励超过指定分数',
    targets: [200, 300, 400],
    bonus: 150,
    progressText: (current, target) => `最高 ${current}/${target} 分`
  },
  {
    type: 'total_high_risk',
    title: '风险猎人',
    description: '累计选择高风险活动达到指定次数',
    targets: [3, 5, 7],
    bonus: 100,
    progressText: (current, target) => `${current}/${target} 次`
  },
  {
    type: 'perfect_rounds',
    title: '完美表现',
    description: '单轮所有选择的活动全部成功',
    targets: [2, 3, 4],
    bonus: 130,
    progressText: (current, target) => `${current}/${target} 轮`
  },
  {
    type: 'no_failure_streak',
    title: '不败纪录',
    description: '连续多轮没有任何活动失败',
    targets: [3, 4, 5],
    bonus: 140,
    progressText: (current, target) => `连续 ${current}/${target} 轮`
  },
  {
    type: 'specific_activity',
    title: '专精达人',
    description: '累计选择某个特定活动达到指定次数',
    targets: [3, 4, 5],
    bonus: 110,
    progressText: (current, target) => `${current}/${target} 次`
  },
  {
    type: 'queue_length_strategy',
    title: '错峰高手',
    description: '在排队人数较少时完成活动选择',
    targets: [3, 4, 5],
    bonus: 90,
    progressText: (current, target) => `${current}/${target} 轮`
  }
]

export function createInitialChallengeProgress(): ChallengeProgress {
  return {
    consecutiveLowRiskCount: 0,
    consecutiveNoFailureCount: 0,
    highRiskActivityCount: 0,
    perfectRoundCount: 0,
    activityCounts: {}
  }
}

export function generateRandomChallenges(count: number = 3): ChallengeTarget[] {
  const shuffled = [...CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, count)
  
  return selected.map(template => {
    const targetValue = template.targets[Math.floor(Math.random() * template.targets.length)]
    let description = template.description
    let title = template.title
    
    if (template.type === 'specific_activity') {
      const activity = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)]
      title = `${activity.name}专精`
      description = `累计选择「${activity.name}」达到 ${targetValue} 次`
    } else if (template.type === 'single_round_reward') {
      description = `单轮累计奖励超过 ${targetValue} 分`
    } else if (template.type === 'consecutive_low_risk') {
      description = `连续 ${targetValue} 轮选择低风险活动`
    } else if (template.type === 'high_crowd_profit') {
      description = `在拥挤度≥7时仍获得正收益，共 ${targetValue} 次`
    } else if (template.type === 'total_high_risk') {
      description = `累计选择高风险活动 ${targetValue} 次`
    } else if (template.type === 'perfect_rounds') {
      description = `单轮所有活动全部成功，共 ${targetValue} 轮`
    } else if (template.type === 'no_failure_streak') {
      description = `连续 ${targetValue} 轮没有任何活动失败`
    } else if (template.type === 'queue_length_strategy') {
      description = `在排队人数≤5时完成选择，共 ${targetValue} 轮`
    }
    
    return {
      id: generateId(),
      type: template.type,
      title,
      description,
      target: targetValue,
      current: 0,
      completed: false,
      bonus: template.bonus,
      progressText: template.progressText(0, targetValue)
    }
  })
}

export function updateChallengesProgress(
  challenges: ChallengeTarget[],
  progress: ChallengeProgress,
  selectedActivities: Activity[],
  result: RoundResult,
  queueLength: number
): {
  updatedChallenges: ChallengeTarget[]
  updatedProgress: ChallengeProgress
  roundUpdate: RoundChallengeUpdate
  totalBonus: number
} {
  const newProgress = { ...progress }
  const challengeUpdates: RoundChallengeUpdate['challengeUpdates'] = []
  let totalBonus = 0

  const allLowRisk = selectedActivities.every(a => a.riskLevel === 1)
  const allSuccess = result.results.every(r => r.success)
  const hasFailure = result.results.some(r => !r.success)
  const isHighCrowd = queueLength >= 7
  const isLowCrowd = queueLength <= 5
  const hasPositiveProfit = result.totalReward > 0

  if (allLowRisk) {
    newProgress.consecutiveLowRiskCount++
  } else {
    newProgress.consecutiveLowRiskCount = 0
  }

  if (!hasFailure) {
    newProgress.consecutiveNoFailureCount++
  } else {
    newProgress.consecutiveNoFailureCount = 0
  }

  const highRiskCount = selectedActivities.filter(a => a.riskLevel === 3).length
  newProgress.highRiskActivityCount += highRiskCount

  if (allSuccess && selectedActivities.length > 0) {
    newProgress.perfectRoundCount++
  }

  for (const activity of selectedActivities) {
    newProgress.activityCounts[activity.id] = (newProgress.activityCounts[activity.id] || 0) + 1
  }

  const updatedChallenges = challenges.map(challenge => {
    if (challenge.completed) {
      return challenge
    }

    let newCurrent = challenge.current
    let completed = false
    let bonusEarned = 0

    switch (challenge.type) {
      case 'consecutive_low_risk':
        newCurrent = Math.max(challenge.current, newProgress.consecutiveLowRiskCount)
        break
      case 'high_crowd_profit':
        if (isHighCrowd && hasPositiveProfit) {
          newCurrent = challenge.current + 1
        }
        break
      case 'single_round_reward':
        newCurrent = Math.max(challenge.current, result.totalReward)
        break
      case 'total_high_risk':
        newCurrent = newProgress.highRiskActivityCount
        break
      case 'perfect_rounds':
        newCurrent = newProgress.perfectRoundCount
        break
      case 'no_failure_streak':
        newCurrent = Math.max(challenge.current, newProgress.consecutiveNoFailureCount)
        break
      case 'specific_activity':
        const activityId = Object.keys(newProgress.activityCounts).find(
          id => challenge.title.includes(ACTIVITIES.find(a => a.id === id)?.name || '')
        )
        if (activityId) {
          newCurrent = newProgress.activityCounts[activityId]
        }
        break
      case 'queue_length_strategy':
        if (isLowCrowd) {
          newCurrent = challenge.current + 1
        }
        break
    }

    if (newCurrent >= challenge.target && !challenge.completed) {
      completed = true
      bonusEarned = challenge.bonus
      totalBonus += bonusEarned
    }

    challengeUpdates.push({
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      challengeDescription: challenge.description,
      previousProgress: challenge.current,
      newProgress: newCurrent,
      completed,
      bonusEarned
    })

    const template = CHALLENGE_TEMPLATES.find(t => t.type === challenge.type)
    const progressText = template 
      ? template.progressText(Math.min(newCurrent, challenge.target), challenge.target)
      : `${Math.min(newCurrent, challenge.target)}/${challenge.target}`

    return {
      ...challenge,
      current: Math.min(newCurrent, challenge.target),
      completed,
      progressText
    }
  })

  return {
    updatedChallenges,
    updatedProgress: newProgress,
    roundUpdate: {
      roundNumber: result.roundNumber,
      challengeUpdates
    },
    totalBonus
  }
}
