/// <reference types="cypress" />

describe('Core User Flow', () => {
  const TEST_USER = 'Test Guest User'

  beforeEach(() => {
    cy.clearLocalStorage()
    Cypress.Screenshot.defaults({
      capture: 'viewport'
    })
  })

  it('should successfully log in as guest', () => {
    // Visit homepage
    cy.visit('/')

    // Sign in as guest
    cy.get('input[placeholder*="guest name"]', { timeout: 10000 }).should('be.visible').type(TEST_USER)
    cy.get('button').contains(/join as guest/i).click()

    // Verify we're logged in and in the chat interface
    cy.url().should('include', '/chat')
    cy.contains(TEST_USER, { timeout: 10000 }).should('be.visible')
    cy.contains('Welcome!', { timeout: 10000 }).should('be.visible')
  })

  it('should have exactly one general channel', () => {
    // Visit and login
    cy.visit('/')
    cy.get('input[placeholder*="guest name"]', { timeout: 10000 }).should('be.visible').type(TEST_USER)
    cy.get('button').contains(/join as guest/i).click()

    // Wait for the chat interface to load
    cy.contains(TEST_USER, { timeout: 10000 }).should('be.visible')

    // Count the number of elements containing "general"
    cy.get('[data-cy="channel-list"]').within(() => {
      cy.get('[data-cy="channel-item"]').should('have.length.at.least', 1)
      cy.get('[data-cy="channel-item"]').filter(':contains("#general")').should('have.length', 1)
    })
  })

  it('should persist user session after refresh', () => {
    // Visit and login
    cy.visit('/')
    cy.get('input[placeholder*="guest name"]', { timeout: 10000 }).should('be.visible').type(TEST_USER)
    cy.get('button').contains(/join as guest/i).click()

    // Wait for the chat interface to load
    cy.contains(TEST_USER, { timeout: 10000 }).should('be.visible')

    // Verify localStorage has the user data
    cy.window().its('localStorage').invoke('getItem', 'chatgenius_user').should('exist')

    // Refresh the page
    cy.reload()

    // Wait for loading state to clear
    cy.contains('Loading...').should('not.exist')

    // Verify we're still logged in
    cy.url().should('include', '/chat')
    cy.contains(TEST_USER, { timeout: 10000 }).should('be.visible')
  })

  it('should log out and redirect to login page', () => {
    // Visit and login
    cy.visit('/')
    cy.get('input[placeholder*="guest name"]', { timeout: 10000 }).should('be.visible').type(TEST_USER)
    cy.get('button').contains(/join as guest/i).click()

    // Wait for the chat interface to load
    cy.contains(TEST_USER, { timeout: 10000 }).should('be.visible')

    // Click logout button and wait for user state to be cleared
    cy.get('button[aria-label="Logout"]').click()
    cy.window().its('localStorage').invoke('getItem', 'chatgenius_user').should('not.exist')

    // Verify we're back at the login page
    cy.get('input[placeholder*="guest name"]', { timeout: 10000 }).should('be.visible')
    cy.get('button').contains(/join as guest/i).should('be.visible')

    // Verify we can't access chat page directly
    cy.visit('/chat')
    cy.get('input[placeholder*="guest name"]', { timeout: 10000 }).should('be.visible')
    cy.get('button').contains(/join as guest/i).should('be.visible')
  })

  it('should prevent direct access to chat page when not logged in', () => {
    // Try to access chat page directly
    cy.visit('/chat')

    // Should be redirected to login page
    cy.url().should('eq', 'http://localhost:5173/')
    cy.get('input[placeholder*="guest name"]', { timeout: 10000 }).should('be.visible')
    cy.get('button').contains(/join as guest/i).should('be.visible')
  })

  it('should show logged-in user in the user list', () => {
    // Visit and login
    cy.visit('/')
    cy.get('input[placeholder*="guest name"]', { timeout: 10000 }).should('be.visible').type(TEST_USER)
    cy.get('button').contains(/join as guest/i).click()

    // Wait for the chat interface to load
    cy.contains(TEST_USER, { timeout: 10000 }).should('be.visible')

    // Verify user list contains the logged-in user
    cy.get('[data-cy="user-list"]').within(() => {
      cy.get('[data-cy="user-item"]')
        .should('have.length.at.least', 1)
        .and('contain', TEST_USER)
      
      // Verify user status is shown
      cy.get('[data-cy="user-item"]')
        .filter(`:contains("${TEST_USER}")`)
        .find('[data-cy="user-status"]')
        .should('exist')
    })
  })
}) 