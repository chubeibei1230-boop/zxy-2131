import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameState, RoundRecord, Activity, UserRole, GameSession } from '@/types'
import { getRandomActivities } from '@/engine/activities'
import { generateHints } from '@/engine/probability'
import { settleRound, generateId } from '@/engine/settlement'
import { generateRandomChallenges, createInitialChallengeProgress, updateChallengesProgress } from '@/engine/challenges'
import { 
  saveSession, 
  saveRoundRecord, 
  getRoundRecordsBySession, 
  deleteRoundRecord,
  getLatestSession,
} from '@/db'

const MAX_ROUNDS = 10
const MAX_SELECTED = 3

function createInitialState(): GameState {
  const sessionId = generateId()
  const activities = getRandomActivities(4)
  const hints = generateHints(activities, 2)
  const challenges = generateRandomChallenges(3)
  const challengeProgress = createInitialChallengeProgress()

  return {
    sessionId,
    totalScore: 0,
    currentRound: 1,
    maxRounds: MAX_ROUNDS,
    selectedActivities: [],
    availableActivities: activities,
    hints,
    currentResult: null,
    queueLength: Math.floor(Math.random() * 10) + 3,
    rewardPool: Math.floor(Math.random() * 200) + 100,
    phase: 'selecting',
    currentRole: 'player',
    challenges,
    challengeProgress,
    challengeBonus: 0
  }
}

interface HistoryEntry {
  state: GameState
  roundRecord?: RoundRecord
}

export const useGameStore = defineStore('game', () => {
  const past = ref<HistoryEntry[]>([])
  const present = ref<GameState>(createInitialState())
  const future = ref<HistoryEntry[]>([])
  const roundRecords = ref<RoundRecord[]>([])
  const lastRecordId = ref<string | null>(null)
  const isInitialized = ref(false)

  const canUndo = computed(() => past.value.length > 0 && present.value.phase !== 'gameover')
  const canRedo = computed(() => future.value.length > 0)

  function saveToHistory() {
    const lastRecord = roundRecords.value.length > 0 
      ? JSON.parse(JSON.stringify(roundRecords.value[roundRecords.value.length - 1])) 
      : undefined
    past.value.push({
      state: JSON.parse(JSON.stringify(present.value)),
      roundRecord: lastRecord
    })
    future.value = []
    if (past.value.length > 20) {
      past.value.shift()
    }
  }

  async function undo() {
    if (!canUndo.value) return
    
    const lastRecord = roundRecords.value.length > 0 
      ? JSON.parse(JSON.stringify(roundRecords.value[roundRecords.value.length - 1])) 
      : undefined
    future.value.unshift({
      state: JSON.parse(JSON.stringify(present.value)),
      roundRecord: lastRecord
    })
    
    const prevEntry = past.value.pop()!
    
    if (present.value.phase === 'result' && lastRecordId.value) {
      await deleteRoundRecord(lastRecordId.value)
      roundRecords.value.pop()
      lastRecordId.value = null
    }
    
    present.value = prevEntry.state
    await updateSessionInDB()
  }

  async function redo() {
    if (!canRedo.value) return
    
    const lastRecord = roundRecords.value.length > 0 
      ? JSON.parse(JSON.stringify(roundRecords.value[roundRecords.value.length - 1])) 
      : undefined
    past.value.push({
      state: JSON.parse(JSON.stringify(present.value)),
      roundRecord: lastRecord
    })
    
    const nextEntry = future.value.shift()!
    
    present.value = nextEntry.state
    
    if (nextEntry.roundRecord && present.value.phase === 'result') {
      const recordExists = roundRecords.value.some(r => r.id === nextEntry.roundRecord!.id)
      if (!recordExists) {
        roundRecords.value.push(nextEntry.roundRecord)
        lastRecordId.value = nextEntry.roundRecord.id
        await saveRoundRecord(nextEntry.roundRecord)
      }
    }
    
    await updateSessionInDB()
  }

  function toggleActivity(activity: Activity) {
    if (present.value.phase !== 'selecting') return
    if (present.value.currentRole !== 'player') return

    const index = present.value.selectedActivities.findIndex(a => a.id === activity.id)
    
    if (index > -1) {
      present.value.selectedActivities.splice(index, 1)
    } else if (present.value.selectedActivities.length < MAX_SELECTED) {
      present.value.selectedActivities.push(activity)
    }
  }

  function isSelected(activityId: string): boolean {
    return present.value.selectedActivities.some(a => a.id === activityId)
  }

  function setRole(role: UserRole) {
    present.value.currentRole = role
  }

  async function confirmSelection() {
    if (present.value.selectedActivities.length === 0) return
    if (present.value.phase !== 'selecting') return
    if (present.value.currentRole !== 'player') return

    saveToHistory()

    const result = settleRound(
      present.value.currentRound,
      present.value.selectedActivities,
      present.value.hints,
      present.value.queueLength,
      present.value.rewardPool
    )

    const { updatedChallenges, updatedProgress, roundUpdate, totalBonus } = updateChallengesProgress(
      present.value.challenges,
      present.value.challengeProgress,
      present.value.selectedActivities,
      result,
      present.value.queueLength
    )

    present.value.currentResult = result
    present.value.totalScore += result.totalReward + totalBonus
    present.value.challengeBonus += totalBonus
    present.value.challenges = updatedChallenges
    present.value.challengeProgress = updatedProgress
    present.value.phase = 'result'

    const record: RoundRecord = {
      id: generateId(),
      sessionId: present.value.sessionId,
      roundNumber: present.value.currentRound,
      selectedActivities: JSON.parse(JSON.stringify(present.value.selectedActivities)),
      hints: JSON.parse(JSON.stringify(present.value.hints)),
      result,
      scoreDelta: result.totalReward + totalBonus,
      timestamp: new Date().toISOString(),
      challengeUpdates: roundUpdate
    }

    roundRecords.value.push(record)
    lastRecordId.value = record.id
    await saveRoundRecord(record)
    await updateSessionInDB()
  }

  async function nextRound() {
    if (present.value.phase !== 'result') return

    if (present.value.currentRound >= present.value.maxRounds) {
      present.value.phase = 'gameover'
      lastRecordId.value = null
      await updateSessionInDB()
      return
    }

    saveToHistory()

    present.value.currentRound += 1
    present.value.selectedActivities = []
    present.value.availableActivities = getRandomActivities(4)
    present.value.hints = generateHints(present.value.availableActivities, 2)
    present.value.currentResult = null
    present.value.queueLength = Math.floor(Math.random() * 10) + 3
    present.value.rewardPool = Math.floor(Math.random() * 200) + 100
    present.value.phase = 'selecting'
    lastRecordId.value = null

    await updateSessionInDB()
  }

  async function startNewGame() {
    past.value = []
    future.value = []
    present.value = createInitialState()
    roundRecords.value = []
    lastRecordId.value = null
    isInitialized.value = true

    await saveSession({
      id: present.value.sessionId,
      totalScore: 0,
      currentRound: 1,
      maxRounds: MAX_ROUNDS,
      queueLength: present.value.queueLength,
      rewardPool: present.value.rewardPool,
      hints: present.value.hints,
      availableActivities: present.value.availableActivities,
      selectedActivities: [],
      currentResult: null,
      phase: 'selecting',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      challenges: present.value.challenges,
      challengeProgress: present.value.challengeProgress,
      challengeBonus: 0
    })
  }

  async function updateSessionInDB() {
    await saveSession({
      id: present.value.sessionId,
      totalScore: present.value.totalScore,
      currentRound: present.value.currentRound,
      maxRounds: present.value.maxRounds,
      queueLength: present.value.queueLength,
      rewardPool: present.value.rewardPool,
      hints: present.value.hints,
      availableActivities: present.value.availableActivities,
      selectedActivities: present.value.selectedActivities,
      currentResult: present.value.currentResult,
      phase: present.value.phase,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      challenges: present.value.challenges,
      challengeProgress: present.value.challengeProgress,
      challengeBonus: present.value.challengeBonus
    })
  }

  async function loadRoundRecords() {
    const records = await getRoundRecordsBySession(present.value.sessionId)
    roundRecords.value = records
    if (records.length > 0) {
      lastRecordId.value = records[records.length - 1].id
    }
  }

  async function restoreFromDB() {
    try {
      const latest = await getLatestSession()
      
      if (latest && latest.phase !== 'gameover') {
        const records = await getRoundRecordsBySession(latest.id)
        
        present.value = {
          sessionId: latest.id,
          totalScore: latest.totalScore || 0,
          currentRound: latest.currentRound || 1,
          maxRounds: latest.maxRounds || MAX_ROUNDS,
          selectedActivities: latest.selectedActivities || [],
          availableActivities: latest.availableActivities || getRandomActivities(4),
          hints: latest.hints || generateHints(getRandomActivities(4), 2),
          currentResult: latest.currentResult || null,
          queueLength: latest.queueLength || Math.floor(Math.random() * 10) + 3,
          rewardPool: latest.rewardPool || Math.floor(Math.random() * 200) + 100,
          phase: latest.phase || 'selecting',
          currentRole: 'player',
          challenges: latest.challenges || generateRandomChallenges(3),
          challengeProgress: latest.challengeProgress || createInitialChallengeProgress(),
          challengeBonus: latest.challengeBonus || 0
        }
        
        roundRecords.value = records
        if (records.length > 0 && latest.phase === 'result') {
          lastRecordId.value = records[records.length - 1].id
        }
      } else {
        await startNewGame()
      }
    } catch (e) {
      console.error('Restore from DB failed:', e)
      await startNewGame()
    }
    
    isInitialized.value = true
  }

  async function initGame() {
    if (!isInitialized.value) {
      await restoreFromDB()
    }
  }

  return {
    past,
    present,
    future,
    roundRecords,
    isInitialized,
    canUndo,
    canRedo,
    undo,
    redo,
    toggleActivity,
    isSelected,
    setRole,
    confirmSelection,
    nextRound,
    startNewGame,
    loadRoundRecords,
    initGame
  }
})
