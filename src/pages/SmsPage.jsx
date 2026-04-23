import { useState, useEffect } from 'react'
import Header from '../components/Header'
import TopBar from '../components/TopBar'
import { getSmsList, createSms, deleteSms } from '../service/api/sms'
import { getContents } from '../service/api/campaign'
import { getContactLists } from '../service/api/segments'

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const generateSlug = () =>
  Math.random().toString(36).slice(2, 10) + '-' + Date.now().toString(36)

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

// ── Shared input classes ──────────────────────────────────────────────────────

const inputCls =
  'w-full bg-[#111827] border border-[#3e6ff4]/30 focus:border-[#3e6ff4] text-white text-sm rounded-lg px-4 py-2.5 outline-none placeholder-[#CAC4CF]/50 transition-colors'

const selectCls =
  'w-full bg-[#111827] border border-[#3e6ff4]/30 focus:border-[#3e6ff4] text-white text-sm rounded-lg px-4 py-2.5 outline-none transition-colors'

// ── Section label helper ──────────────────────────────────────────────────────

function SectionLabel({ number, children, note }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="w-6 h-6 rounded-full bg-[#3e6ff4]/20 border border-[#3e6ff4]/50 flex items-center justify-center text-[#60a5fa] text-xs font-bold shrink-0">
        {number}
      </span>
      <span className="text-sm font-medium text-white">{children}</span>
      {note && <span className="text-xs text-[#CAC4CF]/50 ml-auto">{note}</span>}
    </div>
  )
}

// ── Create SMS Modal ──────────────────────────────────────────────────────────

const INIT_FORM = { content: '', contactList: '', sender: '', body: '' }

function CreateSmsModal({ onClose, onCreate, submitting }) {
  const [form, setForm] = useState(INIT_FORM)
  const [errors, setErrors] = useState({})
  const [contents, setContents] = useState([])
  const [contactLists, setContactLists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getContents().catch(() => []),
      getContactLists().catch(() => []),
    ]).then(([c, cl]) => {
      setContents(c)
      setContactLists(cl)
    }).finally(() => setLoading(false))
  }, [])

  const field = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const validate = () => {
    const e = {}
    if (!form.contactList) e.contactList = 'Please select a contact list.'
    if (!form.sender.trim()) e.sender = 'Sender is required.'
    if (!form.body.trim()) e.body = 'SMS body is required.'
    if (form.body.length > 1600) e.body = 'Body cannot exceed 1600 characters.'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    const selectedContent = contents.find(c => String(c.id) === String(form.content))
    onCreate({
      contact_list: form.contactList,
      sender: form.sender.trim(),
      body: form.body.trim(),
      selectedContent,
    })
  }

  const segs = smsSegments(form.body)
  const charsLeft = 1600 - form.body.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-gradient-to-br from-[#1f2937] to-[#1D1A22] border border-[#3e6ff4]/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3e6ff4]/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3e6ff4]/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#60a5fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">Create New SMS</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#CAC4CF] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-[#3e6ff4]/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[76vh]">

          {/* ① Content */}
          <div>
            <SectionLabel number="1" note="Optional">Campaign Content</SectionLabel>
            <p className="text-xs text-[#CAC4CF]/60 mb-3">
              Attach content to generate a trackable landing page for each recipient.
            </p>
            {loading ? (
              <div className="flex items-center gap-2 bg-[#111827] border border-[#3e6ff4]/30 rounded-lg px-4 py-2.5">
                <div className="w-3.5 h-3.5 border-2 border-[#3e6ff4]/30 border-t-[#3e6ff4] rounded-full animate-spin" />
                <span className="text-[#CAC4CF]/50 text-sm">Loading...</span>
              </div>
            ) : (
              <select value={form.content} onChange={e => field('content', e.target.value)} className={selectCls}>
                <option value="">No content attached</option>
                {contents.map(c => (
                  <option key={c.id} value={c.id}>
                    #{c.id}{c.title ? ` — ${c.title}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-[#3e6ff4]/10" />

          {/* ② Contact List */}
          <div>
            <SectionLabel number="2">Audience</SectionLabel>
            {loading ? (
              <div className="flex items-center gap-2 bg-[#111827] border border-[#3e6ff4]/30 rounded-lg px-4 py-2.5">
                <div className="w-3.5 h-3.5 border-2 border-[#3e6ff4]/30 border-t-[#3e6ff4] rounded-full animate-spin" />
                <span className="text-[#CAC4CF]/50 text-sm">Loading...</span>
              </div>
            ) : (
              <select
                value={form.contactList}
                onChange={e => { field('contactList', e.target.value); setErrors(p => ({ ...p, contactList: '' })) }}
                className={selectCls}
              >
                <option value="">Select a contact list...</option>
                {contactLists.map(cl => (
                  <option key={cl.id} value={cl.id}>
                    {cl.segment_name}
                    {cl.contact_lenght != null ? ` (${cl.contact_lenght} contacts)` : ''}
                  </option>
                ))}
              </select>
            )}
            {errors.contactList && <p className="text-red-400 text-xs mt-1">{errors.contactList}</p>}
          </div>

          {/* Divider */}
          <div className="border-t border-[#3e6ff4]/10" />

          {/* ③ SMS Body */}
          <div>
            <SectionLabel number="3">SMS Message</SectionLabel>
            <textarea
              rows={5}
              maxLength={1600}
              placeholder="Type your SMS message here..."
              value={form.body}
              onChange={e => { field('body', e.target.value); setErrors(p => ({ ...p, body: '' })) }}
              className={`${inputCls} resize-none leading-relaxed`}
            />
            <div className="flex items-center justify-between mt-1.5">
              {errors.body
                ? <p className="text-red-400 text-xs">{errors.body}</p>
                : <span className="text-xs text-[#CAC4CF]/40">Max 1600 characters</span>}
              <div className="flex items-center gap-2 text-xs text-[#CAC4CF]/50 shrink-0">
                {form.body.length > 0 && (
                  <span className="text-[#60a5fa]/70 bg-[#3e6ff4]/10 px-2 py-0.5 rounded-full">
                    {segs} SMS segment{segs !== 1 ? 's' : ''}
                  </span>
                )}
                <span className={charsLeft < 50 ? 'text-amber-400' : ''}>
                  {form.body.length} / 1600
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#3e6ff4]/10" />

          {/* ④ Sender */}
          <div>
            <SectionLabel number="4">Sender</SectionLabel>
            <input
              type="text"
              placeholder="e.g. +1234567890 or MyBrand"
              value={form.sender}
              onChange={e => { field('sender', e.target.value); setErrors(p => ({ ...p, sender: '' })) }}
              className={inputCls}
            />
            {errors.sender && <p className="text-red-400 text-xs mt-1">{errors.sender}</p>}
            <p className="text-xs text-[#CAC4CF]/40 mt-1.5">Phone number in E.164 format or registered alphanumeric sender ID.</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-[#3e6ff4]/30 text-[#CAC4CF] hover:text-white hover:border-[#3e6ff4]/60 text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : 'Create SMS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── SMS Row Card ──────────────────────────────────────────────────────────────

function SmsCard({ sms, onDelete }) {
  const segs = smsSegments(sms.body)
  return (
    <div className="bg-[#1f2937] border border-[#3e6ff4]/20 rounded-xl p-5 flex flex-col gap-3 hover:border-[#3e6ff4]/40 transition-all duration-200">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[sms.status] ?? STATUS_STYLE.draft}`}>
            {STATUS_LABEL[sms.status] ?? sms.status}
          </span>
          {segs > 0 && (
            <span className="text-xs text-[#CAC4CF]/60 bg-[#111827] border border-[#3e6ff4]/10 px-2 py-0.5 rounded-full">
              {segs} segment{segs !== 1 ? 's' : ''}
            </span>
          )}
          {sms.contact_list && (
            <span className="text-xs text-[#3e6ff4]/80 bg-[#3e6ff4]/10 border border-[#3e6ff4]/20 px-2 py-0.5 rounded-full">
              List #{sms.contact_list}
            </span>
          )}
        </div>
        <button
          onClick={() => onDelete(sms.id)}
          className="p-1.5 rounded-lg text-[#CAC4CF]/40 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
          title="Delete SMS"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Body preview */}
      <div className="bg-[#111827]/70 rounded-lg px-4 py-3 border border-[#3e6ff4]/10">
        <p className="text-[#CAC4CF] text-sm leading-relaxed line-clamp-3">
          {sms.body || <span className="italic opacity-40">No body</span>}
        </p>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 text-xs text-[#CAC4CF]/50 border-t border-[#3e6ff4]/10 pt-2.5">
        {sms.sender && (
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {sms.sender}
          </div>
        )}
        <div className="flex items-center gap-1.5 ml-auto">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatDate(sms.created_at)}
        </div>
      </div>
    </div>
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
      <h3 className="text-white font-semibold text-lg">
        {tab === 'all' ? 'No SMS messages yet' : `No ${tab} messages`}
      </h3>
      <p className="text-[#CAC4CF] text-sm max-w-xs">
        {tab === 'all'
          ? 'Create your first SMS to start reaching your audience.'
          : `You have no ${tab} SMS messages.`}
      </p>
      {tab === 'all' && (
        <button
          onClick={onCreateClick}
          className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
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
  const [smsList, setSmsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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

  const handleCreate = async ({ contact_list, sender, body, selectedContent }) => {
    setSubmitting(true)
    try {
      const newSms = await createSms({ contact_list, sender, body, status: 'draft' })
      
      setSmsList(prev => [newSms, ...prev])
      setShowModal(false)
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
        <div className="flex-1 m-4 bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827] rounded-2xl border border-[#3e6ff4]/20 overflow-hidden flex flex-col h-full">
          <main className="flex-1 flex flex-col p-4 md:p-8 2xl:p-5 overflow-y-auto overflow-x-hidden">
            <div className="w-full max-w-6xl 2xl:max-w-5xl mx-auto">

              {/* Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 2xl:mb-5">
                <div>
                  <h1 className="text-2xl md:text-3xl 2xl:text-2xl font-bold text-white">SMS</h1>
                  <p className="text-[#CAC4CF] text-sm 2xl:text-xs mt-1">
                    Create and manage SMS messages with trackable landing pages.
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 2xl:px-4 2xl:py-2 rounded-xl bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] text-white font-semibold text-sm hover:opacity-90 transition-opacity shrink-0 self-start"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New SMS
                </button>
              </div>

              {/* Error banner */}
              {error && (
                <div className="mb-4 flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/40 text-red-400 rounded-xl px-4 py-3 text-sm">
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
                      <p className={`text-2xl 2xl:text-xl font-bold ${color}`}>{value}</p>
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
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all whitespace-nowrap ${
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
                <EmptyState tab={activeTab} onCreateClick={() => setShowModal(true)} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 2xl:gap-3">
                  {filtered.map(sms => (
                    <SmsCard key={sms.id} sms={sms} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {showModal && (
        <CreateSmsModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
          submitting={submitting}
        />
      )}
    </div>
  )
}
