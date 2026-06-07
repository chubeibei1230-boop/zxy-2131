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
}

export interface GameSession {
  id: string
  totalScore: number
  currentRound: number
  maxRounds: number
  createdAt: string
  updatedAt: string
}

export interface HistoryState {
  past: GameState[]
  present: GameState
  future: GameState[]
}
