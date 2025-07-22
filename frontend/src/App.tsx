import React, { Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useScrollSmooth } from './hooks/useScrollSmooth'
import { Navbar } from './components/Navbar'
import { ScrollIndicator } from './components/ScrollIndicator'
import { BlobBackground } from './components/BlobBackground'
import { Footer } from './components/Footer'

// Lazy load pages
const Landing = React.lazy(() => import('./pages/Landing'))
const Extension = React.lazy(() => import('./pages/Extension'))
const Desktop = React.lazy(() => import('./pages/Desktop'))
const Download = React.lazy(() => import('./pages/Download'))
const Auth = React.lazy(() => import('./pages/Auth'))
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const Interview = React.lazy(() => import('./pages/Interview'))
const History = React.lazy(() => import('./pages/History'))
const Profile = React.lazy(() => import('./pages/Profile'))
const Pricing = React.lazy(() => import('./pages/Pricing'))
const Help = React.lazy(() => import('./pages/Help'))
const Admin = React.lazy(() => import('./pages/Admin'))
const AdminLogin = React.lazy(() => import('./pages/admin/Login'))
const AdminPanel = React.lazy(() => import('./pages/admin/Panel'))
const Legal = React.lazy(() => import('./pages/Legal'))

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-gradient-blue-a border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white/60 font-space-grotesk">Loading...</p>
    </div>
  </div>
)

function App() {
  useScrollSmooth()

  useEffect(() => {
    // Add compass cursor to body
    document.body.classList.add('compass-cursor')

    return () => {
      document.body.classList.remove('compass-cursor')
    }
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-black text-white font-space-grotesk relative overflow-x-hidden">
        {/* Noise overlay */}
        <div className="fixed inset-0 pointer-events-none noise-overlay z-50" />

        {/* Background blob */}
        <BlobBackground />

        {/* Navigation */}
        <Navbar />

        {/* Scroll indicator */}
        <ScrollIndicator />

        {/* Main content */}
        <main className="relative z-10">
          <AnimatePresence mode="wait">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/extension" element={<Extension />} />
                <Route path="/desktop" element={<Desktop />} />
                <Route path="/download" element={<Download />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/signup" element={<Auth />} />
                <Route path="/forgot" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/interview" element={<Interview />} />
                <Route path="/history" element={<History />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/help" element={<Help />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/panel" element={<AdminPanel />} />
                <Route path="/admin/*" element={<Admin />} />
                <Route path="/privacy" element={<Legal />} />
                <Route path="/terms" element={<Legal />} />
              </Routes>
            </Suspense>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  )
}

export default App
