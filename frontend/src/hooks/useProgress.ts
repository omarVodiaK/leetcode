import { useState, useCallback } from 'react'
import type { Progress, SolveStatus } from '../types'

const STORAGE_KEY = 'sre-trainer-progress'

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(loadProgress)

  const updateStatus = useCallback((questionId: string, status: SolveStatus) => {
    setProgress((prev) => {
      const next = { ...prev, [questionId]: status }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const getStatus = useCallback(
    (questionId: string): SolveStatus => progress[questionId] ?? 'not_started',
    [progress]
  )

  return { getStatus, updateStatus }
}
