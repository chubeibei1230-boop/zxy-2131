import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameState, RoundRecord, Activity, RoundResult, ProbabilityHint } from '@/types'
import { getRandomActivities } from '@/engine/activities'
import { generateHints } from '@/engine/probability'
import { settleRound, generateId } from '@/engine/settlement'
import { saveSession, saveRoundRecord, getRoundRecordsBySession } from '@/db'

const MAX_ROUNDS = 10
const MAX_SELECTED = 3

function createInitialState(): GameState {
  const sessionId = generateId()
  const activities = getRandomActivities(4)
  const hints = generateHints(activities, 2)

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
    phase: 'selecting'
  }
}

export const useGameStore = defineStore('game', () => {
  const past = ref<GameState[]>([])
  const present = ref<GameState>(createInitialState())
  const future = ref<GameState[]>([])
  const roundRecords = ref<RoundRecord[]>([])

  const canUndo = computed(() => past.value.length > 0)
  const canRedo = computed(() => future.value.length > 0)

  function saveToHistory() {
    past.value.push(JSON.parse(JSON.stringify(present.value)))
    future.value = []
    if (past.value.length > 20) {
      past.value.shift()
    }
  }

  function undo() {
    if (!canUndo.value) return
    future.value.unshift(JSON.parse(JSON.stringify(present.value)))
    const prevState = past.value.pop()!
    present.value = prevState
  }

  function redo() {
    if (!canRedo.value) return
    past.value.push(JSON.parse(JSON.stringify(present.value)))
    const nextState = future.value.shift()!
    present.value = nextState
  }

  function toggleActivity(activity: Activity) {
    if (present.value.phase !== 'selecting') return

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

  function confirmSelection() {
    if (present.value.selectedActivities.length === 0) return
    if (present.value.phase !== 'selecting') return

    saveToHistory()

    const result = settleRound(
      present.value.currentRound,
      present.value.selectedActivities,
      present.value.hints
    )

    present.value.currentResult = result
    present.value.totalScore += result.totalReward
    present.value.phase = 'result'

    const record: RoundRecord = {
      id: generateId(),
      sessionId: present.value.sessionId,
      roundNumber: present.value.currentRound,
      selectedActivities: JSON.parse(JSON.stringify(present.value.selectedActivities)),
      hints: JSON.parse(JSON.stringify(present.value.hints)),
      result,
      scoreDelta: result.totalReward,
      timestamp: new Date().toISOString()
    }

    roundRecords.value.push(record)
    saveRoundRecord(record)

    updateSessionInDB()
  }

  function nextRound() {
    if (present.value.phase !== 'result') return

    if (present.value.currentRound >= present.value.maxRounds) {
      present.value.phase = 'gameover'
      updateSessionInDB()
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
  }

  function startNewGame() {
    past.value = []
    future.value = []
    present.value = createInitialState()
    roundRecords.value = []

    saveSession({
      id: present.value.sessionId,
      totalScore: 0,
      currentRound: 1,
      maxRounds: MAX_ROUNDS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  function updateSessionInDB() {
    saveSession({
      id: present.value.sessionId,
      totalScore: present.value.totalScore,
      currentRound: present.value.currentRound,
      maxRounds: present.value.maxRounds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  async function loadRoundRecords() {
    const records = await getRoundRecordsBySession(present.value.sessionId)
    roundRecords.value = records
  }

  return {
    past,
    present,
    future,
    roundRecords,
    canUndo,
    canRedo,
    undo,
    redo,
    toggleActivity,
    isSelected,
    confirmSelection,
    nextRound,
    startNewGame,
    loadRoundRecords
  }
})
