import { useState, useEffect, useMemo } from 'react'
import Header from '../components/Header'
import TopBar from '../components/TopBar'
import {
  getContactLists,
  createContactList,
  deleteContactList,
  getContacts,
  getSegmentMembers,
  addContactToSegment,
  removeContactFromSegment
} from '../service/api/segments'
import { useFirstCampaignGuide } from '../guide/FirstCampaignGuideProvider'

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

// ── Create Segment Modal ──────────────────────────────────────────────────────

const INIT_SEG = { segment_name: '' }

function CreateSegmentModal({ onClose, onCreate, submitting }) {
  const { active, currentStepId } = useFirstCampaignGuide()
  const [form, setForm] = useState(INIT_SEG)
  const [error, setError] = useState('')
  const isGuideLocked = active && currentStepId === 'audience-segment-form'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.segment_name.trim()) { setError('Segment name is required.'); return }
    const created = await onCreate(form)
    if (!created) {
      setError('Failed to create segment.')
      return
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={isGuideLocked ? undefined : onClose}>
      <div data-guide-id="audience-segment-form" onClick={(event) => event.stopPropagation()} className="bg-[#1D1A22] border border-[#3e6ff4]/30 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3e6ff4]/15 border border-[#3e6ff4]/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#60a5fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-white">Create Segment</h2>
          </div>
          <button onClick={onClose} className="text-[#CAC4CF] hover:text-white transition-colors p-1" disabled={submitting || isGuideLocked}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[#CAC4CF] mb-1.5 font-medium">
              Segment Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.segment_name}
              onChange={e => { setForm(f => ({ ...f, segment_name: e.target.value })); setError('') }}
              placeholder="e.g. VIP Customers"
              maxLength={50}
              className="w-full bg-[#111827] border border-[#3e6ff4]/30 text-white rounded-lg px-3 py-2.5 text-xs placeholder-[#CAC4CF]/40 focus:outline-none focus:border-[#3e6ff4] transition-colors"
            />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl border border-[#3e6ff4]/30 text-[#CAC4CF] hover:text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {submitting ? 'Creating…' : 'Create Segment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Add To Segment Modal (picks from existing customers) ──────────────────────

function AddToSegmentModal({ onClose, onAdd, submitting, alreadyInSegment }) {
  const { active, currentStepId } = useFirstCampaignGuide()
  const [allContacts, setAllContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [error, setError] = useState('')
  const isGuideLocked = active && currentStepId === 'audience-add-customers-form'

  useEffect(() => {
    getContacts()
      .then(data => setAllContacts(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => setError('Failed to load customers.'))
      .finally(() => setLoading(false))
  }, [])

  const alreadyIds = useMemo(() => new Set(alreadyInSegment.map(c => c.id)), [alreadyInSegment])

  const filtered = allContacts.filter(c => {
    if (alreadyIds.has(c.id)) return false
    const q = search.toLowerCase()
    return (
      c.phone?.toLowerCase().includes(q) ||
      c.first_name?.toLowerCase().includes(q) ||
      c.last_name?.toLowerCase().includes(q)
    )
  })

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSubmit = async () => {
    if (selected.size === 0) { setError('Select at least one customer.'); return }
    const selectedContacts = allContacts.filter(c => selected.has(c.id))
    const didAdd = await onAdd(selectedContacts)
    if (!didAdd) {
      setError('Failed to add customers to segment.')
      return
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={isGuideLocked ? undefined : onClose}>
      <div data-guide-id="audience-add-customers-form" onClick={(event) => event.stopPropagation()} className="bg-[#1D1A22] border border-[#3e6ff4]/30 rounded-2xl shadow-2xl w-full max-w-lg p-6 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between mb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3e6ff4]/15 border border-[#3e6ff4]/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#60a5fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-white">Add Customers to Segment</h2>
          </div>
          <button onClick={onClose} disabled={submitting || isGuideLocked} className="text-[#CAC4CF] hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3 shrink-0">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CAC4CF]/50 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search customers…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#111827] border border-[#3e6ff4]/20 text-white rounded-xl text-xs placeholder-[#CAC4CF]/40 focus:outline-none focus:border-[#3e6ff4] transition-colors"
          />
        </div>

        {selected.size > 0 && (
          <p className="text-xs text-[#60a5fa] mb-2 shrink-0">
            {selected.size} customer{selected.size !== 1 ? 's' : ''} selected
          </p>
        )}

        {error && <p className="text-red-400 text-xs mb-2 shrink-0">{error}</p>}

        {/* Customer list */}
        <div className="flex-1 overflow-y-auto rounded-xl border border-[#3e6ff4]/20 bg-[#111827]/60 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-[#3e6ff4]/30 border-t-[#3e6ff4] rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <p className="text-white font-medium mb-1">
                {allContacts.length === 0 ? 'No customers found' : search ? 'No results' : 'All customers already in segment'}
              </p>
              <p className="text-[#CAC4CF] text-xs">
                {allContacts.length === 0 ? 'Go to Customers page to add contacts first' : 'Try a different search'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#3e6ff4]/10">
              {filtered.map((c, idx) => {
                const displayName = [c.first_name, c.last_name].filter(Boolean).join(' ') || c.phone
                const initials = [c.first_name?.[0], c.last_name?.[0]].filter(Boolean).join('').toUpperCase() || c.phone?.slice(-2)
                const isChecked = selected.has(c.id)
                return (
                  <li
                    key={c.id}
                    onClick={() => toggleSelect(c.id)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${isChecked ? 'bg-[#3e6ff4]/10' : 'hover:bg-[#3e6ff4]/5'}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelect(c.id)}
                      onClick={e => e.stopPropagation()}
                      className="w-4 h-4 rounded accent-[#3e6ff4] shrink-0"
                    />
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={avatarStyle(idx)}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{displayName}</p>
                      <p className="text-[#CAC4CF] text-xs font-mono">{c.phone}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ${STATUS_BADGE[c.status] ?? 'bg-[#CAC4CF]/10 text-[#CAC4CF]'}`}>
                      {c.status?.replace('_', ' ')}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="flex gap-3 pt-4 shrink-0">
          <button type="button" onClick={onClose} disabled={submitting}
            className="flex-1 py-2.5 rounded-xl border border-[#3e6ff4]/30 text-[#CAC4CF] hover:text-white text-xs font-medium transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || selected.size === 0}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {submitting ? 'Adding…' : `Add ${selected.size > 0 ? selected.size : ''} to Segment`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const AudiencePage = () => {
  const { active, currentStepId, trackAction } = useFirstCampaignGuide()
  const [segments, setSegments] = useState([])
  const [members, setMembers] = useState([])
  const [selectedSegment, setSelectedSegment] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [membersError, setMembersError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [membersLoading, setMembersLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState('')


  const fetchSegments = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getContactLists()
      console.log('AAA',data)
      setSegments(Array.isArray(data) ? data : (data.results ?? []))
    } catch {
      setError('Failed to load segments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSegments() }, [])
  useEffect(() => {
    if (active && currentStepId === 'audience-segment-form') {
      setShowCreateModal(true)
    }
  }, [active, currentStepId])
  useEffect(() => {
    if (active && currentStepId === 'audience-add-customers-form' && selectedSegment) {
      setShowAddModal(true)
    }
  }, [active, currentStepId, selectedSegment])
 console.log('LOLO')
  const handleSelectSegment = (seg) => {
    setSelectedSegment(seg)
    setMembers([])
    setMembersError('')
    setMembersLoading(true)
    getSegmentMembers(seg.id)
      .then(data => setMembers(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => setMembersError('Failed to load segment members.'))
      .finally(() => setMembersLoading(false))
  }

  const handleCreateSegment = async (form) => {
    setSubmitting(true)
    try {
      const created = await createContactList({ segment_name: form.segment_name })
      setSegments(prev => [...prev, created])
      if (active && currentStepId === 'audience-segment-form') {
        setSelectedSegment(created)
        setMembers([])
      }
      trackAction('audience:segment-created', { segment: created })
      return created
    } catch {
      setError('Failed to create segment.')
      return null
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSegment = async (id) => {
    try {
      await deleteContactList(id)
      setSegments(prev => prev.filter(s => s.id !== id))
      if (selectedSegment?.id === id) setSelectedSegment(null)
    } catch {
      setError('Failed to delete segment.')
    } finally {
      setDeleteConfirmId(null)
    }
  }

  // contacts = array of full contact objects to add
  const handleAddToSegment = async (contacts) => {
    setSubmitting(true)
    try {
      await Promise.all(contacts.map(contact => addContactToSegment(selectedSegment.id, contact)))
      setMembers(prev => [...prev, ...contacts])
      const newLength = (selectedSegment.contact_lenght ?? 0) + contacts.length
      setSegments(prev => prev.map(s =>
        s.id === selectedSegment.id ? { ...s, contact_lenght: newLength } : s
      ))
      setSelectedSegment(prev => ({ ...prev, contact_lenght: newLength }))
      trackAction('audience:customers-added', { contacts })
      return true
    } catch {
      setMembersError('Failed to add customers to segment.')
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveFromSegment = async (contactId) => {
    try {
      await removeContactFromSegment(selectedSegment.id, contactId)
      setMembers(prev => prev.filter(c => c.id !== contactId))
      const newLength = Math.max(0, (selectedSegment.contact_lenght ?? 1) - 1)
      setSegments(prev => prev.map(s =>
        s.id === selectedSegment.id ? { ...s, contact_lenght: newLength } : s
      ))
      setSelectedSegment(prev => ({ ...prev, contact_lenght: newLength }))
    } catch {
      setMembersError('Failed to remove customer from segment.')
    }
  }

  const totalRecipients = segments.reduce((sum, s) => sum + (s.contact_lenght ?? 0), 0)

  // ── Recipients View ──────────────────────────────────────────────────────────
  if (selectedSegment) {
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

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-6 2xl:mb-4 text-xs">
                  <button
                    onClick={() => setSelectedSegment(null)}
                    className="flex items-center gap-1.5 text-[#CAC4CF] hover:text-white transition-colors group"
                  >
                    <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Audience
                  </button>
                  <svg className="w-3 h-3 text-[#CAC4CF]/40" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#60a5fa] font-medium">{selectedSegment.segment_name}</span>
                </div>

                {/* Segment Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 2xl:mb-5">
                  <div className='text-left'>
                     <span className="text-2xl md:text-3xl xl:text-4xl 2xl:text-3xl font-bold text-white mb-1">
                    <span className="bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] bg-clip-text text-transparent">{selectedSegment.segment_name}</span>
                  </span>
                   
                    <div className="flex items-center gap-3 mt-1">
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#60a5fa] bg-[#3e6ff4]/10 border border-[#3e6ff4]/30 px-2.5 py-1 rounded-full">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {members.length} member{members.length !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs text-[#CAC4CF]/70">Created {formatDate(selectedSegment.created_at)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddModal(true)
                      trackAction('audience:open-add-customers')
                    }}
                    data-guide-id="audience-add-customers"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] text-white font-semibold text-xs hover:opacity-90 transition-opacity shrink-0 self-start"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Add Customers
                  </button>
                </div>

                {/* Members error */}
                {membersError && (
                  <div className="mb-4 flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/40 text-red-400 rounded-xl px-4 py-3 text-xs">
                    <span>{membersError}</span>
                    <button onClick={() => setMembersError('')} className="text-xs underline hover:no-underline shrink-0">Dismiss</button>
                  </div>
                )}

                {/* Members Table */}
                <div className="bg-[#1f2937]/60 border border-[#3e6ff4]/20 rounded-xl overflow-hidden">
                  {membersLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="w-8 h-8 border-4 border-[#3e6ff4]/30 border-t-[#3e6ff4] rounded-full animate-spin" />
                    </div>
                  ) : members.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-14 h-14 rounded-full bg-[#3e6ff4]/10 flex items-center justify-center mb-4">
                        <svg className="w-7 h-7 text-[#3e6ff4]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <p className="text-white font-semibold mb-1">No customers in this segment</p>
                      <p className="text-[#CAC4CF] text-xs mb-4">Add customers from your Customers list</p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 rounded-lg bg-[#3e6ff4]/20 hover:bg-[#3e6ff4]/30 text-[#60a5fa] text-xs font-medium border border-[#3e6ff4]/30 transition-colors"
                      >
                        Add Customers
                      </button>
                    </div>
                  ) : (
                    <table className="w-full text-xs">
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
                      <tbody className="divide-y divide-[#3e6ff4]/10 text-left">
                        {members.map((c, idx) => {
                          const displayName = [c.first_name, c.last_name].filter(Boolean).join(' ') || c.phone
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
                              <td className="py-3.5 px-4 text-[#CAC4CF] capitalize hidden lg:table-cell">{c.source?.replace('_', ' ')}</td>
                              <td className="py-3.5 px-4 text-[#CAC4CF] hidden xl:table-cell">{formatDate(c.created_at)}</td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  onClick={() => handleRemoveFromSegment(c.id)}
                                  className="p-1.5 rounded-lg text-[#CAC4CF]/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  title="Remove from segment"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {members.length > 0 && (
                  <p className="text-xs text-[#CAC4CF]/50 mt-3">
                    {members.length} customer{members.length !== 1 ? 's' : ''} in this segment
                  </p>
                )}
              </div>
            </main>
          </div>
        </div>

        {showAddModal && (
          <AddToSegmentModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddToSegment}
            submitting={submitting}
            alreadyInSegment={members}
          />
        )}
      </div>
    )
  }

  // ── Segments View ────────────────────────────────────────────────────────────
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 2xl:mb-5">
                <div className='text-left'>
                   <span className="text-2xl md:text-3xl xl:text-4xl 2xl:text-3xl font-bold text-white mb-1">
                    <span className="bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] bg-clip-text text-transparent">Segments</span>
                  </span>
                  <p className="text-xs md:text-sm text-[#CAC4CF]">Manage your contact segments and recipient lists.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
            
                  <button
                    onClick={() => {
                      setShowCreateModal(true)
                      trackAction('audience:open-segment')
                    }}
                    data-guide-id="audience-new-segment"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] text-white font-semibold text-xs hover:opacity-90 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Segment
                  </button>
                </div>
              </div>

              {/* Import feedback */}
              {importMsg && (
                <div className={`mb-5 flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-xs border ${importMsg.toLowerCase().includes('fail') || importMsg.toLowerCase().includes('error') || importMsg.toLowerCase().includes('not connected') ? 'bg-red-500/10 border-red-500/40 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                  <span>{importMsg}</span>
                  <button onClick={() => setImportMsg('')} className="shrink-0 p-1 hover:opacity-70 transition-opacity">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 md:mb-8 2xl:mb-5">
                <div className="bg-[#1f2937] border border-[#3e6ff4]/20 rounded-xl p-4 2xl:p-3 flex items-center gap-4 2xl:gap-3">
                  <div className="w-10 h-10 2xl:w-8 2xl:h-8 rounded-xl bg-[#3e6ff4]/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 2xl:w-4 2xl:h-4 text-[#60a5fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xl 2xl:text-lg font-bold text-white">{segments.length}</div>
                    <div className="text-[#CAC4CF] text-xs">Total Segments</div>
                  </div>
                </div>
                <div className="bg-[#1f2937] border border-emerald-500/20 rounded-xl p-4 2xl:p-3 flex items-center gap-4 2xl:gap-3">
                  <div className="w-10 h-10 2xl:w-8 2xl:h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 2xl:w-4 2xl:h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xl 2xl:text-lg font-bold text-emerald-400">{totalRecipients.toLocaleString()}</div>
                    <div className="text-[#CAC4CF] text-xs">Total Recipients</div>
                  </div>
                </div>
                <div className="bg-[#1f2937] border border-amber-500/20 rounded-xl p-4 2xl:p-3 flex items-center gap-4 2xl:gap-3">
                  <div className="w-10 h-10 2xl:w-8 2xl:h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 2xl:w-4 2xl:h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xl 2xl:text-lg font-bold text-amber-400">{segments.filter(s => (s.contact_lenght ?? 0) > 0).length}</div>
                    <div className="text-[#CAC4CF] text-xs">Non-empty Segments</div>
                  </div>
                </div>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mb-5 flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/40 text-red-400 rounded-xl px-4 py-3 text-xs">
                  <span>{error}</span>
                  <button onClick={fetchSegments} className="text-xs underline hover:no-underline shrink-0">Retry</button>
                </div>
              )}

              {/* Segments Table */}
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-10 h-10 border-4 border-[#3e6ff4]/30 border-t-[#3e6ff4] rounded-full animate-spin" />
                </div>
              ) : segments.length === 0 ? (
                <div className="bg-[#1f2937]/60 border border-[#3e6ff4]/20 rounded-xl flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#3e6ff4]/10 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-[#3e6ff4]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-white font-semibold mb-1">No segments yet</p>
                  <p className="text-[#CAC4CF] text-xs mb-4">Create your first audience segment to get started</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 rounded-lg bg-[#3e6ff4]/20 hover:bg-[#3e6ff4]/30 text-[#60a5fa] text-xs font-medium border border-[#3e6ff4]/30 transition-colors"
                  >
                    Create Segment
                  </button>
                </div>
              ) : (
                <div className="bg-[#1f2937]/60 border border-[#3e6ff4]/20 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[#3e6ff4]/20 bg-[#111827]/40">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-[#CAC4CF] uppercase tracking-wider">Segment</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-[#CAC4CF] uppercase tracking-wider">Recipients</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-[#CAC4CF] uppercase tracking-wider hidden lg:table-cell">Created</th>
                        <th className="py-3 px-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3e6ff4]/10">
                      {segments.map(seg => (
                        <tr
                          key={seg.id}
                          className="hover:bg-[#3e6ff4]/5 transition-colors cursor-pointer group"
                          onClick={() => handleSelectSegment(seg)}
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-[#3e6ff4]/10 border border-[#3e6ff4]/20 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-[#60a5fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <span className="text-white font-medium group-hover:text-[#60a5fa] transition-colors">{seg.segment_name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
                              (seg.contact_lenght ?? 0) === 0
                                ? 'bg-[#CAC4CF]/10 text-[#CAC4CF]/60'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {(seg.contact_lenght ?? 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-[#CAC4CF] hidden lg:table-cell">{formatDate(seg.created_at)}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => handleSelectSegment(seg)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#3e6ff4]/10 text-[#60a5fa] border border-[#3e6ff4]/20 hover:bg-[#3e6ff4]/20 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View
                              </button>
                              {deleteConfirmId === seg.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDeleteSegment(seg.id)}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#CAC4CF]/10 text-[#CAC4CF] hover:bg-[#CAC4CF]/20 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmId(seg.id)}
                                  className="p-1.5 rounded-lg text-[#CAC4CF]/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  title="Delete segment"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {segments.length > 0 && (
                <p className="text-xs text-[#CAC4CF]/50 mt-3">
                  {segments.length} segment{segments.length !== 1 ? 's' : ''} total
                </p>
              )}
            </div>
          </main>
        </div>
      </div>

      {showCreateModal && (
        <CreateSegmentModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateSegment}
          submitting={submitting}
        />
      )}
    </div>
  )
}

export default AudiencePage
