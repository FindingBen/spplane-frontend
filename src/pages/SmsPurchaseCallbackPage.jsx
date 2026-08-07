import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import TopBar from '../components/TopBar'
import { getBillingStatus } from '../service/api/payment'
import { getWallet } from '../service/api/wallet'

const numberFormatter = new Intl.NumberFormat('en-GB', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const toNumber = (value) => {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : 0
}

const formatCheckedAt = (value) => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const pickSearchParam = (searchParams, keys) => {
  for (const key of keys) {
    const value = searchParams.get(key)
    if (value) return value
  }

  return ''
}

const SmsPurchaseCallbackPage = () => {
  const location = useLocation()
  const [billingStatus, setBillingStatus] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshError, setRefreshError] = useState('')

  useEffect(() => {
    let isActive = true

    const loadPurchaseState = async () => {
      setLoading(true)
      setRefreshError('')

      const [billingResult, walletResult] = await Promise.allSettled([
        getBillingStatus(),
        getWallet(),
      ])

      if (!isActive) return

      if (billingResult.status === 'fulfilled') {
        setBillingStatus(billingResult.value)
      } else {
        setBillingStatus(null)
      }

      if (walletResult.status === 'fulfilled') {
        setWallet(walletResult.value)
      } else {
        setWallet(null)
      }

      if (billingResult.status === 'rejected' && walletResult.status === 'rejected') {
        setRefreshError('The purchase return loaded, but the latest billing and wallet state could not be refreshed yet.')
      }

      setLoading(false)
    }

    loadPurchaseState()

    return () => {
      isActive = false
    }
  }, [])

  const searchParams = new URLSearchParams(location.search)
  const chargeId = pickSearchParam(searchParams, ['charge_id', 'chargeId', 'id'])
  const shop = pickSearchParam(searchParams, ['shop', 'shop_domain'])
  const host = pickSearchParam(searchParams, ['host'])
  const checkedAtLabel = formatCheckedAt(billingStatus?.checked_at)

  const balance = toNumber(wallet?.balance)
  const reserved = toNumber(wallet?.reserved)
  const availableCredits = Math.max(balance - reserved, 0)
  const isBillable = billingStatus?.is_billable === true

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827]">
      <TopBar />

      <div className="flex flex-1">
        <Header />

        <div className="relative flex-1 m-4 bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827] rounded-2xl border border-[#3e6ff4]/20 overflow-hidden flex flex-col">
          {/* Subtle notebook-style grid, confined to this panel only */}
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          <main className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 xl:p-8 2xl:p-5">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
              <section className="rounded-[28px] border border-emerald-500/25 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.22),_transparent_38%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(17,24,39,0.92))] p-6 shadow-[0_24px_60px_rgba(2,6,23,0.35)] md:p-8">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/35 bg-emerald-500/10 text-emerald-300">
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <div className="mt-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200/80">Purchase complete</p>
                  <h1 className="mt-3 text-2xl font-bold text-white md:text-3xl">Your SMS package purchase was approved.</h1>
                  <p className="mt-3 max-w-2xl text-xs leading-6 text-[#d1d5db] md:text-[15px]">
                    Shopify returned you to the app after a successful checkout. The current wallet and billing state is shown below so you can confirm the account is ready for sending.
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-white/85">
                  {chargeId && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Charge {chargeId}</span>
                  )}
                  {shop && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{shop}</span>
                  )}
                  {host && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Host attached</span>
                  )}
                  {checkedAtLabel && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Billing checked {checkedAtLabel}</span>
                  )}
                </div>
              </section>

              <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <article className="rounded-[24px] border border-[#3e6ff4]/20 bg-[#0f172a]/80 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#93c5fd]">Wallet</p>
                  {loading ? (
                    <p className="mt-3 text-xs text-[#dbeafe]">Refreshing wallet balance...</p>
                  ) : wallet ? (
                    <>
                      <p className="mt-4 text-2xl font-bold text-white">{numberFormatter.format(availableCredits)}</p>
                      <p className="mt-2 text-xs text-[#CAC4CF]">Available SMS credits</p>
                      <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-[#d1d5db]">
                        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-[#93c5fd]">Balance</p>
                          <p className="mt-2 text-base font-semibold text-white">{numberFormatter.format(balance)}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-[#93c5fd]">Reserved</p>
                          <p className="mt-2 text-base font-semibold text-white">{numberFormatter.format(reserved)}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="mt-3 text-xs text-[#dbeafe]">Wallet details are not available yet. Use the credits pill in the top bar to retry after a moment.</p>
                  )}
                </article>

                <article className="rounded-[24px] border border-[#3e6ff4]/20 bg-[#0f172a]/80 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#93c5fd]">Billing status</p>
                  {loading ? (
                    <p className="mt-3 text-xs text-[#dbeafe]">Refreshing billing state...</p>
                  ) : billingStatus ? (
                    <>
                      <p className="mt-4 text-xl font-bold text-white">
                        {isBillable ? 'Billing active' : 'Billing requires attention'}
                      </p>
                      <p className="mt-2 text-xs leading-6 text-[#CAC4CF]">
                        {isBillable
                          ? `This shop can purchase SMS packages${billingStatus?.plan_public_name ? ` on ${billingStatus.plan_public_name}` : ''}.`
                          : `This shop is not marked billable right now${billingStatus?.reason ? `: ${billingStatus.reason}` : '.'}`}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-white/85">
                        {billingStatus?.code && (
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{billingStatus.code}</span>
                        )}
                        {billingStatus?.partner_development && (
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Partner development</span>
                        )}
                        {billingStatus?.shopify_plus && (
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Shopify Plus</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="mt-3 text-xs text-[#dbeafe]">Billing details are not available yet. You can still return to packages and refresh from there.</p>
                  )}
                </article>
              </section>

              {refreshError && (
                <section className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                  {refreshError}
                </section>
              )}

              <section className="rounded-[24px] border border-[#3e6ff4]/20 bg-[#0f172a]/75 p-5">
                <h2 className="text-base font-semibold text-white">Next actions</h2>
                <p className="mt-2 max-w-2xl text-xs leading-6 text-[#CAC4CF]">
                  If the new credits are not visible immediately, refresh the wallet from the top bar or revisit the SMS packages page after a short delay.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to="/sms-plans"
                    className="inline-flex items-center justify-center rounded-xl bg-[#3e6ff4]/15 px-4 py-2.5 text-xs font-semibold text-[#dbeafe] transition-all hover:bg-[#3e6ff4]/25 hover:text-white"
                  >
                    Back to packages
                  </Link>
                  <Link
                    to="/sms"
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:border-[#3e6ff4]/35 hover:bg-white/10"
                  >
                    Go to SMS dashboard
                  </Link>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default SmsPurchaseCallbackPage