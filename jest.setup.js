import '@testing-library/jest-dom'

// Mock IndexedDB for database tests (simplified mock)
global.indexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn(),
}

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error
const originalConsoleWarn = console.warn
const originalConsoleLog = console.log

beforeEach(() => {
  // Silence console output in tests unless explicitly needed
  console.error = jest.fn()
  console.warn = jest.fn()
  console.log = jest.fn()
})

afterEach(() => {
  // Restore console methods
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
  console.log = originalConsoleLog
  
  // Clear all mocks
  jest.clearAllMocks()
})

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js dynamic imports
jest.mock('next/dynamic', () => (func) => {
  const MockedComponent = (props) => {
    return React.createElement('div', props, 'Mocked Dynamic Component')
  }
  MockedComponent.displayName = 'MockedDynamicComponent'
  return MockedComponent
})

// Global test utilities
global.createMockPromise = () => {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  promise.resolve = resolve
  promise.reject = reject
  return promise
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null }
  disconnect() { return null }
  unobserve() { return null }
}