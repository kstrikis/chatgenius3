import React from 'react'

import { mount } from 'cypress/react'

import UserForm from '../../src/components/UserForm'

describe('UserForm', () => {
  beforeEach(() => {
    // Mount the component before each test
    cy.mount(<UserForm onSubmit={cy.stub().as('onSubmit')} />)
  })

  it('renders the form fields', () => {
    cy.get('input[name="name"]').should('exist')
    cy.get('input[name="email"]').should('exist')
    cy.get('button[type="submit"]').should('exist')
  })

  it('validates required fields', () => {
    // Try to submit without filling fields
    cy.get('button[type="submit"]').click()
    
    // Check for validation messages
    cy.get('form').should('contain', 'required')
  })

  it('submits form with valid data', () => {
    const testUser = {
      name: 'Test User',
      email: 'test@example.com'
    }

    // Fill out the form
    cy.get('input[name="name"]').type(testUser.name)
    cy.get('input[name="email"]').type(testUser.email)
    
    // Submit the form
    cy.get('button[type="submit"]').click()
    
    // Verify onSubmit was called with correct data
    cy.get('@onSubmit').should('have.been.calledWith', testUser)
  })
}) 