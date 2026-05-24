import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import SetPassword from './pages/SetPassword'
import CustomersPage from './pages/CustomersPage'
import Home from './pages/Home'
import Templates from './pages/Templates'
import Products from './pages/Products'
import ContentBuilder from './pages/ContentBuilder'
import MyContents from './pages/MyContents'
import CampaignPage from './pages/CampaignPage'
import AudiencePage from './pages/AudiencePage'
import AutomationPage from './pages/AutomationPage'
import SmsPage from './pages/SmsPage'
import SmsPlansPage from './pages/SmsPlansPage'
import SmsPurchaseCallbackPage from './pages/SmsPurchaseCallbackPage'
import SmsPurchaseCancelPage from './pages/SmsPurchaseCancelPage'
import SmsSendingPage from './pages/SmsSendingPage'
import SmsPageContent from './pages/SmsPageContent'
import SmsOptInPage from './pages/SmsOptInPage'
import ProtectedRoute from './components/ProtectedRoute'
import { FirstCampaignGuideProvider } from './guide/FirstCampaignGuideProvider'

function App() {
  return (
    <BrowserRouter>
      <FirstCampaignGuideProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* <Route path="/register" element={<Register />} /> */}
          <Route path="/set-password" element={<SetPassword />} />
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
            path="/content/mine"
            element={
              <ProtectedRoute>
                <MyContents />
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
          {/* <Route
            path="/automations"
            element={
              <ProtectedRoute>
                <AutomationPage />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <CustomersPage />
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
            path="/sms-plans"
            element={
              <ProtectedRoute>
                <SmsPlansPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sms-plans/callback"
            element={
              <ProtectedRoute>
                <SmsPurchaseCallbackPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sms-plans/callback/confirmation"
            element={
              <ProtectedRoute>
                <SmsPurchaseCallbackPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sms-plans/cancel"
            element={
              <ProtectedRoute>
                <SmsPurchaseCancelPage />
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
          <Route path="/sms-optin" element={<SmsOptInPage />} />
        </Routes>
      </FirstCampaignGuideProvider>
    </BrowserRouter>
  )
}

export default App
