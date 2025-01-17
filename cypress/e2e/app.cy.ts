/// <reference types="cypress" />

describe('Application Load', () => {
  beforeEach(() => {
    // Visit the root URL before each test
    cy.visit('/')
  })

  it('loads the application successfully', () => {
    // Check that the main app container is visible
    cy.get('#root').should('be.visible')
  })

  it('displays the user interface', () => {
    // Check for key UI elements
    cy.contains('Users').should('be.visible')
    cy.get('form').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
  })

  it('has no console errors', () => {
    // Listen for console errors
    cy.window().then((win) => {
      cy.spy(win.console, 'error').as('consoleError')
    })

    // Verify no console errors occurred
    cy.get('@consoleError').should('not.be.called')
  })
}) 