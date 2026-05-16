# AutoFyx Frontend Application

This repository contains the frontend web application for the AutoFyx Vehicle Analyzer System. Built with [Next.js](https://nextjs.org/) and [React](https://react.dev/), it provides a highly responsive, modern, and dark-themed user interface for users to discover, analyze, and compare vehicles.

## Key Features

- **Interactive Dashboard:** A premium, dark-themed dashboard providing an overview of vehicle recommendations, saved searches, and analytics.
- **Advanced Vehicle Search & Filtering:** Dynamic search functionality to find vehicles based on brand, model, price, and custom features.
- **Financial Insights:** Detailed breakdowns of 5-year total cost of ownership, loan estimations, and maintenance cost predictions with interactive charts.
- **AI Integration:** Leveraging Groq and Google Gemini to provide intelligent conversational assistants and automated insights.
- **PDF Export:** Ability to generate and download comprehensive vehicle reports.
- **Responsive Design:** Fully optimized for both desktop and mobile viewing with a seamless navigation experience.

## Technology Stack

- **Framework:** Next.js (App Router), React
- **Styling:** Tailwind CSS, Framer Motion (for animations), Shadcn UI (Radix UI)
- **Data Management:** React Query, Axios
- **Forms & Validation:** React Hook Form, Zod
- **Charts:** Recharts

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm, yarn, or pnpm

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd frontend/autofyx
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env.local` and add your backend API URL and any required third-party API keys.

### Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application in action.

## Project Structure

- `app/` - Next.js App Router pages and layouts.
- `components/` - Reusable UI components (buttons, forms, charts, layouts).
- `lib/` & `utils/` - Helper functions, API configurations, and utilities.
- `types/` - TypeScript interface and type definitions.
- `public/` - Static assets such as images and fonts.
