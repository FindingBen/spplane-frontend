import { useEffect, useState } from 'react'
import Header from '../components/Header'
import TopBar from '../components/TopBar'
import { createOneTimeCharge, getBillingStatus, getOneTimeChargeRedirectUrl, getSmsPackages } from '../service/api/payment'

const PLAN_APPEARANCES = [
  {
    tone: 'from-sky-500/20 via-[#1f2937] to-[#111827]',
    accent: 'from-sky-400 to-cyan-300',
  },
  {
    tone: 'from-[#3e6ff4]/25 via-[#1f2937] to-[#111827]',
    accent: 'from-[#3e6ff4] to-[#60a5fa]',
  },
  {
    tone: 'from-emerald-500/20 via-[#1f2937] to-[#111827]',
    accent: 'from-emerald-400 to-teal-300',
  },
]

const numberFormatter = new Intl.NumberFormat('en-US')

const getNumericValue = (value) => {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : 0
}

const formatPrice = (price, currency = 'USD') => {
  const amount = getNumericValue(price)

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount)
  } catch {
    return `${currency || 'USD'} ${amount.toFixed(2)}`
  }
}

const getUnitCostLabel = (price, smsCount, currency = 'USD') => {
  const totalSms = Number(smsCount)
  if (!Number.isFinite(totalSms) || totalSms <= 0) return 'N/A'

  const unitCost = getNumericValue(price) / totalSms

  try {
    return `${new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(unitCost)} / SMS`
  } catch {
    return `${unitCost.toFixed(4)} ${currency || 'USD'} / SMS`
  }
}

const getPlanHighlights = (plan) => {
  const highlights = [
    `${numberFormatter.format(plan.sms_count)} SMS included`,
    `${plan.currency || 'USD'} checkout currency`,
  ]

  if (plan.shopify_product_title && plan.shopify_product_title !== plan.name) {
    highlights[2] = `Shopify product: ${plan.shopify_product_title}`
  }

  if (plan.shopify_product_handle) {
    highlights.push(`Product handle: ${plan.shopify_product_handle}`)
  }

  return highlights
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

const SmsPlansPage = () => {
  const [smsPackages, setSmsPackages] = useState([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [plansError, setPlansError] = useState('')
  const [billingStatus, setBillingStatus] = useState(null)
  const [billingLoading, setBillingLoading] = useState(true)
  const [billingError, setBillingError] = useState('')
  const [purchaseMessage, setPurchaseMessage] = useState('')
  const [purchaseError, setPurchaseError] = useState('')
  const [purchasingPlanId, setPurchasingPlanId] = useState('')

  useEffect(() => {
    const loadSmsPackages = async () => {
      setPlansLoading(true)

      try {
        const data = await getSmsPackages()
        setSmsPackages(Array.isArray(data) ? data : [])
        setPlansError('')
      } catch (error) {
        setSmsPackages([])
        setPlansError(error?.response?.data?.error || 'Unable to load SMS packages right now.')
      } finally {
        setPlansLoading(false)
      }
    }

    const loadBillingStatus = async () => {
      setBillingLoading(true)

      try {
        const data = await getBillingStatus()
        setBillingStatus(data)
        setBillingError('')
      } catch {
        setBillingStatus(null)
        setBillingError('Unable to verify billing status right now. Top-ups stay blocked until billing is confirmed.')
      } finally {
        setBillingLoading(false)
      }
    }

    loadSmsPackages()
    loadBillingStatus()
  }, [])

  const isBillable = billingStatus?.is_billable === true
  const isPurchaseBlocked = billingLoading || Boolean(billingError) || !isBillable
  const checkedAtLabel = formatCheckedAt(billingStatus?.checked_at)
  const featuredPlanId = smsPackages.reduce((bestPlanId, plan) => {
    const bestPlan = smsPackages.find((item) => item.package_id === bestPlanId)
    const currentUnitCost = getNumericValue(plan.price) / Math.max(Number(plan.sms_count) || 0, 1)
    const bestUnitCost = bestPlan ? getNumericValue(bestPlan.price) / Math.max(Number(bestPlan.sms_count) || 0, 1) : Number.POSITIVE_INFINITY

    return currentUnitCost < bestUnitCost ? plan.package_id : bestPlanId
  }, smsPackages[0]?.package_id ?? '')

  const handleTopup = async (plan) => {
    if (isPurchaseBlocked) return

    setPurchaseError('')
    setPurchaseMessage('')
    setPurchasingPlanId(plan.package_id)

    try {
      const payload = await createOneTimeCharge({
        packageId: plan.package_id,
        description: plan.shopify_product_title || plan.name,
      })

      const redirectUrl = getOneTimeChargeRedirectUrl(payload)

      if (!redirectUrl) {
        throw new Error('The billing response did not include a Shopify approval URL.')
      }

      setPurchaseMessage(`Redirecting to Shopify billing for ${plan.name}...`)
      window.location.assign(redirectUrl)
      return
    } catch (error) {
      const apiError = error?.response?.data?.error
      setPurchaseError(apiError || error?.message || 'Unable to start the Shopify top-up charge.')
    } finally {
      setPurchasingPlanId('')
    }
  }

  const billingBannerTone = billingError || !isBillable
    ? 'border-amber-500/30 bg-amber-500/10 text-amber-100'
    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827]">
      <TopBar />

      <div className="flex flex-1">
        <Header />

        <div className="flex-1 m-4 bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827] rounded-2xl border border-[#3e6ff4]/20 overflow-hidden flex flex-col">
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 xl:p-8 2xl:p-5">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
              <section>
                <div>
                  
                  <h1 className="mt-3 text-2xl text-left font-bold text-white md:text-3xl xl:text-4xl 2xl:text-4xl">
                    Choose an SMS package that matches your next send.
                  </h1>
                 

                  <div className={`mt-4 max-w-3xl rounded-2xl border px-4 py-3 shadow-[0_10px_30px_rgba(2,6,23,0.14)] ${billingBannerTone}`}>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-left text-[#93c5fd]">Billing check</p>
                        {billingLoading ? (
                          <p className="mt-1 text-sm text-white">Checking whether this shop can purchase SMS credits...</p>
                        ) : billingError ? (
                          <p className="mt-1 text-sm text-white">{billingError}</p>
                        ) : isBillable ? (
                          <p className="mt-1 text-sm text-white">
                            Billing is active{billingStatus?.plan_public_name ? ` on ${billingStatus.plan_public_name}` : ''}. This shop can purchase SMS credits.
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-white">
                            This shop cannot buy SMS credits right now{billingStatus?.reason ? `: ${billingStatus.reason}` : '.'}
                          </p>
                        )}
                      </div>

                      {!billingLoading && billingStatus && (
                        <div className="flex flex-wrap gap-2 text-[11px]">
                          {billingStatus?.code && (
                            <span className="rounded-full border border-white/10 bg-black/10 px-2.5 py-1 text-white/90">
                              {billingStatus.code}
                            </span>
                          )}
                          {billingStatus?.partner_development && (
                            <span className="rounded-full border border-white/10 bg-black/10 px-2.5 py-1 text-white/90">
                              Partner development
                            </span>
                          )}
                          {billingStatus?.shopify_plus && (
                            <span className="rounded-full border border-white/10 bg-black/10 px-2.5 py-1 text-white/90">
                              Shopify Plus
                            </span>
                          )}
                          {checkedAtLabel && (
                            <span className="rounded-full border border-white/10 bg-black/10 px-2.5 py-1 text-white/90">
                              Checked {checkedAtLabel}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {purchaseMessage && (
                    <div className="mt-3 max-w-2xl rounded-xl border border-[#3e6ff4]/25 bg-[#3e6ff4]/10 px-4 py-3 text-sm text-[#dbeafe]">
                      {purchaseMessage}
                    </div>
                  )}

                  {purchaseError && (
                    <div className="mt-3 max-w-2xl rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                      {purchaseError}
                    </div>
                  )}
                </div>
              </section>

              <section className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
                {plansLoading && (
                  <div className="rounded-[24px] border border-[#3e6ff4]/20 bg-[#0f172a]/75 p-5 text-sm text-[#dbeafe] lg:col-span-2 2xl:col-span-3">
                    Loading SMS packages...
                  </div>
                )}

                {!plansLoading && plansError && (
                  <div className="rounded-[24px] border border-red-500/25 bg-red-500/10 p-5 text-sm text-red-100 lg:col-span-2 2xl:col-span-3">
                    {plansError}
                  </div>
                )}

                {!plansLoading && !plansError && smsPackages.length === 0 && (
                  <div className="rounded-[24px] border border-[#3e6ff4]/20 bg-[#0f172a]/75 p-5 text-sm text-[#dbeafe] lg:col-span-2 2xl:col-span-3">
                    No active SMS packages are available for this shop yet.
                  </div>
                )}

                {!plansLoading && !plansError && smsPackages.map((plan, index) => {
                  const appearance = PLAN_APPEARANCES[index % PLAN_APPEARANCES.length]
                  const isFeatured = plan.package_id === featuredPlanId
                  const isSubmitting = purchasingPlanId === plan.package_id
                  const packageTitle = plan.shopify_product_title && plan.shopify_product_title !== plan.name
                    ? plan.shopify_product_title
                    : ''

                  return (
                    <article
                      key={plan.package_id}
                      className={`relative overflow-hidden rounded-[24px] border p-5 transition-all duration-200 ${
                        isFeatured
                          ? 'border-[#60a5fa]/70 bg-[#111827] shadow-[0_18px_42px_rgba(37,99,235,0.18)]'
                          : 'border-[#3e6ff4]/20 bg-[#0f172a]/75 hover:border-[#3e6ff4]/45 hover:-translate-y-1'
                      }`}
                    >
                      <div className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-br ${appearance.tone}`} />
                      <div className="relative">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#93c5fd]">SMS package</p>
                            <h2 className="mt-2 text-xl font-semibold text-white">{plan.name}</h2>
                            {packageTitle && (
                              <p className="mt-2 text-sm text-[#CAC4CF]">{packageTitle}</p>
                            )}
                          </div>
                          {isFeatured && (
                            <span className="rounded-full border border-[#60a5fa]/40 bg-[#3e6ff4]/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#bfdbfe]">
                              Best value
                            </span>
                          )}
                        </div>

                        <div className="mt-6 flex items-end gap-2.5">
                          <p className="text-3xl font-bold text-white">{formatPrice(plan.price, plan.currency)}</p>
                          <p className="mb-1 text-xs text-[#93c5fd]">one-time package</p>
                        </div>

                        <div className={`mt-5 inline-flex text-left rounded-full bg-gradient-to-r ${appearance.accent} p-[1px]`}>
                          <div className="rounded-full bg-[#0f172a] px-3.5 py-1.5 text-sm font-semibold text-white">
                            {numberFormatter.format(plan.sms_count)} SMS
                          </div>
                        </div>

                        <ul className="mt-5 space-y-2.5">
                          {getPlanHighlights(plan).map((feature) => (
                            <li key={feature} className="flex items-start gap-3 text-sm text-[#d1d5db]">
                              <span className="mt-0.5 inline-flex h-4.5 w-4.5 items-center justify-center rounded-full border border-[#3e6ff4]/35 bg-[#3e6ff4]/10 text-[#93c5fd]">
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.18em] text-[#93c5fd]">Effective rate</p>
                            <p className="mt-1 text-sm font-medium text-white">{getUnitCostLabel(plan.price, plan.sms_count, plan.currency)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleTopup(plan)}
                            disabled={isPurchaseBlocked || Boolean(purchasingPlanId) || !plan.package_id}
                            className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                              isPurchaseBlocked || purchasingPlanId || !plan.package_id
                                ? 'cursor-not-allowed bg-white/5 text-white/40'
                                : 'bg-[#3e6ff4]/15 text-[#dbeafe] hover:bg-[#3e6ff4]/25 hover:text-white'
                            }`}
                          >
                            {isSubmitting ? 'Redirecting...' : billingLoading ? 'Checking billing...' : isPurchaseBlocked ? 'Unavailable' : 'Buy package'}
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default SmsPlansPage