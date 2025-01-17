import { vi } from 'vitest'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var vi: any
}

// Make vi available globally
globalThis.vi = vi 