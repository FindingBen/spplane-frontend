import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import {customerSignupWithQrCode} from '../service/api/segments'

const SmsOptInPage = () => {
    const [searchParams] = useSearchParams()
    const q = searchParams.get('q')
    const [first_name, setFirstName] = useState('')
    const [last_name, setLastName] = useState('')
    const [phone_number, setPhoneNumber] = useState('')
    const [optIn, setOptIn] = useState('')
    const [feedback, setFeedback] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e) => {
    e.preventDefault()

    if (!optIn) {
      setFeedback({ type: 'error', message: 'Please accept SMS consent before joining the list.' })
      return
    }

    if (!phone_number || !isValidPhoneNumber(phone_number)) {
      setFeedback({ type: 'error', message: 'Please enter a valid mobile number.' })
      return
    }

    setFeedback(null)
    setIsSubmitting(true)

        const payload = {
            qr_id:q,
            first_name:first_name,
            last_name:last_name,
          phone:phone_number,
            status:optIn

        }

    try {
        const response = await customerSignupWithQrCode(payload)
        setFeedback({
          type: 'success',
          message: response?.message || response?.detail || "You're signed up. We'll be in touch by SMS.",
        })
    } catch (submitError) {
      setFeedback({
        type: 'error',
        message:
          submitError?.response?.data?.detail ||
          submitError?.response?.data?.message ||
          'We could not complete your signup. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
    }


  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#090921] via-[#111827] to-[#1D1A22] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(62,111,244,0.24),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(73,55,186,0.2),_transparent_30%)]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(62,111,244,0.14),transparent)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="text-left">
            {/* <div className="inline-flex items-center rounded-full border border-[#3e6ff4]/30 bg-[#3e6ff4]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-[#93c5fd] shadow-[0_0_40px_rgba(62,111,244,0.15)]">
              Sendperplane SMS
            </div> */}
{/* 
            <h1 className="mt-6 max-w-2xl text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
              Turn subscribers into first-to-know customers.
            </h1> */}

            {/* <p className="mt-5 max-w-xl text-sm leading-7 text-[#CAC4CF] sm:text-base">
              Invite shoppers to join your SMS list with a clean, high-converting opt-in flow that matches the rest of your Sendperplane experience.
            </p> */}

{/* 
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-xl font-semibold text-white">98%</p>
                <p className="mt-2 text-xs text-[#CAC4CF]">Average open rates compared to crowded inboxes.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-xl font-semibold text-white">Instant</p>
                <p className="mt-2 text-xs text-[#CAC4CF]">Promotions, restocks, and launch reminders in real time.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-xl font-semibold text-white">Branded</p>
                <p className="mt-2 text-xs text-[#CAC4CF]">Designed to feel native to your current storefront theme.</p>
              </div>
            </div> */}
{/* 
            <div className="mt-8 rounded-3xl border border-white/10 bg-[#111827]/80 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#93c5fd]">Why customers opt in</p>
              <div className="mt-5 space-y-4">
                {audienceHighlights.map((highlight) => (
                  <div key={highlight} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-gradient-to-br from-[#3e6ff4] to-[#4937BA] text-xs font-semibold text-white">
                      ✓
                    </span>
                    <p className="text-xs leading-6 text-[#E5E7EB] sm:text-sm">{highlight}</p>
                  </div>
                ))}
              </div>
            </div> */}
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[#3e6ff4]/30 via-transparent to-[#4937BA]/20 blur-3xl" />

            <div className="relative rounded-[2rem] border border-white/10 bg-[#111827]/90 p-6 shadow-[0_30px_120px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#93c5fd]">Sign up</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">Stay in the loop by SMS</h2>
                  <p className="mt-3 text-xs leading-6 text-[#9CA3AF]">
                    Exclusive updates, quick reminders, and limited-time offers sent straight to your phone.
                  </p>
                </div>

                {/* <div className="rounded-2xl border border-[#3e6ff4]/20 bg-[#3e6ff4]/10 px-3 py-2 text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#93c5fd]">Secure</p>
                  <p className="mt-1 text-xs text-white">TCPA-ready</p>
                </div> */}
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                {feedback && (
                  <div
                    role={feedback.type === 'error' ? 'alert' : 'status'}
                    aria-live="polite"
                    className={`rounded-2xl px-4 py-3 text-xs ${
                      feedback.type === 'success'
                        ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
                        : 'border border-red-500/30 bg-red-500/10 text-red-100'
                    }`}
                  >
                    {feedback.message}
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-left">
                    <span className="mb-2 block text-xs font-medium text-[#E5E7EB]">First name</span>
                    <input
                      type="text"
                      placeholder="Jordan"
                      value={first_name}
                      onChange={(e) => {
                        setFirstName(e.target.value)
                        if (feedback) {
                          setFeedback(null)
                        }
                      }}
                      className="w-full rounded-2xl border border-white/10 bg-[#1B2233] px-4 py-3 text-white placeholder:text-[#6B7280] outline-none transition focus:border-[#3e6ff4] focus:ring-2 focus:ring-[#3e6ff4]/40"
                    />
                  </label>

                  <label className="block text-left">
                    <span className="mb-2 block text-xs font-medium text-[#E5E7EB]">Last name</span>
                    <input
                      type="text"
                      placeholder="Miles"
                      value={last_name}
                      onChange={(e) => {
                        setLastName(e.target.value)
                        if (feedback) {
                          setFeedback(null)
                        }
                      }}
                      className="w-full rounded-2xl border border-white/10 bg-[#1B2233] px-4 py-3 text-white placeholder:text-[#6B7280] outline-none transition focus:border-[#3e6ff4] focus:ring-2 focus:ring-[#3e6ff4]/40"
                    />
                  </label>
                </div>

                <label className="block text-left">
                  <span className="mb-2 block text-xs font-medium text-[#E5E7EB]">Mobile number</span>
                  <PhoneInput
                    defaultCountry="DK"
                    countryCallingCodeEditable={false}
                    international={false}
                    value={phone_number}
                    onChange={(value) => {
                      setPhoneNumber(value || '')
                      if (feedback) {
                        setFeedback(null)
                      }
                    }}
                    autoComplete="tel"
                    placeholder="Enter your mobile number"
                    className="sms-phone-input"
                  />
                  <p className="mt-2 text-xs text-[#9CA3AF]">Choose your country and enter your mobile number. We will submit it in international format.</p>
                </label>

               

                <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                  <input
                    checked={optIn === 'subscribed'}
                    onChange={(e) => {
                      setOptIn(e.target.checked ? 'subscribed' : '')
                      if (feedback) {
                        setFeedback(null)
                      }
                    }}
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-[#3e6ff4] focus:ring-[#3e6ff4]"
                  />
                  <span className="text-xs leading-6 text-[#D1D5DB]">
                    I agree to receive recurring automated marketing text messages at the phone number provided. Consent is not a condition of purchase. Message and data rates may apply.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={!optIn || isSubmitting}
                  className="w-full rounded-2xl bg-gradient-to-r from-[#3e6ff4] via-[#4f7cf7] to-[#4937BA] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(62,111,244,0.35)] transition hover:scale-[0.995] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? 'Joining...' : 'Join SMS list'}
                </button>
              </form>

              <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-6 text-left sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-[#9CA3AF]">
                  By signing up, you agree to our terms and privacy policy.
                </p>
                <div className="flex items-center gap-2 text-xs text-[#E5E7EB]">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]" />
                  Average response time: under 5 minutes
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SmsOptInPage