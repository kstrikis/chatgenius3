/// <reference types="cypress" />
import React from 'react'
import { mount } from 'cypress/react18'
import { UserForm } from '../../src/components/UserForm'

describe('UserForm', () => {
  beforeEach(() => {
    // Mock the createUser function
    cy.window().then((win) => {
      win.createUser = cy.stub().as('createUser')
    })
  })

  it('should render the form', () => {
    mount(<UserForm />)
    cy.get('form').should('exist')
    cy.get('input[id="name"]').should('exist')
    cy.get('input[id="email"]').should('exist')
    cy.get('button[type="submit"]').should('exist')
  })

  it('should handle form submission', () => {
    // Mock successful response
    cy.window().then((win) => {
      win.createUser.resolves({ id: '1', name: 'Test User', email: 'test@example.com' })
    })
    
    mount(<UserForm />)
    
    const name = 'Test User'
    const email = 'test@example.com'

    cy.get('input[id="name"]').type(name)
    cy.get('input[id="email"]').type(email)
    cy.get('button[type="submit"]').click()

    // Should show success message
    cy.get('.success').should('be.visible')
    cy.get('.success').should('contain', 'User added successfully!')
    
    // Form should be cleared
    cy.get('input[id="name"]').should('have.value', '')
    cy.get('input[id="email"]').should('have.value', '')
  })

  it('should handle errors', () => {
    // Mock error response
    cy.window().then((win) => {
      win.createUser.rejects(new Error('Failed to create user'))
    })
    
    mount(<UserForm />)
    
    const name = 'Test User'
    const email = 'test@example.com'

    cy.get('input[id="name"]').type(name)
    cy.get('input[id="email"]').type(email)
    cy.get('button[type="submit"]').click()

    cy.get('.error').should('be.visible')
    cy.get('.error').should('contain', 'Failed to create user')
  })
}) 