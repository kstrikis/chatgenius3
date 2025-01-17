/// <reference types="cypress" />

import '@testing-library/cypress/add-commands'

declare global {
  namespace Cypress {
    interface Chainable {
      // Add custom commands here
      spy(object: any, method: string): Chainable<any>
    }
  }
}

// Add any custom commands for E2E testing here 