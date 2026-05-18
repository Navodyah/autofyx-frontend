import { render, screen } from '@testing-library/react'
import AboutPage from '@/app/about/page'
import '@testing-library/jest-dom'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

// IntersectObserver mock for framer-motion whileInView
beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.IntersectionObserver = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))
})

describe('AboutPage Rendering and Loading', () => {
  it('renders the About AutoFyx page without crashing', () => {
    render(<AboutPage />)
    
    // Check if the main heading element exists
    const heading = screen.getByText(/About AutoFyx/i)
    expect(heading).toBeInTheDocument()
    
    // Check if the mission section loaded
    const missionHeading = screen.getByText(/Our Mission/i)
    expect(missionHeading).toBeInTheDocument()
  })
})
