import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthProvider from './providers/AuthProvider'
import AuthGuard from './components/auth/AuthGuard'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import SubscribePage from './pages/SubscribePage'
import GardenPage from './pages/GardenPage'
import OraclePage from './pages/OraclePage'
import AngelPage from './pages/AngelPage'
import JournalPage from './pages/JournalPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/subscribe" element={<SubscribePage />} />
          <Route
            path="/garden"
            element={
              <AuthGuard>
                <GardenPage />
              </AuthGuard>
            }
          />
          <Route
            path="/oracle"
            element={
              <AuthGuard>
                <OraclePage />
              </AuthGuard>
            }
          />
          <Route
            path="/angel"
            element={
              <AuthGuard>
                <AngelPage />
              </AuthGuard>
            }
          />
          <Route
            path="/journal"
            element={
              <AuthGuard>
                <JournalPage />
              </AuthGuard>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
