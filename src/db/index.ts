import { openDB } from 'idb'
import type { GameSession, RoundRecord } from '@/types'

const DB_NAME = 'probability-game-db'
const DB_VERSION = 1

let dbPromise: Promise<any> | null = null

export function initDB(): Promise<any> {
  if (dbPromise) return dbPromise

  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('game_sessions')) {
        const sessionStore = db.createObjectStore('game_sessions', { keyPath: 'id' })
        sessionStore.createIndex('createdAt', 'createdAt')
      }

      if (!db.objectStoreNames.contains('round_records')) {
        const recordStore = db.createObjectStore('round_records', { keyPath: 'id' })
        recordStore.createIndex('sessionId', 'sessionId')
        recordStore.createIndex('roundNumber', 'roundNumber')
        recordStore.createIndex('timestamp', 'timestamp')
      }
    }
  })

  return dbPromise
}

export async function saveSession(session: GameSession): Promise<void> {
  const db = await initDB()
  await db.put('game_sessions', session)
}

export async function getSession(id: string): Promise<GameSession | undefined> {
  const db = await initDB()
  return db.get('game_sessions', id)
}

export async function getAllSessions(): Promise<GameSession[]> {
  const db = await initDB()
  return db.getAllFromIndex('game_sessions', 'createdAt')
}

export async function saveRoundRecord(record: RoundRecord): Promise<void> {
  const db = await initDB()
  await db.put('round_records', record)
}

export async function getRoundRecordsBySession(sessionId: string): Promise<RoundRecord[]> {
  const db = await initDB()
  const records = await db.getAllFromIndex('round_records', 'sessionId')
  return records.sort((a: RoundRecord, b: RoundRecord) => a.roundNumber - b.roundNumber)
}

export async function deleteSession(id: string): Promise<void> {
  const db = await initDB()
  const records = await getRoundRecordsBySession(id)
  const tx = db.transaction(['game_sessions', 'round_records'], 'readwrite')
  
  for (const record of records) {
    await tx.objectStore('round_records').delete(record.id)
  }
  
  await tx.objectStore('game_sessions').delete(id)
  await tx.done
}

export async function clearAllData(): Promise<void> {
  const db = await initDB()
  const tx = db.transaction(['game_sessions', 'round_records'], 'readwrite')
  await tx.objectStore('game_sessions').clear()
  await tx.objectStore('round_records').clear()
  await tx.done
}
