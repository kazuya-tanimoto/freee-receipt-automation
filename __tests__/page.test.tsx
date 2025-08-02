import HomePage from '@/app/page'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(<HomePage />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('freee Receipt Automation')
  })

  it('renders the description', () => {
    render(<HomePage />)
    const description = screen.getByText(/Automated receipt processing system/i)
    expect(description).toBeInTheDocument()
  })
})
