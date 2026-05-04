import { useState, useEffect } from 'react'
import Header from '../components/Header'
import TopBar from '../components/TopBar'
import {
  getContacts,
  createContact,
  deleteContact,
} from '../service/api/segments'

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const avatarStyle = (idx) => ({
  background: `hsl(${(idx * 57 + 200) % 360}, 55%, 32%)`,
  color: `hsl(${(idx * 57 + 200) % 360}, 85%, 78%)`,
})

const STATUS_BADGE = {
  subscribed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  opted_out:  'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  bounced:    'bg-red-500/10 text-red-400 border border-red-500/20',
  blocked:    'bg-red-900/20 text-red-500 border border-red-800/30',
}

const SOURCE_BADGE = {
  shopify:  'bg-green-500/10 text-green-400 border border-green-500/20',
  import:   'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  manual:   'bg-[#CAC4CF]/10 text-[#CAC4CF] border border-[#CAC4CF]/20',
  api:      'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  keyword:  'bg-orange-500/10 text-orange-400 border border-orange-500/20',
}

const STATUS_OPTS = [
  { value: 'subscribed', label: 'Subscribed' },
  { value: 'opted_out',  label: 'Opted Out' },
  { value: 'bounced',    label: 'Bounced' },
  { value: 'blocked',    label: 'Blocked' },
]

const SOURCE_OPTS = [
  { value: 'manual',  label: 'Manual' },
  { value: 'import',  label: 'Import' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'api',     label: 'API' },
  { value: 'keyword', label: 'Keyword Opt-In' },
]

const inputCls  = 'w-full bg-[#111827] border border-[#3e6ff4]/30 text-white rounded-lg px-3 py-2.5 text-sm placeholder-[#CAC4CF]/40 focus:outline-none focus:border-[#3e6ff4] transition-colors'
const selectCls = 'w-full bg-[#111827] border border-[#3e6ff4]/30 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#3e6ff4] transition-colors'

// ── Create Customer Modal ─────────────────────────────────────────────────────

const INIT_FORM = { first_name: '', last_name: '', phone: '', status: 'subscribed', source: 'manual' }

function CreateCustomerModal({ onClose, onCreate, submitting }) {
  const [form, setForm] = useState(INIT_FORM)
  const [error, setError] = useState('')

  const set = (field) => (e) => { setForm(f => ({ ...f, [field]: e.target.value })); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.phone.trim()) { setError('Phone number is required.'); return }
    try {
      await onCreate(form)
      onClose()
    } catch (err) {
      setError(err?.response?.data?.phone?.[0] || err.message || 'Failed to create customer.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-[#1D1A22] border border-[#3e6ff4]/30 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3e6ff4]/15 border border-[#3e6ff4]/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#60a5fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">New Customer</h2>
          </div>
          <button onClick={onClose} disabled={submitting} className="text-[#CAC4CF] hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-[#CAC4CF] mb-1.5 font-medium">First Name</label>
              <input type="text" value={form.first_name} onChange={set('first_name')} placeholder="Alice" maxLength={100} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-[#CAC4CF] mb-1.5 font-medium">Last Name</label>
              <input type="text" value={form.last_name} onChange={set('last_name')} placeholder="Johnson" maxLength={100} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-[#CAC4CF] mb-1.5 font-medium">
              Phone <span className="text-red-400">*</span>
              <span className="ml-1 text-[#CAC4CF]/50 font-normal">E.164 format</span>
            </label>
            <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+12025551234" maxLength={20} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-[#CAC4CF] mb-1.5 font-medium">Status</label>
              <select value={form.status} onChange={set('status')} className={selectCls}>
                {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#CAC4CF] mb-1.5 font-medium">Source</label>
              <select value={form.source} onChange={set('source')} className={selectCls}>
                {SOURCE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={submitting}
              className="flex-1 py-2.5 rounded-xl border border-[#3e6ff4]/30 text-[#CAC4CF] hover:text-white text-sm font-medium transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
              {submitting ? 'Creating…' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchContacts = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getContacts()
      setContacts(Array.isArray(data) ? data : (data.results ?? []))
    } catch {
      setError('Failed to load customers. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchContacts() }, [])

  const handleCreate = async (form) => {
    setSubmitting(true)
    try {
      const created = await createContact({
        phone: form.phone.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        status: form.status,
        source: form.source,
      })
      setContacts(prev => [created, ...prev])
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteContact(id)
      setContacts(prev => prev.filter(c => c.id !== id))
    } catch {
      setError('Failed to delete customer.')
    } finally {
      setDeleteConfirmId(null)
    }
  }

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase()
    return (
      c.phone?.toLowerCase().includes(q) ||
      c.first_name?.toLowerCase().includes(q) ||
      c.last_name?.toLowerCase().includes(q)
    )
  })

  const subscribedCount = contacts.filter(c => c.status === 'subscribed').length
  const shopifyCount    = contacts.filter(c => c.source === 'shopify').length

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827]">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Header />
        <div className="flex-1 m-4 bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827] rounded-2xl border border-[#3e6ff4]/20 overflow-hidden flex flex-col h-full">
          <main className="flex-1 flex flex-col p-4 md:p-8 2xl:p-5 overflow-y-auto overflow-x-hidden">
            <div className="w-full max-w-6xl 2xl:max-w-5xl mx-auto">

              {/* Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 2xl:mb-5">
                <div>
                  <h1 className="text-2xl md:text-4xl 2xl:text-3xl font-bold text-white mb-1">
                    <span className="bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] bg-clip-text text-transparent">Customers</span>
                  </h1>
                  <p className="text-sm md:text-base text-[#CAC4CF]">All imported and manually added contacts.</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] text-white font-semibold text-sm hover:opacity-90 transition-opacity shrink-0 self-start sm:self-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Customer
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 md:mb-8 2xl:mb-5">
                <div className="bg-[#1f2937] border border-[#3e6ff4]/20 rounded-xl p-4 2xl:p-3 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#3e6ff4]/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#60a5fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl 2xl:text-xl font-bold text-white">{contacts.length.toLocaleString()}</div>
                    <div className="text-[#CAC4CF] text-xs">Total Customers</div>
                  </div>
                </div>
                <div className="bg-[#1f2937] border border-emerald-500/20 rounded-xl p-4 2xl:p-3 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl 2xl:text-xl font-bold text-emerald-400">{subscribedCount.toLocaleString()}</div>
                    <div className="text-[#CAC4CF] text-xs">Subscribed</div>
                  </div>
                </div>
                <div className="bg-[#1f2937] border border-green-500/20 rounded-xl p-4 2xl:p-3 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl 2xl:text-xl font-bold text-green-400">{shopifyCount.toLocaleString()}</div>
                    <div className="text-[#CAC4CF] text-xs">From Shopify</div>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-5">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CAC4CF]/50 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name or phone…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#1f2937] border border-[#3e6ff4]/20 text-white rounded-xl text-sm placeholder-[#CAC4CF]/40 focus:outline-none focus:border-[#3e6ff4] transition-colors"
                />
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mb-5 flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/40 text-red-400 rounded-xl px-4 py-3 text-sm">
                  <span>{error}</span>
                  <button onClick={fetchContacts} className="text-xs underline hover:no-underline shrink-0">Retry</button>
                </div>
              )}

              {/* Table */}
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-10 h-10 border-4 border-[#3e6ff4]/30 border-t-[#3e6ff4] rounded-full animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-[#1f2937]/60 border border-[#3e6ff4]/20 rounded-xl flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#3e6ff4]/10 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-[#3e6ff4]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-white font-semibold mb-1">{search ? 'No customers found' : 'No customers yet'}</p>
                  <p className="text-[#CAC4CF] text-sm mb-4">
                    {search ? 'Try a different search term' : 'Add your first customer to get started'}
                  </p>
                  {!search && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-4 py-2 rounded-lg bg-[#3e6ff4]/20 hover:bg-[#3e6ff4]/30 text-[#60a5fa] text-sm font-medium border border-[#3e6ff4]/30 transition-colors"
                    >
                      New Customer
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-[#1f2937]/60 border border-[#3e6ff4]/20 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#3e6ff4]/20 bg-[#111827]/40">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-[#CAC4CF] uppercase tracking-wider">Name</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-[#CAC4CF] uppercase tracking-wider">Phone</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-[#CAC4CF] uppercase tracking-wider hidden md:table-cell">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-[#CAC4CF] uppercase tracking-wider hidden lg:table-cell">Source</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-[#CAC4CF] uppercase tracking-wider hidden xl:table-cell">Added</th>
                        <th className="py-3 px-4 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3e6ff4]/10">
                      {filtered.map((c, idx) => {
                        const displayName = [c.first_name, c.last_name].filter(Boolean).join(' ') || '—'
                        const initials = [c.first_name?.[0], c.last_name?.[0]].filter(Boolean).join('').toUpperCase() || c.phone?.slice(-2)
                        return (
                          <tr key={c.id} className="hover:bg-[#3e6ff4]/5 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={avatarStyle(idx)}>
                                  {initials}
                                </div>
                                <span className="text-white font-medium">{displayName}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-[#CAC4CF] font-mono text-xs">{c.phone}</td>
                            <td className="py-3.5 px-4 hidden md:table-cell">
                              <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_BADGE[c.status] ?? 'bg-[#CAC4CF]/10 text-[#CAC4CF]'}`}>
                                {c.status?.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 hidden lg:table-cell">
                              <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium capitalize ${SOURCE_BADGE[c.source] ?? 'bg-[#CAC4CF]/10 text-[#CAC4CF]'}`}>
                                {c.source?.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-[#CAC4CF] hidden xl:table-cell">{formatDate(c.created_at)}</td>
                            <td className="py-3.5 px-4 text-right">
                              {deleteConfirmId === c.id ? (
                                <div className="flex items-center gap-1 justify-end">
                                  <button
                                    onClick={() => handleDelete(c.id)}
                                    className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="px-2 py-1 rounded text-xs font-medium bg-[#CAC4CF]/10 text-[#CAC4CF] hover:bg-[#CAC4CF]/20 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmId(c.id)}
                                  className="p-1.5 rounded-lg text-[#CAC4CF]/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  title="Delete customer"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {filtered.length > 0 && (
                <p className="text-xs text-[#CAC4CF]/50 mt-3">
                  {filtered.length} of {contacts.length} customer{contacts.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </main>
        </div>
      </div>

      {showCreateModal && (
        <CreateCustomerModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
          submitting={submitting}
        />
      )}
    </div>
  )
}
