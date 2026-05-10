import { useState, useEffect } from 'react'
import Header from '../components/Header'
import TopBar from '../components/TopBar'
import { getCampaigns, createCampaign, deleteCampaign, getContents } from '../service/api/campaign'

// ─── Tabs — aligned with backend STATUS_CHOICES ────────────────────────────────
const TABS = [
  { key: 'active', label: 'Active' },
  { key: 'draft', label: 'Drafts' },
  { key: 'paused', label: 'Paused' },
]

// ─── Create Campaign Modal ─────────────────────────────────────────────────────
// POST body: { name, description, status }
const INITIAL_FORM = {
  name: '',
  description: '',
  content: '', // content ID (number), optional
}

function CreateCampaignModal({ onClose, onCreate, submitting }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [contents, setContents] = useState([])
  const [contentsLoading, setContentsLoading] = useState(true)

  useEffect(() => {
    getContents()
      .then(data => setContents(data))
      .catch(() => setContents([]))
      .finally(() => setContentsLoading(false))
  }, [])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Campaign name is required.'
    if (!form.description.trim()) e.description = 'Description is required.'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    onCreate(form)
  }

  const field = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-xl bg-gradient-to-br from-[#1f2937] to-[#1D1A22] border border-[#3e6ff4]/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3e6ff4]/20">
          <h2 className="text-lg font-bold text-white">Create New Campaign</h2>
          <button
            onClick={onClose}
            className="text-[#CAC4CF] hover:text-white transition-colors p-1 rounded-lg hover:bg-[#3e6ff4]/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Campaign Name */}
          <div>
            <label className="block text-sm text-[#CAC4CF] mb-1">Campaign Name</label>
            <input
              type="text"
              placeholder="e.g. Summer Flash Sale"
              value={form.name}
              onChange={e => field('name', e.target.value)}
              className="w-full bg-[#111827] border border-[#3e6ff4]/30 focus:border-[#3e6ff4] text-white text-sm rounded-lg px-4 py-2.5 outline-none placeholder-[#CAC4CF]/50 transition-colors"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm text-[#CAC4CF] mb-1">
              Content
              <span className="ml-2 text-[#3e6ff4]/70 text-xs">Optional — link an existing content</span>
            </label>
            {contentsLoading ? (
              <div className="w-full bg-[#111827] border border-[#3e6ff4]/30 rounded-lg px-4 py-2.5 flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-[#3e6ff4]/30 border-t-[#3e6ff4] rounded-full animate-spin" />
                <span className="text-[#CAC4CF]/50 text-sm">Loading content...</span>
              </div>
            ) : (
              <select
                value={form.content}
                onChange={e => field('content', e.target.value)}
                className="w-full bg-[#111827] border border-[#3e6ff4]/30 focus:border-[#3e6ff4] text-white text-sm rounded-lg px-4 py-2.5 outline-none transition-colors"
              >
                <option value="">None</option>
                {contents.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.title || `Content #${c.id}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-[#CAC4CF] mb-1">Description</label>
            <textarea
              rows={4}
              placeholder="Describe the goal and audience of this campaign..."
              value={form.description}
              onChange={e => field('description', e.target.value)}
              className="w-full bg-[#111827] border border-[#3e6ff4]/30 focus:border-[#3e6ff4] text-white text-sm rounded-lg px-4 py-2.5 outline-none placeholder-[#CAC4CF]/50 resize-none transition-colors"
            />
            <div className="flex justify-between mt-1">
              {errors.description
                ? <p className="text-red-400 text-xs">{errors.description}</p>
                : <span />}
              <span className="text-[#CAC4CF]/50 text-xs">{form.description.length} chars</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-[#3e6ff4]/30 text-[#CAC4CF] hover:text-white hover:border-[#3e6ff4]/60 text-sm font-medium transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Save Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Status Badge — covers all model STATUS_CHOICES ───────────────────────────
function StatusBadge({ status }) {
  const styles = {
    active: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
    draft: 'bg-[#CAC4CF]/10 text-[#CAC4CF] border border-[#CAC4CF]/20',
    paused: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
    completed: 'bg-[#3e6ff4]/20 text-[#60a5fa] border border-[#3e6ff4]/40',
  }
  const labels = { active: 'Active', draft: 'Draft', paused: 'Paused', completed: 'Completed' }
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[status] ?? styles.draft}`}>
      {labels[status] ?? status}
    </span>
  )
}

// ─── Campaign Card — unified, uses model fields ────────────────────────────────
function CampaignCard({ campaign, onDelete }) {
  const formattedDate = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="bg-[#1f2937] border border-[#3e6ff4]/20 rounded-xl p-5 flex flex-col gap-4 hover:border-[#3e6ff4]/50 transition-all duration-200">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <StatusBadge status={campaign.status} />
            {campaign.content && (
              <span className="text-[#3e6ff4]/80 text-xs font-medium bg-[#3e6ff4]/10 border border-[#3e6ff4]/20 px-2 py-0.5 rounded-full">
                Content linked
              </span>
            )}
          </div>
          <h3 className="text-white font-semibold text-base truncate">{campaign.name}</h3>
        </div>
        <div className="flex gap-1 shrink-0">
          <button className="p-1.5 rounded-lg text-[#CAC4CF] hover:text-white hover:bg-[#3e6ff4]/20 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(campaign.id)}
            className="p-1.5 rounded-lg text-[#CAC4CF] hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Description */}
      {campaign.description ? (
        <p className="text-[#CAC4CF]/70 text-sm line-clamp-3 bg-[#111827]/60 rounded-lg px-3 py-2 border border-[#3e6ff4]/10">
          {campaign.description}
        </p>
      ) : (
        <p className="text-[#CAC4CF]/30 text-sm italic bg-[#111827]/60 rounded-lg px-3 py-2 border border-[#3e6ff4]/10">
          No description provided.
        </p>
      )}

      {/* Timestamps */}
      <div className="flex flex-col gap-1 border-t border-[#3e6ff4]/10 pt-3">
        <div className="flex items-center gap-1.5 text-xs text-[#CAC4CF]/50">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Created: {formattedDate(campaign.created_at)}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#CAC4CF]/40">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Updated: {formattedDate(campaign.updated_at)}
        </div>
      </div>
    </div>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ tab, onCreateClick }) {
  const config = {
    active: {
      icon: (
        <svg className="w-10 h-10 text-[#3e6ff4]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'No active campaigns',
      desc: 'Launch your first campaign to start reaching your audience.',
    },
    draft: {
      icon: (
        <svg className="w-10 h-10 text-[#3e6ff4]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'No drafts yet',
      desc: 'Save a campaign as a draft to continue editing it later.',
    },
    paused: {
      icon: (
        <svg className="w-10 h-10 text-[#3e6ff4]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'No paused campaigns',
      desc: 'Paused campaigns will appear here.',
    },
  }
  const { icon, title, desc } = config[tab] ?? config.draft
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-20 h-20 rounded-full bg-[#3e6ff4]/10 border border-[#3e6ff4]/20 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-white font-semibold text-lg">{title}</h3>
      <p className="text-[#CAC4CF] text-sm max-w-xs">{desc}</p>
      <button
        onClick={onCreateClick}
        className="mt-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Create Campaign
      </button>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
const CampaignPage = () => {
  const [activeTab, setActiveTab] = useState('active')
  // campaigns is a flat array matching the backend response list
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const data = await getCampaigns()
      setCampaigns(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching campaigns:', err)
      setError('Failed to load campaigns.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (form) => {
    try {
      setSubmitting(true)
      const created = await createCampaign({
        name: form.name,
        description: form.description,
        content: form.content !== '' ? Number(form.content) : null,
        status: 'draft',
      })
      setCampaigns(prev => [created, ...prev])
      setActiveTab('draft')
      setSuccessMsg('Draft saved successfully!')
      setShowModal(false)
      setTimeout(() => setSuccessMsg(''), 3500)
    } catch (err) {
      console.error('Error creating campaign:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteCampaign(id)
      setCampaigns(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      console.error('Error deleting campaign:', err)
    }
  }

  const filtered = campaigns.filter(c => c.status === activeTab)

  const tabCounts = {
    active: campaigns.filter(c => c.status === 'active').length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    paused: campaigns.filter(c => c.status === 'paused').length,
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827]">
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        <Header />

        <div className="flex-1 m-4 bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827] rounded-2xl border border-[#3e6ff4]/20 overflow-hidden flex flex-col h-full">
          <main className="flex-1 flex flex-col p-4 md:p-6 xl:p-8 2xl:p-5 overflow-y-auto overflow-x-hidden">
            <div className="w-full max-w-6xl 2xl:max-w-5xl mx-auto">

              {/* Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 2xl:mb-5">
                <div>
                  <h1 className="text-2xl md:text-3xl xl:text-4xl 2xl:text-3xl font-bold text-white mb-1">
                    <span className="bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] bg-clip-text text-transparent">Campaigns</span>
                  </h1>
                  <p className="text-sm md:text-base text-[#CAC4CF]">
                    Manage and track all your SMS campaigns in one place.
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] text-white font-semibold text-sm hover:opacity-90 transition-opacity shrink-0 self-start sm:self-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Campaign
                </button>
              </div>

              {/* Success Toast */}
              {successMsg && (
                <div className="mb-5 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 rounded-xl px-4 py-3 text-sm font-medium">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {successMsg}
                </div>
              )}

              {/* Error Banner */}
              {error && (
                <div className="mb-5 flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/40 text-red-400 rounded-xl px-4 py-3 text-sm">
                  <span>{error}</span>
                  <button onClick={fetchCampaigns} className="text-xs underline hover:no-underline shrink-0">
                    Retry
                  </button>
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 md:mb-8 2xl:mb-5">
                <div className="bg-[#1f2937] border border-emerald-500/20 rounded-xl p-4 2xl:p-3 flex items-center gap-4 2xl:gap-3">
                  <div className="w-10 h-10 2xl:w-8 2xl:h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 2xl:w-4 2xl:h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl 2xl:text-xl font-bold text-emerald-400">{tabCounts.active}</div>
                    <div className="text-[#CAC4CF] text-xs">Active Campaigns</div>
                  </div>
                </div>
                <div className="bg-[#1f2937] border border-[#CAC4CF]/10 rounded-xl p-4 2xl:p-3 flex items-center gap-4 2xl:gap-3">
                  <div className="w-10 h-10 2xl:w-8 2xl:h-8 rounded-xl bg-[#CAC4CF]/5 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 2xl:w-4 2xl:h-4 text-[#CAC4CF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl 2xl:text-xl font-bold text-[#CAC4CF]">{tabCounts.draft}</div>
                    <div className="text-[#CAC4CF] text-xs">Drafts</div>
                  </div>
                </div>
                <div className="bg-[#1f2937] border border-amber-500/20 rounded-xl p-4 2xl:p-3 flex items-center gap-4 2xl:gap-3">
                  <div className="w-10 h-10 2xl:w-8 2xl:h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 2xl:w-4 2xl:h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl 2xl:text-xl font-bold text-amber-400">{tabCounts.paused}</div>
                    <div className="text-[#CAC4CF] text-xs">Paused</div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-6 2xl:mb-4 bg-[#1f2937]/60 border border-[#3e6ff4]/20 p-1 rounded-xl w-fit">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab.key
                        ? 'bg-[#3e6ff4] text-white shadow'
                        : 'text-[#CAC4CF] hover:text-white hover:bg-[#3e6ff4]/10'
                    }`}
                  >
                    {tab.label}
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.key
                        ? 'bg-white/20 text-white'
                        : 'bg-[#3e6ff4]/20 text-[#60a5fa]'
                    }`}>
                      {tabCounts[tab.key]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-16">
                  <div className="w-10 h-10 border-4 border-[#3e6ff4]/30 border-t-[#3e6ff4] rounded-full animate-spin" />
                </div>
              )}

              {/* Campaign Grid */}
              {!loading && (
                filtered.length === 0
                  ? <EmptyState tab={activeTab} onCreateClick={() => setShowModal(true)} />
                  : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                      {filtered.map(c => (
                        <CampaignCard key={c.id} campaign={c} onDelete={handleDelete} />
                      ))}
                    </div>
                  )
              )}

            </div>
          </main>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <CreateCampaignModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
          submitting={submitting}
        />
      )}
    </div>
  )
}

export default CampaignPage
