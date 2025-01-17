import { logMethodEntry, logMethodExit } from '@/lib/logger'

interface DbInsert {
  [key: string]: unknown
}

export function toDbFields<T extends Record<string, unknown>>(data: T): DbInsert {
  logMethodEntry('toDbFields', { data })
  const result: DbInsert = {}

  // Convert camelCase to snake_case for database fields
  Object.entries(data).forEach(([key, value]) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    result[snakeKey] = value
  })

  logMethodExit('toDbFields')
  return result
}

export function fromDbFields<T>(data: Record<string, unknown>): T {
  logMethodEntry('fromDbFields', { data })
  const result: Record<string, unknown> = {}

  // Convert snake_case to camelCase for TypeScript fields
  Object.entries(data).forEach(([key, value]) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    result[camelKey] = value
  })

  logMethodExit('fromDbFields')
  return result as T
} 