/**
 * App.jsx — Production-hardened with lazy loading
 *
 * All page-level components are lazy-loaded so the initial bundle
 * is small and each page chunk only downloads on first navigation.
 * Suspense boundaries show the Loader while the chunk is in-flight.
 */
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import ErrorBoundary from './components/ui/ErrorBoundary'
import ProtectedRoute from './components/ui/ProtectedRoute'
import Loader from './components/ui/Loader'

// Lazy-load every page — each becomes its own JS chunk
const Portfolio = lazy(() => import('./pages/Portfolio'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <ErrorBoundary fullPage>
              <Routes>

                <Route path="/" element={
                  <ErrorBoundary>
                    <Suspense fallback={<Loader message="Loading portfolio…" />}>
                      <Portfolio />
                    </Suspense>
                  </ErrorBoundary>
                } />

                <Route path="/admin/login" element={
                  <ErrorBoundary>
                    <Suspense fallback={<Loader message="Loading…" />}>
                      <AdminLogin />
                    </Suspense>
                  </ErrorBoundary>
                } />

                <Route path="/admin" element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <Suspense fallback={<Loader message="Loading dashboard…" />}>
                        <AdminDashboard />
                      </Suspense>
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />

                {/* 404 — catch-all for unmatched paths */}
                <Route path="*" element={
                  <Suspense fallback={<Loader />}>
                    <NotFound />
                  </Suspense>
                } />

              </Routes>
            </ErrorBoundary>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}