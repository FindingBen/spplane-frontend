import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import TopBar from '../components/TopBar'
import { estimateSmsCost, getSms, sendSms } from '../service/api/sms'
import { useFirstCampaignGuide } from '../guide/FirstCampaignGuideProvider'

const formatValue = (value) => {
  if (value == null || value === '') return '—'
  if (typeof value === 'number') return value.toLocaleString('en-GB')
  return String(value)
}

export default function SmsSendingPage() {
  const { smsId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { trackAction } = useFirstCampaignGuide()

  const [sms, setSms] = useState(location.state?.sms ?? null)
  const [smsLoading, setSmsLoading] = useState(!location.state?.sms)
  const [smsError, setSmsError] = useState('')

  const [estimate, setEstimate] = useState(null)
  const [estimateLoading, setEstimateLoading] = useState(true)
  const [estimateError, setEstimateError] = useState('')

  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')

  const canSend = useMemo(() => {
    if (!sms) return false
    return sms.status === 'draft' || sms.status === 'scheduled'
  }, [sms])

  const loadSms = async () => {
    if (!smsId) return
    try {
      setSmsLoading(true)
      setSmsError('')
      const data = await getSms(smsId)
      setSms(data)
    } catch (error) {
      setSmsError(error?.response?.data?.error || 'Failed to load SMS details.')
    } finally {
      setSmsLoading(false)
    }
  }

  const loadEstimate = async () => {
    if (!smsId) return
    try {
      setEstimateLoading(true)
      setEstimateError('')
      const data = await estimateSmsCost(smsId)
      setEstimate(data)
    } catch (error) {
      setEstimateError(error?.response?.data?.error || 'Failed to calculate estimated cost.')
      setEstimate(null)
    } finally {
      setEstimateLoading(false)
    }
  }

  useEffect(() => {
    if (!sms) {
      loadSms()
    }
    loadEstimate()
  }, [smsId])

  const handleSend = async () => {
    if (!smsId || sending || !canSend) return
    try {
      setSending(true)
      setSendError('')
      await sendSms(smsId)
      trackAction('sms:sent', { smsId })
      navigate('/sms')
    } catch (error) {
      setSendError(error?.response?.data?.error || 'Failed to queue SMS send.')
    } finally {
      setSending(false)
    }
  }

  const estimateRows = estimate
    ? Object.entries(estimate).filter(([key]) => key !== 'error')
    : []

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827]">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Header />

        <div className="flex-1 m-4 bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827] rounded-2xl border border-[#3e6ff4]/20 overflow-hidden flex flex-col h-full">
          <main className="flex-1 flex flex-col p-4 md:p-6 xl:p-8 2xl:p-5 overflow-y-auto overflow-x-hidden">
            <div className="w-full max-w-4xl mx-auto">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">SMS Sending</h1>
                  <p className="text-[#CAC4CF] text-sm mt-1">Review the estimated cost before queuing this SMS for sending.</p>
                </div>
                <button
                  onClick={() => navigate('/sms')}
                  className="px-4 py-2 rounded-lg border border-[#3e6ff4]/30 text-[#CAC4CF] hover:text-white hover:border-[#3e6ff4]/60 text-sm transition-colors"
                >
                  Back
                </button>
              </div>

              {smsLoading ? (
                <div className="mb-4 flex items-center gap-2 text-sm text-[#CAC4CF]/70">
                  <div className="w-4 h-4 border-2 border-[#3e6ff4]/30 border-t-[#3e6ff4] rounded-full animate-spin" />
                  Loading SMS...
                </div>
              ) : smsError ? (
                <div className="mb-4 bg-red-500/10 border border-red-500/40 text-red-400 rounded-xl px-4 py-3 text-sm">
                  {smsError}
                </div>
              ) : (
                <div className="mb-4 bg-[#1f2937]/60 border border-[#3e6ff4]/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-[#3e6ff4]/15 border border-[#3e6ff4]/40 text-[#60a5fa]">SMS #{sms?.id}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#CAC4CF]/10 border border-[#CAC4CF]/20 text-[#CAC4CF]">Status: {sms?.status ?? '—'}</span>
                  </div>
                  <p className="text-[#CAC4CF] text-sm leading-relaxed">{sms?.body || 'No body provided.'}</p>
                </div>
              )}

              <div className="bg-[#1f2937]/60 border border-[#3e6ff4]/20 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold">Estimated Cost</h2>
                  <button
                    onClick={loadEstimate}
                    className="text-xs text-[#60a5fa] hover:text-white underline hover:no-underline"
                  >
                    Refresh
                  </button>
                </div>

                {estimateLoading ? (
                  <div className="flex items-center gap-2 text-sm text-[#CAC4CF]/70">
                    <div className="w-4 h-4 border-2 border-[#3e6ff4]/30 border-t-[#3e6ff4] rounded-full animate-spin" />
                    Calculating estimate...
                  </div>
                ) : estimateError ? (
                  <div className="bg-red-500/10 border border-red-500/40 text-red-400 rounded-lg px-4 py-3 text-sm">
                    {estimateError}
                  </div>
                ) : estimateRows.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {estimateRows.map(([key, value]) => (
                      <div key={key} className="bg-[#111827]/60 border border-[#3e6ff4]/10 rounded-lg px-3 py-2.5">
                        <p className="text-[11px] uppercase tracking-wide text-[#CAC4CF]/50 mb-1">{key.replace(/_/g, ' ')}</p>
                        <p className="text-white text-sm font-medium">{formatValue(value)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#CAC4CF]/70">No estimate data available.</p>
                )}
              </div>

              {sendError && (
                <div className="mt-4 bg-red-500/10 border border-red-500/40 text-red-400 rounded-xl px-4 py-3 text-sm">
                  {sendError}
                </div>
              )}

              {!canSend && !smsLoading && !smsError && (
                <div className="mt-4 bg-amber-500/10 border border-amber-500/40 text-amber-300 rounded-xl px-4 py-3 text-sm">
                  This SMS cannot be sent in its current status.
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => navigate('/sms')}
                  className="px-4 py-2.5 rounded-lg border border-[#3e6ff4]/30 text-[#CAC4CF] hover:text-white hover:border-[#3e6ff4]/60 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending || !canSend || smsLoading || estimateLoading}
                  data-guide-id="sms-send-confirm"
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send SMS'}
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
