import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import TopBar from '../components/TopBar'
import { getSmsList, createSms, deleteSms } from '../service/api/sms'
import { useFirstCampaignGuide } from '../guide/FirstCampaignGuideProvider'
import CreateSmsModal from '../modals/CreateSmsModal'

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const smsSegments = (body) => {
  if (!body) return 0
  const len = body.length
  if (len <= 160) return 1
  return Math.ceil(len / 153)
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_STYLE = {
  draft:       'bg-[#CAC4CF]/10 text-[#CAC4CF] border border-[#CAC4CF]/20',
  scheduled:   'bg-amber-500/20 text-amber-400 border border-amber-500/40',
  processing:  'bg-[#3e6ff4]/20 text-[#60a5fa] border border-[#3e6ff4]/40',
  sent:        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
  partial:     'bg-orange-500/20 text-orange-400 border border-orange-500/40',
  failed:      'bg-red-500/20 text-red-400 border border-red-500/40',
  cancelled:   'bg-[#CAC4CF]/10 text-[#CAC4CF]/50 border border-[#CAC4CF]/10',
}

const STATUS_LABEL = {
  draft: 'Draft', scheduled: 'Scheduled', processing: 'Processing',
  sent: 'Sent', partial: 'Partial', failed: 'Failed', cancelled: 'Cancelled',
}

const TABS = [
  { key: 'all',       label: 'All' },
  { key: 'draft',     label: 'Drafts' },
  { key: 'sent',      label: 'Sent' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'failed',    label: 'Failed' },
]

// ── SMS Table Row ─────────────────────────────────────────────────────────────

function SmsTableRow({ sms, onDelete, onSend }) {
  const segs = smsSegments(sms.body)
  const canSend = sms.status === 'draft' || sms.status === 'scheduled'

  return (
    <tr className="text-left transition-colors hover:bg-[#3e6ff4]/5">
      <td className="px-4 py-4 align-top">
        <div className="max-w-[360px]">
          <p className="text-xs font-medium leading-6 text-white line-clamp-2">
            {sms.body || <span className="italic opacity-40">No body</span>}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-[#CAC4CF]/55">
            <span>{sms.body?.length ?? 0} chars</span>
            <span className="h-1 w-1 rounded-full bg-[#3e6ff4]/30" />
            <span>Text message</span>
          </div>
        </div>
      </td>

      <td className="px-4 py-4 align-top">
        <div className="flex min-w-[160px] flex-col gap-2">
          {sms.contact_list ? (
            <span className="inline-flex w-fit items-center rounded-full border border-[#3e6ff4]/20 bg-[#3e6ff4]/10 px-2.5 py-1 text-xs font-medium text-[#60a5fa]">
              List #{sms.contact_list}
            </span>
          ) : (
            <span className="text-xs text-[#CAC4CF]/40">No list assigned</span>
          )}
          <span className="text-xs text-[#CAC4CF]/60">
            {segs} segment{segs !== 1 ? 's' : ''}
          </span>
        </div>
      </td>

      <td className="px-4 py-4 align-top">
        {sms.sender ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs text-white">
            <svg className="h-3.5 w-3.5 shrink-0 text-[#60a5fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {sms.sender}
          </div>
        ) : (
          <span className="text-xs text-[#CAC4CF]/40">—</span>
        )}
      </td>

      <td className="px-4 py-4 align-top">
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[sms.status] ?? STATUS_STYLE.draft}`}>
          {STATUS_LABEL[sms.status] ?? sms.status}
        </span>
      </td>

      <td className="px-4 py-4 align-top text-xs text-[#CAC4CF]/75">
        <div className="flex min-w-[150px] items-center gap-2 leading-5">
          <svg className="h-3.5 w-3.5 shrink-0 text-[#CAC4CF]/45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{formatDate(sms.created_at)}</span>
        </div>
      </td>

      <td className="px-4 py-4 align-top">
        <div className="flex items-center justify-end gap-2">
          {canSend && (
            <button
              onClick={() => onSend(sms)}
              data-guide-id={`sms-send-${sms.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#3e6ff4]/40 bg-[#3e6ff4]/10 px-2.5 py-1.5 text-xs font-medium text-[#60a5fa] transition-colors hover:border-[#3e6ff4]/60 hover:bg-[#3e6ff4]/20"
              title="Review cost and send"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send
            </button>
          )}
          <button
            onClick={() => onDelete(sms.id)}
            className="rounded-lg p-1.5 text-[#CAC4CF]/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
            title="Delete SMS"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ tab, onCreateClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-20 h-20 rounded-full bg-[#3e6ff4]/10 border border-[#3e6ff4]/20 flex items-center justify-center">
        <svg className="w-9 h-9 text-[#3e6ff4]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h3 className="text-white font-semibold text-base">
        {tab === 'all' ? 'No SMS messages yet' : `No ${tab} messages`}
      </h3>
      <p className="text-[#CAC4CF] text-xs max-w-xs">
        {tab === 'all'
          ? 'Create your first SMS to start reaching your audience.'
          : `You have no ${tab} SMS messages.`}
      </p>
      {tab === 'all' && (
        <button
          onClick={onCreateClick}
          className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create SMS
        </button>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SmsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { active, currentStepId, trackAction } = useFirstCampaignGuide()
  const [smsList, setSmsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [lockedCampaign, setLockedCampaign] = useState(null)

  const fetchSms = async () => {
    try {
      setError('')
      const data = await getSmsList()
      setSmsList(data)
    } catch {
      setError('Failed to load SMS messages. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSms() }, [])
  useEffect(() => {
    if (active && currentStepId === 'sms-form') {
      setShowModal(true)
    }
  }, [active, currentStepId])

  useEffect(() => {
    if (location.state?.lockedCampaign) {
      setLockedCampaign(location.state.lockedCampaign)
      setShowModal(true)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, location.pathname, navigate])

  const handleCreate = async ({ campaign, contact_list, sender, body }) => {
    setSubmitting(true)
    try {
      const newSms = await createSms({ campaign, contact_list, sender, body, status: 'draft' })
      
      setSmsList(prev => [newSms, ...prev])
      setShowModal(false)
      setLockedCampaign(null)
      trackAction('sms:created', { sms: newSms })
    } catch {
      // keep modal open so user can retry
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteSms(id)
      setSmsList(prev => prev.filter(s => s.id !== id))
    } catch {
      // silent — user can retry
    }
  }

  const handleGoToSending = (sms) => {
    trackAction('sms:open-send-review', { sms })
    navigate(`/sms/${sms.id}/sending`, { state: { sms } })
  }

  // Compute stats
  const total = smsList.length
  const totalSent = smsList.filter(s => s.status === 'sent').length
  const totalDraft = smsList.filter(s => s.status === 'draft').length
  const totalFailed = smsList.filter(s => s.status === 'failed').length

  const filtered = activeTab === 'all' ? smsList : smsList.filter(s => s.status === activeTab)

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827]">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Header />
        <div className="relative flex-1 m-4 bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827] rounded-2xl border border-[#3e6ff4]/20 overflow-hidden flex flex-col h-full">
          {/* Subtle notebook-style grid, confined to this panel only */}
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          <main className="relative z-10 flex-1 flex flex-col p-4 md:p-6 xl:p-8 2xl:p-5 overflow-y-auto overflow-x-hidden">
            <div className="w-full max-w-6xl 2xl:max-w-5xl mx-auto">

              {/* Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 2xl:mb-5">
                <div className='text-left'>
                   <span className="text-2xl md:text-3xl xl:text-4xl 2xl:text-3xl font-bold text-white mb-1">
                    <span className="bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] bg-clip-text text-transparent">Sms</span>
                  </span>
                  <p className="text-[#CAC4CF] text-xs 2xl:text-xs mt-1">
                    Create and manage SMS messages with trackable landing pages.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setLockedCampaign(null)
                    setShowModal(true)
                    trackAction('sms:open')
                  }}
                  data-guide-id="sms-new"
                  className="flex items-center gap-2 px-5 py-2.5 2xl:px-4 2xl:py-2 rounded-xl bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] text-white font-semibold text-xs hover:opacity-90 transition-opacity shrink-0 self-start"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New SMS
                </button>
              </div>

              {/* Error banner */}
              {error && (
                <div className="mb-4 flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/40 text-red-400 rounded-xl px-4 py-3 text-xs">
                  <span>{error}</span>
                  <button onClick={fetchSms} className="text-xs underline hover:no-underline shrink-0">Retry</button>
                </div>
              )}

              {/* Stat Cards */}
              {!loading && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 2xl:mb-5">
                  {[
                    { label: 'Total', value: total,       color: 'text-white' },
                    { label: 'Sent',  value: totalSent,   color: 'text-emerald-400' },
                    { label: 'Draft', value: totalDraft,  color: 'text-[#CAC4CF]' },
                    { label: 'Failed',value: totalFailed, color: 'text-red-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-[#1f2937]/60 border border-[#3e6ff4]/20 rounded-xl p-4 2xl:p-3">
                      <p className="text-[#CAC4CF] text-xs font-medium mb-1">{label}</p>
                      <p className={`text-xl 2xl:text-lg font-bold ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tabs */}
              <div className="flex items-center gap-1 mb-5 2xl:mb-4 border-b border-[#3e6ff4]/20 overflow-x-auto pb-px">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-all whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'text-[#60a5fa] border-b-2 border-[#3e6ff4]'
                        : 'text-[#CAC4CF] hover:text-white'
                    }`}
                  >
                    {tab.label}
                    {tab.key !== 'all' && (
                      <span className="ml-1.5 text-xs opacity-60">
                        ({smsList.filter(s => s.status === tab.key).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Content */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-[#3e6ff4]/30 border-t-[#3e6ff4] rounded-full animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState tab={activeTab} onCreateClick={() => { setLockedCampaign(null); setShowModal(true) }} />
              ) : (
                <div className="overflow-hidden rounded-2xl border border-[#3e6ff4]/20 bg-[#1f2937]/60 shadow-[0_24px_60px_rgba(15,23,42,0.24)]">
                  <div className="flex items-center justify-between gap-3 border-b border-[#3e6ff4]/15 bg-[linear-gradient(135deg,rgba(17,24,39,0.96),rgba(31,41,55,0.92))] px-4 py-3">
                    <div>
                      <p className="text-xs text-left font-semibold text-white">SMS Queue</p>
                      <p className="text-xs text-[#CAC4CF]/60">Review drafts, scheduled sends, and delivery status in one compact list.</p>
                    </div>
                    <span className="rounded-full border border-[#3e6ff4]/20 bg-[#3e6ff4]/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#60a5fa]">
                      {filtered.length} shown
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-[860px] w-full text-xs">
                      <thead className="bg-[#111827]/55">
                        <tr className="border-b border-[#3e6ff4]/15 text-left">
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#CAC4CF]">Message</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#CAC4CF]">Audience</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#CAC4CF]">Sender</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#CAC4CF]">Status</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#CAC4CF]">Created</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-[#CAC4CF]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#3e6ff4]/10">
                        {filtered.map((sms) => (
                          <SmsTableRow key={sms.id} sms={sms} onDelete={handleDelete} onSend={handleGoToSending} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {showModal && (
        <CreateSmsModal
          onClose={() => {
            setShowModal(false)
            setLockedCampaign(null)
          }}
          onCreate={handleCreate}
          submitting={submitting}
          lockedCampaign={lockedCampaign}
        />
      )}
    </div>
  )
}
