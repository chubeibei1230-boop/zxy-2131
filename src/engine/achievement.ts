import type {
  RoundRecord,
  ChallengeTarget,
  AchievementProfile,
  PartialAchievementProgress,
  StrategyTag,
  TendencyType
} from '@/types'
import { generateId } from './settlement'

export function calculateRank(score: number) {
  if (score >= 2000) return { title: '传奇大师', stars: 5, color: '#FDCB6E' }
  if (score >= 1500) return { title: '概率专家', stars: 4, color: '#A29BFE' }
  if (score >= 1000) return { title: '策略达人', stars: 3, color: '#00CEC9' }
  if (score >= 500) return { title: '初级玩家', stars: 2, color: '#74B9FF' }
  return { title: '新手上路', stars: 1, color: '#B2BEC3' }
}

function calculateHighestProfitRound(records: RoundRecord[]) {
  if (records.length === 0) {
    return { roundNumber: 0, profit: 0 }
  }
  let highest = records[0]
  for (const record of records) {
    if (record.scoreDelta > highest.scoreDelta) {
      highest = record
    }
  }
  return {
    roundNumber: highest.roundNumber,
    profit: highest.scoreDelta
  }
}

function calculateTendency(records: RoundRecord[]): { type: TendencyType; label: string; description: string } {
  if (records.length === 0) {
    return { type: 'balanced', label: '初出茅庐', description: '刚开始游戏，尚未形成明显的风格' }
  }

  let successRounds = 0
  let failureRounds = 0

  for (const record of records) {
    const activityResults = record.result.results
    const successful = activityResults.filter(r => r.success).length
    const total = activityResults.length
    if (total > 0) {
      const successRate = successful / total
      if (successRate >= 0.6) successRounds++
      else if (successRate <= 0.4) failureRounds++
    }
  }

  const totalAnalyzed = successRounds + failureRounds
  if (totalAnalyzed === 0) {
    return { type: 'balanced', label: '稳扎稳打', description: '每一轮都保持着平衡的表现' }
  }

  const successRatio = successRounds / totalAnalyzed
  if (successRatio >= 0.65) {
    return { type: 'success', label: '常胜将军', description: '成功率极高，擅长稳操胜券的策略' }
  } else if (successRatio <= 0.35) {
    return { type: 'failure', label: '屡败屡战', description: '虽然失败较多，但从不放弃，终将逆袭' }
  }
  return { type: 'balanced', label: '起伏有致', description: '胜负交替，在波动中寻找最佳策略' }
}

function calculatePreferredActivityTypes(records: RoundRecord[]) {
  const categoryCount: Record<string, number> = {}
  let total = 0

  for (const record of records) {
    for (const activity of record.selectedActivities) {
      categoryCount[activity.category] = (categoryCount[activity.category] || 0) + 1
      total++
    }
  }

  const categoryLabels: Record<string, string> = {
    popular: '热门活动',
    normal: '常规活动',
    rare: '稀有活动'
  }

  return Object.entries(categoryCount)
    .map(([category, count]) => ({
      category: categoryLabels[category] || category,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)
}

function calculateStrategyTags(records: RoundRecord[], challenges: ChallengeTarget[]): StrategyTag[] {
  const tags: StrategyTag[] = []

  if (records.length === 0) return tags

  let lowRiskCount = 0
  let highRiskCount = 0
  let totalActivities = 0

  for (const record of records) {
    for (const activity of record.selectedActivities) {
      totalActivities++
      if (activity.riskLevel === 1) lowRiskCount++
      if (activity.riskLevel === 3) highRiskCount++
    }
  }

  if (totalActivities > 0) {
    const lowRiskRatio = lowRiskCount / totalActivities
    const highRiskRatio = highRiskCount / totalActivities

    if (lowRiskRatio >= 0.6) tags.push('保守型玩家')
    if (highRiskRatio >= 0.6) tags.push('激进型玩家')
    if (lowRiskRatio > 0.3 && lowRiskRatio < 0.6 && highRiskRatio > 0.3 && highRiskRatio < 0.6) {
      tags.push('平衡型玩家')
    }
  }

  const completedChallenges = challenges.filter(c => c.completed).length
  if (challenges.length > 0 && completedChallenges >= challenges.length * 0.6) {
    tags.push('挑战达人')
  }

  const categoryCounts: Record<string, number> = {}
  for (const record of records) {
    for (const activity of record.selectedActivities) {
      categoryCounts[activity.category] = (categoryCounts[activity.category] || 0) + 1
    }
  }
  const maxCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]
  if (maxCategory && totalActivities > 0 && maxCategory[1] / totalActivities >= 0.5) {
    tags.push('专精型')
  }

  const scores = records.map(r => r.scoreDelta)
  const earlyScores = scores.slice(0, Math.ceil(scores.length / 2))
  const lateScores = scores.slice(Math.floor(scores.length / 2))
  const earlyAvg = earlyScores.reduce((a, b) => a + b, 0) / Math.max(1, earlyScores.length)
  const lateAvg = lateScores.reduce((a, b) => a + b, 0) / Math.max(1, lateScores.length)
  if (lateAvg > earlyAvg * 1.5 && lateAvg > 0) {
    tags.push('逆袭者')
  }

  const highest = calculateHighestProfitRound(records)
  if (highest.profit >= 300) {
    tags.push('运气流')
  }

  const profitVariance = calculateVariance(scores)
  if (profitVariance < 1000 && scores.length >= 3) {
    tags.push('策略流')
  }

  return tags.slice(0, 4)
}

function calculateVariance(numbers: number[]): number {
  if (numbers.length === 0) return 0
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length
  const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2))
  return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length
}

function generateSummary(
  rank: { title: string; stars: number },
  tendency: { label: string; description: string },
  tags: StrategyTag[],
  highestProfit: { roundNumber: number; profit: number },
  completedChallenges: number,
  totalChallenges: number
): string {
  const summaries: string[] = []

  summaries.push(`本局荣获「${rank.title}」称号，展现了${rank.stars}星实力。`)

  if (highestProfit.roundNumber > 0 && highestProfit.profit > 0) {
    summaries.push(`第${highestProfit.roundNumber}轮表现最为亮眼，单轮斩获${highestProfit.profit}分！`)
  }

  if (tags.length > 0) {
    summaries.push(`被标记为「${tags.slice(0, 2).join('」「')}」，${tendency.description}。`)
  }

  if (totalChallenges > 0) {
    if (completedChallenges === totalChallenges) {
      summaries.push(`完美完成全部${totalChallenges}个挑战，堪称全才！`)
    } else if (completedChallenges > 0) {
      summaries.push(`完成了${completedChallenges}/${totalChallenges}个挑战，继续加油！`)
    }
  }

  return summaries.join(' ')
}

export function generateAchievementProfile(
  sessionId: string,
  totalScore: number,
  maxRounds: number,
  records: RoundRecord[],
  challenges: ChallengeTarget[],
  challengeBonus: number
): AchievementProfile {
  const rank = calculateRank(totalScore)
  const highestProfitRound = calculateHighestProfitRound(records)
  const tendency = calculateTendency(records)
  const preferredActivityTypes = calculatePreferredActivityTypes(records)
  const strategyTags = calculateStrategyTags(records, challenges)

  const challengeList = challenges.map(c => ({
    title: c.title,
    completed: c.completed,
    bonus: c.completed ? c.bonus : 0
  }))

  const completedChallenges = challenges.filter(c => c.completed).length

  const summary = generateSummary(
    rank,
    tendency,
    strategyTags,
    highestProfitRound,
    completedChallenges,
    challenges.length
  )

  return {
    id: generateId(),
    sessionId,
    totalScore,
    rank,
    challenges: {
      total: challenges.length,
      completed: completedChallenges,
      bonus: challengeBonus,
      list: challengeList
    },
    highestProfitRound,
    tendency,
    preferredActivityTypes,
    strategyTags,
    summary,
    totalRounds: maxRounds,
    completedAt: new Date().toISOString()
  }
}

export function calculatePartialProgress(
  currentRound: number,
  totalRounds: number,
  currentScore: number,
  records: RoundRecord[],
  challenges: ChallengeTarget[]
): PartialAchievementProgress {
  const projectedScore = currentRound > 0 
    ? Math.round((currentScore / currentRound) * totalRounds)
    : currentScore
  
  const projectedRank = calculateRank(projectedScore)
  const currentHighestProfitRound = calculateHighestProfitRound(records)
  
  const tendency = calculateTendency(records)
  const preferredTypes = calculatePreferredActivityTypes(records)
    .map(p => ({ category: p.category, count: p.count }))
  
  const emergingTags = calculateStrategyTags(records, challenges).slice(0, 2)
  
  const completed = challenges.filter(c => c.completed).length
  const inProgress = challenges.filter(c => !c.completed && c.current > 0).length

  return {
    currentRound,
    totalRounds,
    currentScore,
    projectedRank,
    challengesProgress: {
      total: challenges.length,
      completed,
      inProgress
    },
    currentHighestProfitRound,
    currentTendency: {
      type: tendency.type,
      label: tendency.label
    },
    currentPreferredTypes: preferredTypes,
    emergingTags
  }
}
