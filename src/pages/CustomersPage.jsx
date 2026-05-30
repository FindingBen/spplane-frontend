import { useState, useEffect } from 'react'
import Header from '../components/Header'
import SendSingleSmsModal from '../components/SendSingleSmsModal'
import TopBar from '../components/TopBar'
import {
  getContacts,
  createContact,
  deleteContact,
  importShopifyCustomers
} from '../service/api/segments'
import { createCustomerSignupQrCode, getCustomerSignupQrCode, sendSingleSms } from '../service/api/sms'
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
const PAGE_SIZE = 10

const getVisiblePages = (currentPage, totalPages) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = [1]
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  if (start > 2) pages.push('start-ellipsis')
  for (let page = start; page <= end; page += 1) pages.push(page)
  if (end < totalPages - 1) pages.push('end-ellipsis')
  pages.push(totalPages)

  return pages
}

const humanizeKey = (value = '') => value
  .replace(/[._-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .replace(/\b\w/g, (char) => char.toUpperCase())

const flattenErrorDetails = (value, path = '') => {
  if (value == null || value === '') return []

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    const text = String(value)
    return [path ? `${humanizeKey(path)}: ${text}` : text]
  }

  if (Array.isArray(value)) {
    if (!value.length) return []

    if (value.every((item) => item == null || ['string', 'number', 'boolean'].includes(typeof item))) {
      const text = value.filter((item) => item != null && item !== '').map(String).join(', ')
      return text ? [path ? `${humanizeKey(path)}: ${text}` : text] : []
    }

    return value.flatMap((item) => flattenErrorDetails(item, path))
  }

  if (typeof value === 'object') {
    return Object.entries(value).flatMap(([key, nestedValue]) => {
      if (['error', 'message', 'detail', 'status', 'code'].includes(key)) {
        return []
      }

      const nextPath = ['errors', 'details'].includes(key)
        ? path
        : (path ? `${path} ${key}` : key)

      return flattenErrorDetails(nestedValue, nextPath)
    })
  }

  return []
}

const buildImportErrorNotice = (err) => {
  const payload = err?.response?.data
  const headline = payload?.error || payload?.detail || payload?.message || err?.message || 'Shopify import failed.'
  const details = [...new Set(flattenErrorDetails(payload).filter((detail) => detail !== headline))].slice(0, 6)

  let description = 'We could not finish importing customers from Shopify.'
  if (err?.response?.status === 400) {
    description = 'Shopify returned validation problems. Review the details below and retry the import.'
  } else if ([401, 403].includes(err?.response?.status)) {
    description = 'Your Shopify connection may need to be reauthorized before another import can run.'
  } else if (details.length > 0) {
    description = 'Review the issues below, fix what applies in Shopify, and retry the import.'
  }

  return { headline, description, details }
}

function ImportErrorBanner({ notice, retrying, onRetry, onDismiss }) {
  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-red-500/35 bg-[radial-gradient(circle_at_top_left,_rgba(248,113,113,0.18),_rgba(127,29,29,0.08)_24%,_rgba(17,24,39,0.92)_60%)] shadow-[0_20px_40px_rgba(0,0,0,0.28)]">
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-3 min-w-0">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/12 text-red-300">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
            </svg>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-red-100">Shopify Import Failed</p>
              <span className="rounded-full border border-red-400/25 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.18em] text-red-200/80">
                Needs Attention
              </span>
            </div>

            <p className="mt-1 text-sm font-medium text-white">{notice.headline}</p>
            <p className="mt-1 text-xs leading-5 text-red-100/75">{notice.description}</p>

            {notice.details.length > 0 && (
              <div className="mt-3 rounded-xl border border-white/8 bg-black/15 px-3 py-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-100/55">Import Details</p>
                <ul className="mt-2 space-y-2">
                  {notice.details.map((detail, index) => (
                    <li key={`${detail}-${index}`} className="flex gap-2 text-xs leading-5 text-red-50/90">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-300" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-end md:self-start">
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-[#CAC4CF] transition-colors hover:bg-white/10 hover:text-white"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className="rounded-xl border border-red-300/25 bg-red-500/14 px-3 py-2 text-xs font-semibold text-red-100 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {retrying ? 'Retrying…' : 'Retry Import'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Create Customer Modal ─────────────────────────────────────────────────────

const INIT_FORM = { first_name: '', last_name: '', phone: '', status: 'subscribed', source: 'manual' }

function CreateCustomerModal({ onClose, onCreate, submitting }) {
  const { active, currentStepId } = useFirstCampaignGuide()
  const [form, setForm] = useState(INIT_FORM)
  const [error, setError] = useState('')
  const isGuideLocked = active && currentStepId === 'customer-form'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={isGuideLocked ? undefined : onClose}>
      <div data-guide-id="customer-form" onClick={(event) => event.stopPropagation()} className="bg-[#1D1A22] border border-[#3e6ff4]/30 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3e6ff4]/15 border border-[#3e6ff4]/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#60a5fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">New Customer</h2>
          </div>
          <button onClick={onClose} disabled={submitting || isGuideLocked} className="text-[#CAC4CF] hover:text-white transition-colors p-1">
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

function CustomerSignupQrModal({ qrCodeUrl, loading, error, onClose, onPrint, onRetry }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-signup-qr-title"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-xl rounded-[28px] border border-[#3e6ff4]/30 bg-[#1D1A22] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.38)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#60a5fa]">In-Store Signup</p>
            <h2 id="customer-signup-qr-title" className="mt-1 text-2xl font-bold text-white">Customer Signup QR</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#CAC4CF]">
              Scan this code to open your customer signup flow. Print it and place it near checkout or inside your store.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-[#CAC4CF] transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close signup QR modal"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-6 rounded-[24px] border border-[#3e6ff4]/18 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.12),_rgba(17,24,39,0.88)_55%)] p-5">
          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center">
              <div className="h-12 w-12 rounded-full border-4 border-[#3e6ff4]/25 border-t-[#60a5fa] animate-spin" />
              <div>
                <p className="text-base font-semibold text-white">Preparing your signup QR</p>
                <p className="mt-1 text-sm text-[#CAC4CF]">We are creating or retrieving the latest code for this account.</p>
              </div>
            </div>
          ) : qrCodeUrl ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-full max-w-[340px] rounded-[28px] bg-white p-5 shadow-[0_22px_50px_rgba(15,23,42,0.26)]">
                <img
                  src={qrCodeUrl}
                  alt="Customer signup QR code"
                  className="mx-auto aspect-square w-full max-w-[300px] object-contain"
                />
              </div>
              <p className="max-w-md text-center text-sm leading-6 text-[#CAC4CF]">
                Test scan it once on your phone, then print it for walk-in visitors to join your customer list.
              </p>
            </div>
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[20px] border border-red-500/30 bg-red-500/8 px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/25 bg-red-500/12 text-red-200">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
                </svg>
              </div>
              <p className="mt-4 text-base font-semibold text-white">We could not load the signup QR code.</p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-red-100/85">
                {error || 'Try again in a moment. If the problem continues, confirm that the QR code endpoint is available.'}
              </p>
            </div>
          )}
        </div>

        {error && qrCodeUrl && (
          <div className="mt-4 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#3e6ff4]/25 px-4 py-2.5 text-sm font-medium text-[#CAC4CF] transition-colors hover:border-[#3e6ff4]/40 hover:text-white"
          >
            Close
          </button>

          {!loading && !qrCodeUrl && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-xl border border-red-300/25 bg-red-500/12 px-4 py-2.5 text-sm font-semibold text-red-100 transition-colors hover:bg-red-500/18"
            >
              Retry
            </button>
          )}

          {!loading && qrCodeUrl && (
            <button
              type="button"
              onClick={onPrint}
              className="rounded-xl bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(62,111,244,0.3)] transition-opacity hover:opacity-90"
            >
              Print QR
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const { active, currentStepId, trackAction } = useFirstCampaignGuide()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [importErrorNotice, setImportErrorNotice] = useState(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [smsCustomer, setSmsCustomer] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [sendingSingleSms, setSendingSingleSms] = useState(false)
  const [importing, setImporting] = useState(false)
  const [hasCustomerSignupQr, setHasCustomerSignupQr] = useState(false)
  const [qrStatusLoading, setQrStatusLoading] = useState(true)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [qrLoading, setQrLoading] = useState(false)
  const [qrError, setQrError] = useState('')

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase()
    return (
      c.phone?.toLowerCase().includes(q) ||
      c.first_name?.toLowerCase().includes(q) ||
      c.last_name?.toLowerCase().includes(q)
    )
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageStartIndex = (currentPage - 1) * PAGE_SIZE
  const paginatedContacts = filtered.slice(pageStartIndex, pageStartIndex + PAGE_SIZE)
  const pageEndIndex = Math.min(pageStartIndex + PAGE_SIZE, filtered.length)
  const visiblePages = getVisiblePages(currentPage, totalPages)

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
  useEffect(() => { setCurrentPage(1) }, [search])
  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, totalPages))
  }, [totalPages])
  useEffect(() => {
    let ignore = false

    const hydrateCustomerSignupQr = async () => {
      try {
        const existingQrCodeUrl = await getCustomerSignupQrCode()
        if (ignore) return

        setQrCodeUrl(existingQrCodeUrl)
        setHasCustomerSignupQr(true)
      } catch {
        if (ignore) return

        setHasCustomerSignupQr(false)
      } finally {
        if (!ignore) {
          setQrStatusLoading(false)
        }
      }
    }

    hydrateCustomerSignupQr()

    return () => {
      ignore = true
    }
  }, [])
  useEffect(() => {
    if (active && currentStepId === 'customer-form') {
      setShowCreateModal(true)
    }
  }, [active, currentStepId])

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
      setCurrentPage(1)
      trackAction('customer:created', { customer: created })
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

  const handleSendSingleSms = async (payload) => {
    setSendingSingleSms(true)
    try {
      await sendSingleSms(payload)
    } finally {
      setSendingSingleSms(false)
    }
  }

  const handleShopifyImport = async () => {
    setImporting(true)
    setImportErrorNotice(null)
    try {
      await importShopifyCustomers()
      await fetchContacts()
      setCurrentPage(1)
    } catch (err) {
      setImportErrorNotice(buildImportErrorNotice(err))
    } finally {
      setImporting(false)
    }
  }

  const loadCustomerSignupQrCode = async () => {
    setQrLoading(true)
    setQrError('')

    try {
      const nextQrCodeUrl = hasCustomerSignupQr
        ? await getCustomerSignupQrCode()
        : await createCustomerSignupQrCode()

      setQrCodeUrl(nextQrCodeUrl)
      setHasCustomerSignupQr(true)
    } catch (err) {
      setQrError(err?.response?.data?.error || err?.message || 'Failed to load the signup QR code.')
    } finally {
      setQrLoading(false)
    }
  }

  const handleOpenQrModal = async () => {
    setShowQrModal(true)

    if (qrCodeUrl || qrLoading) {
      return
    }

    await loadCustomerSignupQrCode()
  }

  const handlePrintQrCode = () => {
    if (!qrCodeUrl) {
      return
    }

    const printWindow = window.open('', '_blank', 'noopener,noreferrer')
    if (!printWindow) {
      setQrError('Allow pop-ups in your browser to print the QR code.')
      return
    }

    const escapedQrCodeUrl = qrCodeUrl.replace(/"/g, '&quot;')

    printWindow.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Customer Signup QR</title>
    <style>
      :root { color-scheme: light; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f7fb;
        color: #0f172a;
        font-family: Arial, sans-serif;
      }
      main {
        width: min(92vw, 540px);
        padding: 32px;
        border-radius: 24px;
        background: #ffffff;
        box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
        text-align: center;
      }
      h1 {
        margin: 0 0 12px;
        font-size: 28px;
      }
      p {
        margin: 0 0 24px;
        color: #475569;
        line-height: 1.6;
      }
      img {
        display: block;
        width: min(100%, 320px);
        margin: 0 auto;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Customer Signup QR</h1>
      <p>Scan this code to join the customer signup flow.</p>
      <img src="${escapedQrCodeUrl}" alt="Customer signup QR code" />
    </main>
    <script>
      window.addEventListener('load', function () {
        window.focus();
        window.print();
      });
    </script>
  </body>
</html>`)
    printWindow.document.close()
  }

  const subscribedCount = contacts.filter(c => c.status === 'subscribed').length
  const shopifyCount    = contacts.filter(c => c.source === 'shopify').length

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
                    <span className="bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] bg-clip-text text-transparent">Customers</span>
                  </h1>
                  <p className="text-sm md:text-base text-[#CAC4CF]">All imported and manually added contacts.</p>
                </div>
                <div className='flex flex-row gap-2'>
                  <button
                    type="button"
                    onClick={handleOpenQrModal}
                    disabled={qrLoading || qrStatusLoading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#3e6ff4]/40 bg-[#3e6ff4]/10 text-[#60a5fa] font-semibold text-sm hover:bg-[#3e6ff4]/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {qrLoading || qrStatusLoading ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h4M4 17h4M16 7h4M16 17h4M9 4v4M15 4v4M9 16v4M15 16v4M8 8h8v8H8V8z" />
                      </svg>
                    )}
                    {qrStatusLoading ? 'Checking QR…' : (qrLoading ? 'Preparing QR…' : (hasCustomerSignupQr ? 'View Signup QR' : 'Create Signup QR'))}
                  </button>
                  <button
                    onClick={handleShopifyImport}
                    disabled={importing}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#3e6ff4]/40 bg-[#3e6ff4]/10 text-[#60a5fa] font-semibold text-sm hover:bg-[#3e6ff4]/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {importing ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    )}
                    {importing ? 'Importing…' : 'Import from Shopify'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateModal(true)
                      trackAction('customer:open')
                    }}
                    data-guide-id="customer-create"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#3e6ff4]/40 bg-[#3e6ff4]/10 text-[#60a5fa] font-semibold text-sm hover:bg-[#3e6ff4]/20 transition-colors"
                  >
                    Create
                  </button>
                </div>
              </div>

              {importErrorNotice && (
                <ImportErrorBanner
                  notice={importErrorNotice}
                  retrying={importing}
                  onRetry={handleShopifyImport}
                  onDismiss={() => setImportErrorNotice(null)}
                />
              )}

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
                  onChange={e => {
                    setSearch(e.target.value)
                    setCurrentPage(1)
                  }}
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
                      {paginatedContacts.map((c, idx) => {
                        const displayName = [c.first_name, c.last_name].filter(Boolean).join(' ') || '—'
                        const initials = [c.first_name?.[0], c.last_name?.[0]].filter(Boolean).join('').toUpperCase() || c.phone?.slice(-2)
                        return (
                          <tr key={c.id} className="hover:bg-[#3e6ff4]/5 transition-colors text-left">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={avatarStyle(pageStartIndex + idx)}>
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
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => setSmsCustomer(c)}
                                    className="p-1.5 rounded-lg text-[#CAC4CF]/40 hover:bg-[#3e6ff4]/10 hover:text-[#60a5fa] transition-colors"
                                    title="Send SMS"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2L11 13" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2L15 22L11 13L2 9L22 2z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(c.id)}
                                    className="p-1.5 rounded-lg text-[#CAC4CF]/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    title="Delete customer"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
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
                <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#CAC4CF]/60">
                    <span>
                      Showing <span className="font-semibold text-white">{pageStartIndex + 1}-{pageEndIndex}</span> of <span className="font-semibold text-white">{filtered.length}</span> customer{filtered.length !== 1 ? 's' : ''}
                    </span>
                    {filtered.length !== contacts.length && (
                      <span className="rounded-full border border-[#3e6ff4]/20 bg-[#3e6ff4]/8 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-[#60a5fa]">
                        Filtered from {contacts.length}
                      </span>
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                      <button
                        type="button"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#3e6ff4]/20 bg-[#111827]/70 px-3 py-2 text-xs font-medium text-[#CAC4CF] transition-colors hover:border-[#3e6ff4]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Prev
                      </button>

                      <div className="hidden items-center gap-1.5 sm:flex">
                        {visiblePages.map((page, index) => (
                          page === 'start-ellipsis' || page === 'end-ellipsis' ? (
                            <span key={`${page}-${index}`} className="px-2 text-xs text-[#CAC4CF]/40">...</span>
                          ) : (
                            <button
                              key={page}
                              type="button"
                              onClick={() => setCurrentPage(page)}
                              className={`h-9 min-w-9 rounded-xl px-3 text-xs font-semibold transition-colors ${currentPage === page ? 'bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] text-white shadow-[0_10px_24px_rgba(62,111,244,0.28)]' : 'border border-[#3e6ff4]/20 bg-[#111827]/70 text-[#CAC4CF] hover:border-[#3e6ff4]/40 hover:text-white'}`}
                            >
                              {page}
                            </button>
                          )
                        ))}
                      </div>

                      <div className="rounded-xl border border-[#3e6ff4]/20 bg-[#111827]/70 px-3 py-2 text-xs font-medium text-[#CAC4CF] sm:hidden">
                        Page <span className="text-white">{currentPage}</span> / <span className="text-white">{totalPages}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#3e6ff4]/20 bg-[#111827]/70 px-3 py-2 text-xs font-medium text-[#CAC4CF] transition-colors hover:border-[#3e6ff4]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
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

      {showQrModal && (
        <CustomerSignupQrModal
          qrCodeUrl={qrCodeUrl}
          loading={qrLoading}
          error={qrError}
          onClose={() => setShowQrModal(false)}
          onPrint={handlePrintQrCode}
          onRetry={loadCustomerSignupQrCode}
        />
      )}

      {smsCustomer && (
        <SendSingleSmsModal
          customer={smsCustomer}
          onClose={() => setSmsCustomer(null)}
          onSend={handleSendSingleSms}
          sending={sendingSingleSms}
        />
      )}
    </div>
  )
}
