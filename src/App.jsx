import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Templates from './pages/Templates'
import Products from './pages/Products'
import ContentBuilder from './pages/ContentBuilder'
import CampaignPage from './pages/CampaignPage'
import AudiencePage from './pages/AudiencePage'
import SmsPage from './pages/SmsPage'
import SmsSendingPage from './pages/SmsSendingPage'
import SmsPageContent from './pages/SmsPageContent'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/content/templates"
          element={
            <ProtectedRoute>
              <Templates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/content/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route path="/content/builder" element={<ProtectedRoute>
          <ContentBuilder />
        </ProtectedRoute>} />
        <Route
          path="/campaigns"
          element={
            <ProtectedRoute>
              <CampaignPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audience"
          element={
            <ProtectedRoute>
              <AudiencePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sms"
          element={
            <ProtectedRoute>
              <SmsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sms/:smsId/sending"
          element={
            <ProtectedRoute>
              <SmsSendingPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/sms/page/:slug" element={<SmsPageContent />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
