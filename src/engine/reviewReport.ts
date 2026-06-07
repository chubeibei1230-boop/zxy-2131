import type {
  RoundRecord,
  ChallengeTarget,
  ReviewReport,
  RoundReviewDetail,
  RiskAnalysis,
  StrategyAdvice
} from '@/types'
import { generateId } from './settlement'
import { calculateRank } from './achievement'

function generateRoundDetails(records: RoundRecord[]): RoundReviewDetail[] {
  return records.map(record => {
    const queueCost = record.result.results.reduce((sum, r) => sum + Math.abs(r.queueWaitTime), 0)
    const totalReward = record.result.results.reduce((sum, r) => sum + Math.max(0, r.reward + r.queueWaitTime), 0)
    
    let hintHits = 0
    let hintMisses = 0
    for (const hint of record.hints) {
      if (hint.impact.activityId) {
        const selectedActivity = record.selectedActivities.find(a => a.id === hint.impact.activityId)
        if (selectedActivity) {
          const result = record.result.results.find(r => r.activityId === hint.impact.activityId)
          if (result) {
            if (hint.type === 'crowd' || hint.type === 'queue') {
              hintHits++
            } else if (hint.type === 'reward' || hint.type === 'luck') {
              if (result.success) hintHits++
              else hintMisses++
            }
          }
        }
      }
    }

    const challengeContribution = record.challengeUpdates?.challengeUpdates
      .filter(u => u.bonusEarned > 0)
      .reduce((sum, u) => sum + u.bonusEarned, 0) || 0

    return {
      roundNumber: record.roundNumber,
      selectedActivities: record.selectedActivities,
      hints: record.hints,
      results: record.result.results,
      scoreDelta: record.scoreDelta,
      queueCost,
      totalReward,
      challengeContribution,
      hintHits,
      hintMisses,
      timestamp: record.timestamp
    }
  })
}

function findBestRound(details: RoundReviewDetail[]) {
  if (details.length === 0) {
    return { roundNumber: 0, scoreDelta: 0, reason: '暂无数据' }
  }
  const best = details.reduce((prev, curr) => curr.scoreDelta > prev.scoreDelta ? curr : prev)
  const reasons: string[] = []
  if (best.totalReward > 100) reasons.push('奖励丰厚')
  if (best.hintHits > 0) reasons.push('善用情报')
  if (best.challengeContribution > 0) reasons.push('挑战加成')
  if (best.queueCost < 20) reasons.push('成本控制优秀')
  
  return {
    roundNumber: best.roundNumber,
    scoreDelta: best.scoreDelta,
    reason: reasons.length > 0 ? reasons.join('、') : '综合表现最佳'
  }
}

function findWorstRound(details: RoundReviewDetail[]) {
  if (details.length === 0) {
    return { roundNumber: 0, scoreDelta: 0, reason: '暂无数据' }
  }
  const worst = details.reduce((prev, curr) => curr.scoreDelta < prev.scoreDelta ? curr : prev)
  const reasons: string[] = []
  if (worst.queueCost > 50) reasons.push('排队成本过高')
  if (worst.results.filter(r => !r.success).length >= 2) reasons.push('多次失败')
  if (worst.hintMisses > 0) reasons.push('情报误判')
  if (worst.selectedActivities.length > 2) reasons.push('选择过于分散')
  
  return {
    roundNumber: worst.roundNumber,
    scoreDelta: worst.scoreDelta,
    reason: reasons.length > 0 ? reasons.join('、') : '运气不佳'
  }
}

function analyzeRisk(records: RoundRecord[]): RiskAnalysis {
  let lowRiskCount = 0
  let mediumRiskCount = 0
  let highRiskCount = 0
  let totalActivities = 0
  let totalRiskScore = 0

  for (const record of records) {
    for (const activity of record.selectedActivities) {
      totalActivities++
      totalRiskScore += activity.riskLevel
      if (activity.riskLevel === 1) lowRiskCount++
      else if (activity.riskLevel === 2) mediumRiskCount++
      else highRiskCount++
    }
  }

  const lowRiskRatio = totalActivities > 0 ? lowRiskCount / totalActivities : 0
  const mediumRiskRatio = totalActivities > 0 ? mediumRiskCount / totalActivities : 0
  const highRiskRatio = totalActivities > 0 ? highRiskCount / totalActivities : 0
  const averageRiskScore = totalActivities > 0 ? totalRiskScore / totalActivities : 0

  let riskLevel: 'conservative' | 'balanced' | 'aggressive' = 'balanced'
  let label = '平衡型'
  let description = '在风险与收益之间保持着良好的平衡'

  if (highRiskRatio >= 0.6) {
    riskLevel = 'aggressive'
    label = '激进型'
    description = '偏好高风险高回报的活动，追求极致收益'
  } else if (lowRiskRatio >= 0.6) {
    riskLevel = 'conservative'
    label = '保守型'
    description = '倾向于选择低风险活动，追求稳定收益'
  }

  return {
    riskLevel,
    label,
    description,
    lowRiskRatio: Math.round(lowRiskRatio * 100),
    mediumRiskRatio: Math.round(mediumRiskRatio * 100),
    highRiskRatio: Math.round(highRiskRatio * 100),
    averageRiskScore: Math.round(averageRiskScore * 10) / 10
  }
}

function generateStrategyAdvices(
  records: RoundRecord[],
  details: RoundReviewDetail[],
  challenges: ChallengeTarget[],
  riskAnalysis: RiskAnalysis
): StrategyAdvice[] {
  const advices: StrategyAdvice[] = []
  
  const totalQueueCost = details.reduce((sum, d) => sum + d.queueCost, 0)
  const avgQueueCost = details.length > 0 ? totalQueueCost / details.length : 0
  
  if (avgQueueCost > 40) {
    advices.push({
      id: generateId(),
      type: 'warning',
      title: '控制排队成本',
      description: `平均每轮排队成本 ${Math.round(avgQueueCost)} 分，偏高`,
      actionable: '尝试选择排队人数较少的时段，或减少同时参与的活动数量'
    })
  } else if (avgQueueCost < 15) {
    advices.push({
      id: generateId(),
      type: 'success',
      title: '成本控制优秀',
      description: '排队成本控制在较低水平',
      actionable: '继续保持这种精打细算的策略'
    })
  }

  const completedChallenges = challenges.filter(c => c.completed).length
  if (completedChallenges === 0 && challenges.length > 0) {
    advices.push({
      id: generateId(),
      type: 'warning',
      title: '关注挑战目标',
      description: '本局未完成任何挑战，损失了额外奖励',
      actionable: '选择活动时优先考虑能推进挑战进度的选项'
    })
  } else if (completedChallenges >= challenges.length * 0.6) {
    advices.push({
      id: generateId(),
      type: 'success',
      title: '挑战达人',
      description: `完成了 ${completedChallenges}/${challenges.length} 个挑战`,
      actionable: '挑战策略非常棒，继续保持对目标的专注'
    })
  }

  const totalHintHits = details.reduce((sum, d) => sum + d.hintHits, 0)
  const totalHintMisses = details.reduce((sum, d) => sum + d.hintMisses, 0)
  const hintAccuracy = totalHintHits + totalHintMisses > 0 
    ? totalHintHits / (totalHintHits + totalHintMisses) 
    : 0
  
  if (hintAccuracy >= 0.7 && totalHintHits + totalHintMisses >= 3) {
    advices.push({
      id: generateId(),
      type: 'success',
      title: '情报大师',
      description: `提示情报命中率达到 ${Math.round(hintAccuracy * 100)}%`,
      actionable: '你非常善于利用情报做出决策，继续保持！'
    })
  } else if (hintAccuracy < 0.4 && totalHintHits + totalHintMisses >= 3) {
    advices.push({
      id: generateId(),
      type: 'info',
      title: '善用提示情报',
      description: '提示情报可以帮助你做出更明智的选择',
      actionable: '在选择活动前仔细阅读提示情报，分析其影响'
    })
  }

  if (riskAnalysis.riskLevel === 'aggressive') {
    advices.push({
      id: generateId(),
      type: 'info',
      title: '适度分散风险',
      description: '当前策略偏激进，高风险活动占比较高',
      actionable: '可以适当搭配一些中低风险活动来平衡整体收益'
    })
  } else if (riskAnalysis.riskLevel === 'conservative') {
    advices.push({
      id: generateId(),
      type: 'info',
      title: '尝试突破',
      description: '当前策略偏保守，收益上限可能受限',
      actionable: '可以适当尝试一些高风险活动，追求更高的收益上限'
    })
  }

  const bestRound = findBestRound(details)
  if (bestRound.roundNumber > 0) {
    const bestDetail = details.find(d => d.roundNumber === bestRound.roundNumber)
    if (bestDetail && bestDetail.selectedActivities.length <= 2) {
      advices.push({
        id: generateId(),
        type: 'success',
        title: '少而精策略有效',
        description: '表现最好的轮次只选择了少数活动',
        actionable: '精选1-2个高质量活动往往比贪多效果更好'
      })
    }
  }

  return advices.slice(0, 5)
}

function generateSummary(
  rank: { title: string; stars: number },
  bestRound: { roundNumber: number; scoreDelta: number; reason: string },
  worstRound: { roundNumber: number; scoreDelta: number; reason: string },
  riskAnalysis: RiskAnalysis,
  overallStats: { successRate: number; hintAccuracy: number }
): string {
  const parts: string[] = []

  parts.push(`本局荣获「${rank.title}」称号，展现了${rank.stars}星实力。`)
  
  if (bestRound.roundNumber > 0) {
    parts.push(`第${bestRound.roundNumber}轮表现最佳，单轮斩获${bestRound.scoreDelta}分，`)
    parts.push(`得益于${bestRound.reason}。`)
  }
  
  if (worstRound.roundNumber > 0 && worstRound.scoreDelta < 0) {
    parts.push(`第${worstRound.roundNumber}轮有所失利，`)
    parts.push(`主要原因是${worstRound.reason}。`)
  }

  parts.push(`整体风险偏好为${riskAnalysis.label}，`)
  
  if (overallStats.successRate >= 0.6) {
    parts.push(`整体成功率达到${Math.round(overallStats.successRate * 100)}%，表现稳定。`)
  } else {
    parts.push(`整体成功率为${Math.round(overallStats.successRate * 100)}%，仍有提升空间。`)
  }

  return parts.join('')
}

export function generateReviewReport(
  sessionId: string,
  totalScore: number,
  maxRounds: number,
  records: RoundRecord[],
  challenges: ChallengeTarget[],
  challengeBonus: number
): ReviewReport {
  const rank = calculateRank(totalScore)
  const roundDetails = generateRoundDetails(records)
  const bestRound = findBestRound(roundDetails)
  const worstRound = findWorstRound(roundDetails)
  const riskAnalysis = analyzeRisk(records)

  const totalQueueCost = roundDetails.reduce((sum, d) => sum + d.queueCost, 0)
  const totalReward = roundDetails.reduce((sum, d) => sum + d.totalReward, 0)
  
  let totalSuccess = 0
  let totalAttempts = 0
  for (const detail of roundDetails) {
    for (const result of detail.results) {
      totalAttempts++
      if (result.success) totalSuccess++
    }
  }
  const successRate = totalAttempts > 0 ? totalSuccess / totalAttempts : 0

  const totalHintHits = roundDetails.reduce((sum, d) => sum + d.hintHits, 0)
  const totalHintMisses = roundDetails.reduce((sum, d) => sum + d.hintMisses, 0)
  const hintAccuracy = totalHintHits + totalHintMisses > 0 
    ? totalHintHits / (totalHintHits + totalHintMisses) 
    : 0

  const overallStats = {
    totalQueueCost,
    totalReward,
    totalChallengeBonus: challengeBonus,
    successRate,
    averageScorePerRound: records.length > 0 ? Math.round(totalScore / records.length) : 0,
    hintAccuracy: Math.round(hintAccuracy * 100)
  }

  const challengeList = challenges.map(c => ({
    title: c.title,
    completed: c.completed,
    bonus: c.completed ? c.bonus : 0,
    contributionPercent: challengeBonus > 0 && c.completed 
      ? Math.round((c.bonus / challengeBonus) * 100) 
      : 0
  }))

  const strategyAdvices = generateStrategyAdvices(records, roundDetails, challenges, riskAnalysis)

  const summary = generateSummary(rank, bestRound, worstRound, riskAnalysis, overallStats)

  return {
    id: generateId(),
    sessionId,
    totalScore,
    rank,
    totalRounds: maxRounds,
    completedAt: new Date().toISOString(),
    overallStats,
    roundDetails,
    bestRound,
    worstRound,
    challengeAnalysis: {
      total: challenges.length,
      completed: challenges.filter(c => c.completed).length,
      bonus: challengeBonus,
      list: challengeList
    },
    riskAnalysis,
    strategyAdvices,
    summary
  }
}
