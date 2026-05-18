import { render } from '@testing-library/react'
import LandingPage from '@/legacy_pages/landing_page'
import DashboardPage from '@/app/dashboard/page'
import AdminPage from '@/app/admin/page'
import ResearcherPage from '@/app/researcher/page'
import RecommendPage from '@/app/recommend/page'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />
  },
}))

// Recharts uses ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}))

describe('Frontend Component Smoke Tests', () => {
  it('renders Landing Page without crashing', () => {
    const { container } = render(<LandingPage />)
    expect(container).toBeTruthy()
  })

  it('renders Dashboard Page without crashing', () => {
    const { container } = render(<DashboardPage />)
    expect(container).toBeTruthy()
  })

  it('renders Admin Page without crashing', () => {
    const { container } = render(<AdminPage />)
    expect(container).toBeTruthy()
  })

  it('renders Researcher Page without crashing', () => {
    const { container } = render(<ResearcherPage />)
    expect(container).toBeTruthy()
  })

  it('renders Recommend Page without crashing', () => {
    const { container } = render(<RecommendPage />)
    expect(container).toBeTruthy()
  })
})
