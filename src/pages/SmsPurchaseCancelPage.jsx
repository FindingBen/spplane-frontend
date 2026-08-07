import { Link, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import TopBar from '../components/TopBar'

const pickSearchParam = (searchParams, keys) => {
  for (const key of keys) {
    const value = searchParams.get(key)
    if (value) return value
  }

  return ''
}

const SmsPurchaseCancelPage = () => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)

  const chargeId = pickSearchParam(searchParams, ['charge_id', 'chargeId', 'id'])
  const shop = pickSearchParam(searchParams, ['shop', 'shop_domain'])
  const reason = pickSearchParam(searchParams, ['reason', 'message', 'error'])

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
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
              <section className="rounded-[28px] border border-amber-500/25 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_38%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(17,24,39,0.92))] p-6 shadow-[0_24px_60px_rgba(2,6,23,0.35)] md:p-8">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/35 bg-amber-500/10 text-amber-300">
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>

                <div className="mt-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200/80">Purchase cancelled</p>
                  <h1 className="mt-3 text-2xl font-bold text-white md:text-3xl">The SMS package checkout was cancelled.</h1>
                  <p className="mt-3 text-xs leading-6 text-[#d1d5db] md:text-[15px]">
                    No package was applied from this checkout session. You can return to the packages page and try again when you are ready.
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-white/85">
                  {chargeId && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Charge {chargeId}</span>
                  )}
                  {shop && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{shop}</span>
                  )}
                </div>
              </section>

              {reason && (
                <section className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                  {reason}
                </section>
              )}

              <section className="rounded-[24px] border border-[#3e6ff4]/20 bg-[#0f172a]/75 p-5">
                <h2 className="text-base font-semibold text-white">What you can do next</h2>
                <p className="mt-2 max-w-2xl text-xs leading-6 text-[#CAC4CF]">
                  Return to SMS packages to restart the purchase flow, or head back to the SMS dashboard if you do not want to buy more credits right now.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to="/sms-plans"
                    className="inline-flex items-center justify-center rounded-xl bg-[#3e6ff4]/15 px-4 py-2.5 text-xs font-semibold text-[#dbeafe] transition-all hover:bg-[#3e6ff4]/25 hover:text-white"
                  >
                    Return to packages
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

export default SmsPurchaseCancelPage