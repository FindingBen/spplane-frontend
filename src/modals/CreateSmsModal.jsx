import { useEffect, useState } from 'react'
import { getCampaigns } from '../service/api/campaign'
import { getContactLists } from '../service/api/segments'
import { useFirstCampaignGuide } from '../guide/FirstCampaignGuideProvider'

const inputCls =
  'w-full rounded-lg border border-[#3e6ff4]/30 bg-[#111827] px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-[#CAC4CF]/50 focus:border-[#3e6ff4]'

const selectCls =
  'w-full rounded-lg border border-[#3e6ff4]/30 bg-[#111827] px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#3e6ff4]'

const INITIAL_FORM = { campaign: '', contactList: '', sender: '', body: '' }

const PERSONALIZATION_TOKENS = [
  { label: 'First Name', token: '{{first_name}}' },
  { label: 'Page Link', token: '{{page_link}}' },
]

const smsSegments = (body) => {
  if (!body) return 0
  const len = body.length
  if (len <= 160) return 1
  return Math.ceil(len / 153)
}

function SectionLabel({ number, children, note }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#3e6ff4]/50 bg-[#3e6ff4]/20 text-xs font-bold text-[#60a5fa]">
        {number}
      </span>
      <span className="text-sm font-medium text-white">{children}</span>
      {note && <span className="ml-auto text-xs text-[#CAC4CF]/50">{note}</span>}
    </div>
  )
}

function CreateSmsModal({
  onClose,
  onCreate,
  submitting,
  title = 'Create New SMS',
  submitLabel = 'Create SMS',
  initialValues = {},
  lockedCampaign = null,
  showAudience = true,
  bodyPlaceholder = 'Hello {{first_name}}, tap here: {{page_link}}',
  templateText = 'Hello {{first_name}}, tap here: {{page_link}}',
}) {
  const { active, currentStepId } = useFirstCampaignGuide()
  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    ...initialValues,
    campaign: lockedCampaign?.id ? String(lockedCampaign.id) : (initialValues.campaign ?? ''),
  }))
  const [errors, setErrors] = useState({})
  const [campaigns, setCampaigns] = useState([])
  const [contactLists, setContactLists] = useState([])
  const [loading, setLoading] = useState(true)
  const isGuideLocked = active && currentStepId === 'sms-form'

  useEffect(() => {
    let ignore = false

    Promise.all([
      lockedCampaign ? Promise.resolve([]) : getCampaigns().catch(() => []),
      showAudience ? getContactLists().catch(() => []) : Promise.resolve([]),
    ])
      .then(([campaignData, listData]) => {
        if (ignore) return

        setCampaigns(Array.isArray(campaignData) ? campaignData : campaignData?.results ?? [])
        setContactLists(Array.isArray(listData) ? listData : listData?.results ?? [])
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [lockedCampaign, showAudience])

  const field = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const validate = () => {
    const nextErrors = {}

    if (!form.campaign) nextErrors.campaign = 'Please select a campaign.'
    if (showAudience && !form.contactList) nextErrors.contactList = 'Please select a contact list.'
    if (!form.sender.trim()) nextErrors.sender = 'Sender is required.'
    if (!form.body.trim()) nextErrors.body = 'SMS body is required.'
    if (form.body.length > 1600) nextErrors.body = 'Body cannot exceed 1600 characters.'

    return nextErrors
  }

  const appendToken = (token) => {
    const suffix = form.body && !form.body.endsWith(' ') ? ` ${token}` : token
    field('body', `${form.body}${suffix}`.trim())
    setErrors((prev) => ({ ...prev, body: '' }))
  }

  const insertTemplate = () => {
    field('body', templateText)
    setErrors((prev) => ({ ...prev, body: '' }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate()

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    onCreate({
      campaign: form.campaign,
      ...(showAudience && form.contactList ? { contact_list: form.contactList } : {}),
      sender: form.sender.trim(),
      body: form.body.trim(),
    })
  }

  const segments = smsSegments(form.body)
  const charsLeft = 1600 - form.body.length
  const smsSectionNumber = showAudience ? 3 : 2
  const senderSectionNumber = showAudience ? 4 : 3

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={isGuideLocked ? undefined : onClose} />

      <div data-guide-id="sms-form" className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[#3e6ff4]/30 bg-gradient-to-br from-[#1f2937] to-[#1D1A22] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#3e6ff4]/20 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3e6ff4]/20">
              <svg className="h-4 w-4 text-[#60a5fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isGuideLocked}
            className="rounded-lg p-1.5 text-[#CAC4CF] transition-colors hover:bg-[#3e6ff4]/20 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[76vh] space-y-6 overflow-y-auto p-6">
          <div>
            <SectionLabel number="1">Campaign</SectionLabel>
            <p className="mb-3 text-xs text-[#CAC4CF]/60">
              Select a campaign to connect the content link page used by <code className="text-[#60a5fa]">{'{{page_link}}'}</code>.
            </p>
            {lockedCampaign ? (
              <div className="rounded-lg border border-[#3e6ff4]/25 bg-[#111827] px-4 py-3 text-sm text-white">
                {lockedCampaign.name || `Campaign #${lockedCampaign.id}`}
              </div>
            ) : loading ? (
              <div className="flex items-center gap-2 rounded-lg border border-[#3e6ff4]/30 bg-[#111827] px-4 py-2.5">
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#3e6ff4]/30 border-t-[#3e6ff4]" />
                <span className="text-sm text-[#CAC4CF]/50">Loading...</span>
              </div>
            ) : (
              <select
                value={form.campaign}
                onChange={(event) => {
                  field('campaign', event.target.value)
                  setErrors((prev) => ({ ...prev, campaign: '' }))
                }}
                className={selectCls}
              >
                <option value="">Select a campaign...</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name || `Campaign #${campaign.id}`}
                  </option>
                ))}
              </select>
            )}
            {errors.campaign && <p className="mt-1 text-xs text-red-400">{errors.campaign}</p>}
          </div>

          {showAudience && (
            <>
              <div className="border-t border-[#3e6ff4]/10" />

              <div>
                <SectionLabel number="2">Audience</SectionLabel>
                {loading ? (
                  <div className="flex items-center gap-2 rounded-lg border border-[#3e6ff4]/30 bg-[#111827] px-4 py-2.5">
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#3e6ff4]/30 border-t-[#3e6ff4]" />
                    <span className="text-sm text-[#CAC4CF]/50">Loading...</span>
                  </div>
                ) : (
                  <select
                    value={form.contactList}
                    onChange={(event) => {
                      field('contactList', event.target.value)
                      setErrors((prev) => ({ ...prev, contactList: '' }))
                    }}
                    className={selectCls}
                  >
                    <option value="">Select a contact list...</option>
                    {contactLists.map((contactList) => (
                      <option key={contactList.id} value={contactList.id}>
                        {contactList.segment_name}
                        {contactList.contact_lenght != null ? ` (${contactList.contact_lenght} contacts)` : ''}
                      </option>
                    ))}
                  </select>
                )}
                {errors.contactList && <p className="mt-1 text-xs text-red-400">{errors.contactList}</p>}
              </div>
            </>
          )}

          <div className="border-t border-[#3e6ff4]/10" />

          <div>
            <SectionLabel number={smsSectionNumber}>SMS Message</SectionLabel>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {PERSONALIZATION_TOKENS.map(({ label, token }) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => appendToken(token)}
                  className="rounded-full border border-[#3e6ff4]/30 bg-[#3e6ff4]/10 px-2.5 py-1 text-xs font-medium text-[#93c5fd] transition-colors hover:border-[#3e6ff4]/60 hover:bg-[#3e6ff4]/20"
                >
                  + {label}
                </button>
              ))}
              <button
                type="button"
                onClick={insertTemplate}
                className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/20"
              >
                Use Template
              </button>
            </div>
            <textarea
              rows={5}
              maxLength={1600}
              placeholder={bodyPlaceholder}
              value={form.body}
              onChange={(event) => {
                field('body', event.target.value)
                setErrors((prev) => ({ ...prev, body: '' }))
              }}
              className={`${inputCls} resize-none leading-relaxed`}
            />
            <div className="mt-1.5 flex items-center justify-between">
              {errors.body ? (
                <p className="text-xs text-red-400">{errors.body}</p>
              ) : (
                <span className="text-xs text-[#CAC4CF]/40">Use <code className="text-[#93c5fd]">{'{{first_name}}'}</code> and <code className="text-[#93c5fd]">{'{{page_link}}'}</code> tokens. Max 1600 characters.</span>
              )}
              <div className="ml-4 flex shrink-0 items-center gap-2 text-xs text-[#CAC4CF]/50">
                {form.body.length > 0 && (
                  <span className="rounded-full bg-[#3e6ff4]/10 px-2 py-0.5 text-[#60a5fa]/70">
                    {segments} SMS segment{segments !== 1 ? 's' : ''}
                  </span>
                )}
                <span className={charsLeft < 50 ? 'text-amber-400' : ''}>{form.body.length} / 1600</span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#3e6ff4]/10" />

          <div>
            <SectionLabel number={senderSectionNumber}>Sender</SectionLabel>
            <input
              type="text"
              placeholder="e.g. +1234567890 or MyBrand"
              value={form.sender}
              onChange={(event) => {
                field('sender', event.target.value)
                setErrors((prev) => ({ ...prev, sender: '' }))
              }}
              className={inputCls}
            />
            {errors.sender && <p className="mt-1 text-xs text-red-400">{errors.sender}</p>}
            <p className="mt-1.5 text-xs text-[#CAC4CF]/40">Phone number in E.164 format or registered alphanumeric sender ID.</p>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#3e6ff4]/30 py-2.5 text-sm font-medium text-[#CAC4CF] transition-all hover:border-[#3e6ff4]/60 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating...
                </>
              ) : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateSmsModal