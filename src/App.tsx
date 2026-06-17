import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthProvider from './providers/AuthProvider'
import AuthGuard from './components/auth/AuthGuard'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import SubscribePage from './pages/SubscribePage'
import GardenPage from './pages/GardenPage'

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
          {/* Features now open as panels over the garden. Old routes deep-link in. */}
          <Route path="/oracle" element={<Navigate to="/garden?panel=oracle" replace />} />
          <Route path="/angel" element={<Navigate to="/garden?panel=angel" replace />} />
          <Route path="/journal" element={<Navigate to="/garden?panel=journal" replace />} />
          <Route path="/tones" element={<Navigate to="/garden?panel=tones" replace />} />
          <Route path="/easel" element={<Navigate to="/garden?panel=easel" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
