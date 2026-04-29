import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { getSmsPublicPage } from '../service/api/sms'
import PreviewComponent from '../components/builder/PreviewComponent'

// ── Action button styles ──────────────────────────────────────────────────────

const ACTION_STYLE = {
  primary:   'bg-black text-white',
  secondary: 'bg-white text-black border-2 border-black',
  danger:    'bg-red-600 text-white',
  success:   'bg-green-700 text-white',
}

function ActionButton({ action }) {
  const styleClass = ACTION_STYLE[action.style] || ACTION_STYLE.primary
  return (
    <a
      href={action.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={`block w-full text-center font-bold rounded-lg py-3 text-sm ${styleClass}`}
    >
      {action.label || 'Click here'}
    </a>
  )
}

// ── SMS Exclusive Offer Bar ───────────────────────────────────────────────────

function ExclusiveOfferBar({ offer }) {
  if (!offer?.enabled) return null
  return (
    <div className="bg-black text-white text-center py-2 px-4">
      <p className="text-xs font-semibold tracking-wide uppercase">
        {offer.barLabel || `SMS Exclusive — ${offer.discountPercent}% OFF`}
      </p>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SmsPageContent() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('t')

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError(null)
    getSmsPublicPage(slug, token)
      .then(setData)
      .catch((err) => {
        const status = err?.response?.status
        if (status === 401) {
          setError('An access token is required to view this page.')
        } else if (status === 403) {
          setError('Your access token is invalid or has expired.')
        } else if (status === 404) {
          setError('This page could not be found.')
        } else {
          setError('Something went wrong. Please try again later.')
        }
      })
      .finally(() => setLoading(false))
  }, [slug, token])

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-xs">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-800 font-semibold text-sm mb-1">Unable to load page</p>
          <p className="text-gray-500 text-xs">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const snapshot = data.content_snapshot || {}
  const blocks = snapshot.blocks || []
  const metadata = snapshot.metadata || {}
  const actions = data.actions || []
  const smsOffer = metadata.smsExclusiveOffer

  const stickyActions = actions.filter((a) => a.sticky)
  const inlineActions = actions.filter((a) => !a.sticky)

  return (
    <div className="h-screen w-full flex flex-col bg-white overflow-hidden">
      <div className="flex flex-col flex-1 w-full max-w-sm mx-auto overflow-y-auto">
        {/* SMS exclusive offer bar */}
        <ExclusiveOfferBar offer={smsOffer} />

        {/* Content blocks — scaled up from builder preview size to real viewport size */}
        <div className="flex-1" style={{ zoom: 1.3 }}>
          {blocks.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
              No content available.
            </div>
          ) : (
            blocks.map((block, idx) => (
              <PreviewComponent key={block.id ?? idx} component={block} />
            ))
          )}
        </div>

        {/* Inline (non-sticky) actions */}
        {inlineActions.length > 0 && (
          <div className="px-4 py-4 flex flex-col gap-3">
            {inlineActions.map((action, idx) => (
              <ActionButton key={action.id ?? idx} action={action} />
            ))}
          </div>
        )}

        {/* Sticky action bar */}
        {stickyActions.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg px-4 py-3 flex flex-col gap-2">
            {stickyActions.map((action, idx) => (
              <ActionButton key={action.id ?? idx} action={action} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
