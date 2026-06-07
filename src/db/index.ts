import { openDB } from 'idb'
import type { GameSession, RoundRecord, AchievementProfile } from '@/types'

const DB_NAME = 'prob-game-v2'
const DB_VERSION = 2

let dbPromise: Promise<any> | null = null

export async function initDB(): Promise<any> {
  if (dbPromise) return dbPromise

  try {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
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

        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains('achievement_profiles')) {
            const profileStore = db.createObjectStore('achievement_profiles', { keyPath: 'id' })
            profileStore.createIndex('sessionId', 'sessionId')
            profileStore.createIndex('completedAt', 'completedAt')
          }
        }
      }
    })
    return await dbPromise
  } catch (e) {
    console.error('DB init error:', e)
    dbPromise = null
    throw e
  }
}

export async function saveSession(session: GameSession): Promise<void> {
  try {
    const db = await initDB()
    await db.put('game_sessions', session)
  } catch (e) {
    console.error('saveSession error:', e)
  }
}

export async function getSession(id: string): Promise<GameSession | undefined> {
  try {
    const db = await initDB()
    return await db.get('game_sessions', id)
  } catch (e) {
    return undefined
  }
}

export async function getLatestSession(): Promise<GameSession | undefined> {
  try {
    const db = await initDB()
    const sessions = await db.getAllFromIndex('game_sessions', 'createdAt')
    return sessions[sessions.length - 1]
  } catch (e) {
    return undefined
  }
}

export async function getAllSessions(): Promise<GameSession[]> {
  try {
    const db = await initDB()
    return await db.getAllFromIndex('game_sessions', 'createdAt')
  } catch (e) {
    return []
  }
}

export async function saveRoundRecord(record: RoundRecord): Promise<void> {
  try {
    const db = await initDB()
    await db.put('round_records', record)
  } catch (e) {
    console.error('saveRoundRecord error:', e)
  }
}

export async function deleteRoundRecord(id: string): Promise<void> {
  try {
    const db = await initDB()
    await db.delete('round_records', id)
  } catch (e) {
    console.error('deleteRoundRecord error:', e)
  }
}

export async function getRoundRecordsBySession(sessionId: string): Promise<RoundRecord[]> {
  try {
    const db = await initDB()
    const records = await db.getAllFromIndex('round_records', 'sessionId', sessionId)
    return records.sort((a: RoundRecord, b: RoundRecord) => a.roundNumber - b.roundNumber)
  } catch (e) {
    return []
  }
}

export async function deleteSession(id: string): Promise<void> {
  try {
    const db = await initDB()
    const records = await getRoundRecordsBySession(id)
    const tx = db.transaction(['game_sessions', 'round_records'], 'readwrite')
    
    for (const record of records) {
      await tx.objectStore('round_records').delete(record.id)
    }
    
    await tx.objectStore('game_sessions').delete(id)
    await tx.done
  } catch (e) {
    console.error('deleteSession error:', e)
  }
}

export async function clearAllData(): Promise<void> {
  try {
    const db = await initDB()
    const tx = db.transaction(['game_sessions', 'round_records', 'achievement_profiles'], 'readwrite')
    await tx.objectStore('game_sessions').clear()
    await tx.objectStore('round_records').clear()
    if (db.objectStoreNames.contains('achievement_profiles')) {
      await tx.objectStore('achievement_profiles').clear()
    }
    await tx.done
  } catch (e) {
    console.error('clearAllData error:', e)
  }
}

export async function saveAchievementProfile(profile: AchievementProfile): Promise<void> {
  try {
    const db = await initDB()
    await db.put('achievement_profiles', profile)
  } catch (e) {
    console.error('saveAchievementProfile error:', e)
  }
}

export async function getAchievementProfileBySession(sessionId: string): Promise<AchievementProfile | undefined> {
  try {
    const db = await initDB()
    const profiles = await db.getAllFromIndex('achievement_profiles', 'sessionId', sessionId)
    return profiles[0]
  } catch (e) {
    return undefined
  }
}

export async function getLatestAchievementProfile(): Promise<AchievementProfile | undefined> {
  try {
    const db = await initDB()
    const profiles = await db.getAllFromIndex('achievement_profiles', 'completedAt')
    return profiles[profiles.length - 1]
  } catch (e) {
    return undefined
  }
}

export async function getAllAchievementProfiles(): Promise<AchievementProfile[]> {
  try {
    const db = await initDB()
    const profiles = await db.getAllFromIndex('achievement_profiles', 'completedAt')
    return profiles.reverse()
  } catch (e) {
    return []
  }
}

export async function deleteAchievementProfile(id: string): Promise<void> {
  try {
    const db = await initDB()
    await db.delete('achievement_profiles', id)
  } catch (e) {
    console.error('deleteAchievementProfile error:', e)
  }
}
