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
