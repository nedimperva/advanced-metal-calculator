"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getTimelineEvents, saveTimelineEvent, type StoredTimelineEvent } from '@/lib/timeline-storage'
import type { Project } from '@/lib/types'

interface TimelineStorageTestProps {
  project: Project
}

export function TimelineStorageTest({ project }: TimelineStorageTestProps) {
  const [events, setEvents] = useState<StoredTimelineEvent[]>([])
  const [testResults, setTestResults] = useState<string[]>([])

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const loadEvents = () => {
    try {
      const loaded = getTimelineEvents(project.id)
      setEvents(loaded)
      addTestResult(`✅ Loaded ${loaded.length} events from localStorage`)
      console.log('Loaded events:', loaded)
    } catch (error) {
      addTestResult(`❌ Failed to load events: ${error}`)
      console.error('Load error:', error)
    }
  }

  const testSaveEvent = () => {
    try {
      const testEvent = saveTimelineEvent(project.id, {
        type: 'note',
        title: `Test Event ${Date.now()}`,
        description: 'This is a test event - should trigger real-time update',
        author: 'Test User'
      })
      
      addTestResult(`✅ Saved event: ${testEvent.title}`)
      console.log('Saved event:', testEvent)
      
      // The event listener should automatically update the UI
      addTestResult(`⏱️ Waiting for automatic update...`)
    } catch (error) {
      addTestResult(`❌ Failed to save event: ${error}`)
      console.error('Save error:', error)
    }
  }

  const clearStorage = () => {
    try {
      localStorage.removeItem('timeline_events')
      setEvents([])
      addTestResult(`✅ Cleared timeline storage`)
    } catch (error) {
      addTestResult(`❌ Failed to clear storage: ${error}`)
    }
  }

  const testLocalStorage = () => {
    try {
      const testKey = 'timeline_test'
      const testData = { test: 'data', timestamp: Date.now() }
      
      localStorage.setItem(testKey, JSON.stringify(testData))
      const retrieved = JSON.parse(localStorage.getItem(testKey) || '{}')
      localStorage.removeItem(testKey)
      
      if (retrieved.test === 'data') {
        addTestResult(`✅ localStorage is working`)
      } else {
        addTestResult(`❌ localStorage test failed`)
      }
    } catch (error) {
      addTestResult(`❌ localStorage error: ${error}`)
    }
  }

  useEffect(() => {
    addTestResult(`🚀 Timeline storage test initialized for project: ${project.name}`)
    testLocalStorage()
    loadEvents()

    // Listen for timeline updates
    const handleTimelineUpdate = (event: any) => {
      if (event.detail?.projectId === project.id) {
        addTestResult(`📡 Received timeline update notification`)
        loadEvents()
      }
    }

    window.addEventListener('timeline-update', handleTimelineUpdate)

    return () => {
      window.removeEventListener('timeline-update', handleTimelineUpdate)
    }
  }, [project.id])

  return (
    <Card className="mb-4 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-lg text-yellow-800">
          🔍 Timeline Storage Debug Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={testLocalStorage}>
            Test localStorage
          </Button>
          <Button size="sm" onClick={loadEvents}>
            Load Events
          </Button>
          <Button size="sm" onClick={testSaveEvent}>
            Save Test Event
          </Button>
          <Button size="sm" variant="destructive" onClick={clearStorage}>
            Clear Storage
          </Button>
        </div>

        <div>
          <h4 className="font-medium mb-2">Current Events ({events.length}):</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-sm text-gray-500">No events found</p>
            ) : (
              events.map(event => (
                <div key={event.id} className="text-sm p-2 bg-white rounded border">
                  <div className="font-medium">{event.title}</div>
                  <div className="text-gray-600 text-xs">
                    {event.type} • {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Test Results:</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto bg-gray-900 text-green-400 p-2 rounded text-xs font-mono">
            {testResults.length === 0 ? (
              <p>No test results yet...</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index}>{result}</div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 