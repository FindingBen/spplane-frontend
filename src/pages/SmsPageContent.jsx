import { useCallback, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { getSmsPublicPage, createOrUpdateSmsPageAction } from '../service/api/sms'
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
      className={`block w-full text-center font-bold rounded-2xl py-4 px-4 text-[15px] leading-none shadow-sm active:scale-[0.99] transition-transform ${styleClass}`}
    >
      {action.label || 'Click here'}
    </a>
  )
}

// ── SMS Exclusive Offer Bar ───────────────────────────────────────────────────

function ExclusiveOfferBar({ offer }) {
  if (!offer?.enabled) return null
  return (
    <div className="bg-black text-white text-center px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:px-5 sm:py-3">
      <p className="text-[11px] font-semibold tracking-[0.18em] uppercase">
        {offer.barLabel || `SMS Exclusive — ${offer.discountPercent}% OFF`}
      </p>
    </div>
  )
}

function getSmsPageErrorMessage(err) {
  const status = err?.response?.status

  if (status === 401) {
    return 'An access token is required to view this page.'
  }

  if (status === 403) {
    return 'Your access token is invalid or has expired.'
  }

  if (status === 404) {
    return 'This page could not be found.'
  }

  return 'Something went wrong. Please try again later.'
}

function SmsPageContentView({ slug, token }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isDisposed = false

    getSmsPublicPage(slug, token)
      .then((response) => {
        if (isDisposed) return
        setData(response)
      })
      .catch((err) => {
        if (isDisposed) return
        setError(getSmsPageErrorMessage(err))
      })
      .finally(() => {
        if (!isDisposed) {
          setLoading(false)
        }
      })

    return () => {
      isDisposed = true
    }
  }, [slug, token])

  const handleTrackAction = useCallback((blockType) => {
    createOrUpdateSmsPageAction(slug, blockType, token).catch(() => {})
  }, [slug, token])

// ── Main page ─────────────────────────────────────────────────────────────────

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[100svh] bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500">Loading…</p>
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-[100svh] bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-xs">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-800 font-semibold text-xs mb-1">Unable to load page</p>
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
    <div className="min-h-[100svh] bg-white sm:bg-[#f3f0ea] sm:px-4 sm:py-6">
      <div className="mx-auto flex min-h-[100svh] w-full flex-col bg-white sm:min-h-[calc(100svh-3rem)] sm:max-w-[430px] sm:rounded-[28px] sm:border sm:border-black/5 sm:shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
        <ExclusiveOfferBar offer={smsOffer} />

        <main className="flex-1">
          {blocks.length === 0 ? (
            <div className="flex items-center justify-center px-6 py-24 text-gray-400 text-xs">
              No content available.
            </div>
          ) : (
            blocks.map((block, idx) => (
              <PreviewComponent key={block.id ?? idx} component={block} variant="public" onTrackAction={handleTrackAction} />
            ))
          )}
        </main>

        {inlineActions.length > 0 && (
          <div className="px-4 py-5 sm:px-5 flex flex-col gap-3">
            {inlineActions.map((action, idx) => (
              <ActionButton key={action.id ?? idx} action={action} />
            ))}
          </div>
        )}

        {stickyActions.length > 0 && (
          <div className="sticky bottom-0 border-t border-gray-200 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:px-5 flex flex-col gap-2">
            {stickyActions.map((action, idx) => (
              <ActionButton key={action.id ?? idx} action={action} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SmsPageContent() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('t')

  if (!slug) return null

  return <SmsPageContentView key={`${slug}:${token ?? ''}`} slug={slug} token={token} />
}
