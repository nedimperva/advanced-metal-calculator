import { useCallback, useState, useRef } from 'react'

interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
}

interface UseUndoRedoResult<T> {
  state: T
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  reset: (newState: T) => void
  set: (newState: T) => void
}

export function useUndoRedo<T>(initialState: T): UseUndoRedoResult<T> {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: []
  })

  const canUndo = history.past.length > 0
  const canRedo = history.future.length > 0

  const undo = useCallback(() => {
    setHistory(currentHistory => {
      const { past, present, future } = currentHistory
      
      if (past.length === 0) {
        return currentHistory
      }

      const previous = past[past.length - 1]
      const newPast = past.slice(0, past.length - 1)

      return {
        past: newPast,
        present: previous,
        future: [present, ...future]
      }
    })
  }, [])

  const redo = useCallback(() => {
    setHistory(currentHistory => {
      const { past, present, future } = currentHistory
      
      if (future.length === 0) {
        return currentHistory
      }

      const next = future[0]
      const newFuture = future.slice(1)

      return {
        past: [...past, present],
        present: next,
        future: newFuture
      }
    })
  }, [])

  const set = useCallback((newState: T) => {
    setHistory(currentHistory => ({
      past: [...currentHistory.past, currentHistory.present],
      present: newState,
      future: []
    }))
  }, [])

  const reset = useCallback((newState: T) => {
    setHistory({
      past: [],
      present: newState,
      future: []
    })
  }, [])

  return {
    state: history.present,
    canUndo,
    canRedo,
    undo,
    redo,
    reset,
    set
  }
}

// Helper hook for debounced undo/redo to avoid creating too many history entries
export function useDebouncedUndoRedo<T>(
  initialState: T, 
  delay: number = 1000
): UseUndoRedoResult<T> & { setImmediate: (state: T) => void } {
  const undoRedo = useUndoRedo(initialState)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingStateRef = useRef<T | null>(null)

  const setDebounced = useCallback((newState: T) => {
    pendingStateRef.current = newState

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (pendingStateRef.current !== null) {
        undoRedo.set(pendingStateRef.current)
        pendingStateRef.current = null
      }
    }, delay)
  }, [undoRedo, delay])

  const setImmediate = useCallback((newState: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    pendingStateRef.current = null
    undoRedo.set(newState)
  }, [undoRedo])

  return {
    ...undoRedo,
    set: setDebounced,
    setImmediate
  }
} 