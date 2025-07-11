"use client"

import { useState, useEffect, useCallback } from "react"

interface CacheItem<T> {
  data: T
  timestamp: number
  expires: number
}

class LocalCache {
  private cache = new Map<string, CacheItem<any>>()
  private readonly prefix = 'steelforge-cache-'

  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expires: Date.now() + ttlMs
    }
    
    this.cache.set(key, item)
    
    // Also store in localStorage for persistence
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(item))
    } catch (error) {
      console.warn('Failed to cache to localStorage:', error)
    }
  }

  get<T>(key: string): T | null {
    let item = this.cache.get(key)
    
    // If not in memory, try localStorage
    if (!item) {
      try {
        const stored = localStorage.getItem(this.prefix + key)
        if (stored) {
          item = JSON.parse(stored)
          this.cache.set(key, item)
        }
      } catch (error) {
        console.warn('Failed to read from localStorage:', error)
      }
    }
    
    if (!item) return null
    
    // Check if expired
    if (Date.now() > item.expires) {
      this.delete(key)
      return null
    }
    
    return item.data
  }

  delete(key: string): void {
    this.cache.delete(key)
    try {
      localStorage.removeItem(this.prefix + key)
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error)
    }
  }

  clear(): void {
    this.cache.clear()
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  }

  size(): number {
    return this.cache.size
  }
}

const cache = new LocalCache()

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T> | T,
  options: {
    ttl?: number // Time to live in milliseconds
    enabled?: boolean
    refreshInterval?: number
  } = {}
) {
  const { ttl = 5 * 60 * 1000, enabled = true, refreshInterval } = options
  
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return
    
    // Try cache first unless forcing refresh
    if (!forceRefresh) {
      const cached = cache.get<T>(key)
      if (cached !== null) {
        setData(cached)
        return cached
      }
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await fetcher()
      cache.set(key, result, ttl)
      setData(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      
      // Try to return stale data on error
      const stale = cache.get<T>(key)
      if (stale !== null) {
        setData(stale)
        return stale
      }
      
      throw error
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, enabled, ttl])

  const invalidate = useCallback(() => {
    cache.delete(key)
    setData(null)
  }, [key])

  const refresh = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchData(true)
      }, refreshInterval)
      
      return () => clearInterval(interval)
    }
  }, [fetchData, refreshInterval])

  return {
    data,
    loading,
    error,
    refresh,
    invalidate,
    cache: {
      set: cache.set.bind(cache),
      get: cache.get.bind(cache),
      delete: cache.delete.bind(cache),
      clear: cache.clear.bind(cache),
      size: cache.size.bind(cache)
    }
  }
}

export { cache as cacheManager }