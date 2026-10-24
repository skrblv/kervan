import { HashRouter, Route, Routes } from 'react-router'
import { AppShell, CONTAINER, EmptyState } from './components/layout/AppShell'
import { ButtonLink } from './components/ui/Button'
import { BuilderPage } from './pages/builder/BuilderPage'
import { EstimatePage } from './pages/EstimatePage'
import { HomePage } from './pages/HomePage'
import { PassportPage } from './pages/PassportPage'
import { QuotesPage } from './pages/QuotesPage'
import { RequestPage } from './pages/RequestPage'
import { AppStateProvider } from './state/store'

// Hash routing keeps the prototype deployable to any static host without server rewrites.
export function App() {
  return (
    <AppStateProvider>
      <HashRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/spec" element={<BuilderPage />} />
            <Route path="/estimate" element={<EstimatePage />} />
            <Route path="/passport" element={<PassportPage />} />
            <Route path="/request" element={<RequestPage />} />
            <Route path="/quotes" element={<QuotesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppShell>
      </HashRouter>
    </AppStateProvider>
  )
}

function NotFound() {
  return (
    <div className={CONTAINER}>
      <EmptyState title="This page is not on the route." action={<ButtonLink to="/">Back to the start</ButtonLink>}>
        The address may be mistyped, or the page belongs to a later version of the prototype.
      </EmptyState>
    </div>
  )
}
