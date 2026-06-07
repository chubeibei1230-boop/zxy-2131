export type UserRole = 'player' | 'hint' | 'settlement'

export interface Activity {
  id: string
  name: string
  description: string
  baseProbability: number
  baseReward: number
  riskLevel: 1 | 2 | 3
  category: 'popular' | 'normal' | 'rare'
  icon: string
}

export interface ProbabilityHint {
  id: string
  type: 'crowd' | 'reward' | 'luck' | 'queue'
  title: string
  description: string
  impact: {
    activityId?: string
    probabilityDelta?: number
    rewardDelta?: number
    queuePenalty?: number
  }
  hidden?: boolean
}

export interface ActivityResult {
  activityId: string
  success: boolean
  actualProbability: number
  reward: number
  queueWaitTime: number
}

export interface RoundResult {
  roundNumber: number
  totalReward: number
  results: ActivityResult[]
  events: string[]
}

export type ChallengeType = 
  | 'consecutive_low_risk'
  | 'high_crowd_profit'
  | 'single_round_reward'
  | 'total_high_risk'
  | 'perfect_rounds'
  | 'no_failure_streak'
  | 'specific_activity'
  | 'queue_length_strategy'

export interface ChallengeTarget {
  id: string
  type: ChallengeType
  title: string
  description: string
  target: number
  current: number
  completed: boolean
  bonus: number
  progressText: string
}

export interface ChallengeProgress {
  consecutiveLowRiskCount: number
  consecutiveNoFailureCount: number
  highRiskActivityCount: number
  perfectRoundCount: number
  activityCounts: Record<string, number>
}

export interface RoundChallengeUpdate {
  roundNumber: number
  challengeUpdates: {
    challengeId: string
    challengeTitle: string
    challengeDescription: string
    previousProgress: number
    newProgress: number
    completed: boolean
    bonusEarned: number
  }[]
}

export interface GameState {
  sessionId: string
  totalScore: number
  currentRound: number
  maxRounds: number
  selectedActivities: Activity[]
  availableActivities: Activity[]
  hints: ProbabilityHint[]
  currentResult: RoundResult | null
  queueLength: number
  rewardPool: number
  phase: 'selecting' | 'result' | 'gameover'
  currentRole: UserRole
  challenges: ChallengeTarget[]
  challengeProgress: ChallengeProgress
  challengeBonus: number
}

export interface RoundRecord {
  id: string
  sessionId: string
  roundNumber: number
  selectedActivities: Activity[]
  hints: ProbabilityHint[]
  result: RoundResult
  scoreDelta: number
  timestamp: string
  challengeUpdates?: RoundChallengeUpdate
}

export interface GameSession {
  id: string
  totalScore: number
  currentRound: number
  maxRounds: number
  queueLength: number
  rewardPool: number
  hints: ProbabilityHint[]
  availableActivities: Activity[]
  selectedActivities: Activity[]
  currentResult: RoundResult | null
  phase: 'selecting' | 'result' | 'gameover'
  createdAt: string
  updatedAt: string
  challenges?: ChallengeTarget[]
  challengeProgress?: ChallengeProgress
  challengeBonus?: number
}

export interface HistoryState {
  past: GameState[]
  present: GameState
  future: GameState[]
}

export type StrategyTag = 
  | '保守型玩家'
  | '激进型玩家'
  | '平衡型玩家'
  | '运气流'
  | '策略流'
  | '专精型'
  | '挑战达人'
  | '逆袭者'

export type TendencyType = 'success' | 'failure' | 'balanced'

export interface AchievementProfile {
  id: string
  sessionId: string
  totalScore: number
  rank: {
    title: string
    stars: number
    color: string
  }
  challenges: {
    total: number
    completed: number
    bonus: number
    list: {
      title: string
      completed: boolean
      bonus: number
    }[]
  }
  highestProfitRound: {
    roundNumber: number
    profit: number
  }
  tendency: {
    type: TendencyType
    label: string
    description: string
  }
  preferredActivityTypes: {
    category: string
    count: number
    percentage: number
  }[]
  strategyTags: StrategyTag[]
  summary: string
  totalRounds: number
  completedAt: string
}

export interface PartialAchievementProgress {
  currentRound: number
  totalRounds: number
  currentScore: number
  projectedRank: {
    title: string
    stars: number
    color: string
  }
  challengesProgress: {
    total: number
    completed: number
    inProgress: number
  }
  currentHighestProfitRound: {
    roundNumber: number
    profit: number
  }
  currentTendency: {
    type: TendencyType
    label: string
  }
  currentPreferredTypes: {
    category: string
    count: number
  }[]
  emergingTags: StrategyTag[]
}

export interface RoundReviewDetail {
  roundNumber: number
  selectedActivities: Activity[]
  hints: ProbabilityHint[]
  results: ActivityResult[]
  scoreDelta: number
  queueCost: number
  totalReward: number
  challengeContribution: number
  hintHits: number
  hintMisses: number
  timestamp: string
}

export interface RiskAnalysis {
  riskLevel: 'conservative' | 'balanced' | 'aggressive'
  label: string
  description: string
  lowRiskRatio: number
  mediumRiskRatio: number
  highRiskRatio: number
  averageRiskScore: number
}

export interface StrategyAdvice {
  id: string
  type: 'success' | 'warning' | 'info'
  title: string
  description: string
  actionable: string
}

export interface ReviewReport {
  id: string
  sessionId: string
  totalScore: number
  rank: {
    title: string
    stars: number
    color: string
  }
  totalRounds: number
  completedAt: string
  overallStats: {
    totalQueueCost: number
    totalReward: number
    totalChallengeBonus: number
    successRate: number
    averageScorePerRound: number
    hintAccuracy: number
  }
  roundDetails: RoundReviewDetail[]
  bestRound: {
    roundNumber: number
    scoreDelta: number
    reason: string
  }
  worstRound: {
    roundNumber: number
    scoreDelta: number
    reason: string
  }
  challengeAnalysis: {
    total: number
    completed: number
    bonus: number
    list: {
      title: string
      completed: boolean
      bonus: number
      contributionPercent: number
    }[]
  }
  riskAnalysis: RiskAnalysis
  strategyAdvices: StrategyAdvice[]
  summary: string
}
