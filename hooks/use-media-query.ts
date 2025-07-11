"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const media = window.matchMedia(query)
    
    // Set initial value immediately after mounting
    setMatches(media.matches)

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Use the newer method if available, fallback to deprecated method
    if (media.addEventListener) {
      media.addEventListener("change", listener)
    } else {
      // @ts-ignore - for older browsers
      media.addListener(listener)
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", listener)
      } else {
        // @ts-ignore - for older browsers
        media.removeListener(listener)
      }
    }
  }, [query])

  // Return false during SSR to prevent hydration mismatches
  // but allow immediate detection once mounted
  return mounted ? matches : false
}
