"use client"

import { useState, useEffect } from "react"

// Type definition for legacy MediaQueryList methods
interface LegacyMediaQueryList {
  matches: boolean;
  media: string;
  addEventListener?: (type: "change", listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void;
  removeEventListener?: (type: "change", listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void;
  addListener?: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const media = window.matchMedia(query) as LegacyMediaQueryList
    
    // Set initial value immediately after mounting
    setMatches(media.matches)

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Use the newer method if available, fallback to deprecated method
    if (media.addEventListener) {
      media.addEventListener("change", listener)
    } else if (media.addListener) {
      // Legacy browser support
      media.addListener(listener)
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", listener)
      } else if (media.removeListener) {
        // Legacy browser support
        media.removeListener(listener)
      }
    }
  }, [query])

  // Return false during SSR to prevent hydration mismatches
  // but allow immediate detection once mounted
  return mounted ? matches : false
}
