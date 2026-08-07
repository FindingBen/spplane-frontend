import { useEffect, useState } from 'react'
import Header from '../components/Header'
import TopBar from '../components/TopBar'
import CreateSmsModal from '../modals/CreateSmsModal'
import { createAutomation, getAutomations, updateAutomation } from '../service/api/automation'
import { getContactLists } from '../service/api/segments'

const FALLBACK_SEGMENTS = ['Test list', 'Other list', 'VIP Customers', 'New Subscribers']
const PERIOD_OPTIONS = ['SECONDS', 'MINUTES', 'HOURS', 'DAYS', 'WEEKS', 'MONTHS']
const DEFAULT_RECURRING_EVERY = 1
const DEFAULT_RECURRING_PERIOD = 'WEEKS'

const FLOWS = [
  {
    id: 'welcome_user',
    heading: 'New customer signup',
    automationTitle: 'Welcome new user SMS',
    automationDescription: 'Send the welcome SMS whenever a new customer signs up through the QR code.',
    smsTitle: 'Create welcome SMS',
    smsPlaceholder: 'Welcome {{first_name}}! Thanks for joining us.',
    smsTemplate: 'Welcome {{first_name}}! Thanks for joining us.',
    smsTokens: [{ label: 'First Name', token: '{{first_name}}' }],
    steps: [
      { id: 'sms', label: 'Craft curated\nmessage to\nwelcome new user' },
      { id: 'content', label: 'Create personalized\ncontent', optional: true },
    ],
  },
  {
    id: 'recurring',
    heading: 'Recurring sms',
    automationTitle: 'Recurring sms',
    automationDescription: 'Send recurring SMS offers to the selected audience.',
    smsTitle: 'Create Recurring sms',
    smsPlaceholder: 'This week only: discover the latest offer here {{page_link}}',
    smsTemplate: 'This week only: discover the latest offer here {{page_link}}',
    smsTokens: [
      { label: 'First Name', token: '{{first_name}}' },
      { label: 'Page Link', token: '{{page_link}}' },
    ],
    steps: [
      { id: 'sms', label: 'Craft curated\nmessage to\nrecourring sms' },
      { id: 'content', label: 'Create personalized\ncontent', optional: true },
      { id: 'occurrence', label: 'Select occurrence\ndate' },
      { id: 'segment', label: 'Select segment\nlist' },
    ],
  },
]

const INITIAL_FLOW_STATE = {
  welcome_user: { automation: null, smsBody: '', smsSender: '', segment: null },
  recurring: {
    automation: null,
    smsBody: '',
    smsSender: '',
    segment: null,
    every: DEFAULT_RECURRING_EVERY,
    period: DEFAULT_RECURRING_PERIOD,
  },
}

const getFlowConfig = (flowId) => FLOWS.find((flow) => flow.id === flowId)

const getAutomationSmsBody = (automation) => (typeof automation?.sms_body === 'string' ? automation.sms_body : '')

const getAutomationSmsSender = (automation) => (typeof automation?.sms_sender === 'string' ? automation.sms_sender : '')

const getAutomationEvery = (automation) => {
  const parsed = Number(automation?.every)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_RECURRING_EVERY
}

const getAutomationPeriod = (automation) => {
  const normalized = String(automation?.period || '').toUpperCase()
  return PERIOD_OPTIONS.includes(normalized) ? normalized : DEFAULT_RECURRING_PERIOD
}

const formatPeriodLabel = (period) => {
  const label = String(period || '').toLowerCase()
  return label.charAt(0).toUpperCase() + label.slice(1)
}

const resolveAutomationSegment = (automation, segments) => {
  const contactListId = automation?.segment_list_id
  if (!contactListId) return null
  return segments.find((segment) => String(segment.id) === String(contactListId)) ?? null
}

const mergeAutomationRecord = (currentAutomation, nextAutomation) => ({
  ...currentAutomation,
  ...nextAutomation,
  sms_body: nextAutomation?.sms_body ?? currentAutomation?.sms_body ?? '',
  sms_sender: nextAutomation?.sms_sender ?? currentAutomation?.sms_sender ?? '',
  is_active: nextAutomation?.is_active ?? currentAutomation?.is_active ?? false,
  status: nextAutomation?.status ?? currentAutomation?.status ?? 'deactivated',
  segment_list_id: nextAutomation?.segment_list_id ?? currentAutomation?.segment_list_id ?? null,
  every: nextAutomation?.every ?? currentAutomation?.every ?? DEFAULT_RECURRING_EVERY,
  period: nextAutomation?.period ?? currentAutomation?.period ?? DEFAULT_RECURRING_PERIOD,
})

function StepConnector() {
  return (
    <div className="flex shrink-0 items-center px-2 sm:px-3">
      <div className="h-px w-8 bg-gradient-to-r from-white/10 via-[#93c5fd]/50 to-[#93c5fd]/10 sm:w-10" />
      <svg className="h-4 w-4 text-[#93c5fd]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 12h14m-4-4 4 4-4 4" />
      </svg>
    </div>
  )
}

function FlowStep({ label, status, onClick, optional = false, lockedByActivation = false }) {
  const toneClasses = {
    complete: 'border-emerald-400/35 bg-emerald-400/10 text-white shadow-[0_0_30px_rgba(52,211,153,0.08)]',
    ready: 'border-[#3e6ff4]/35 bg-[#3e6ff4]/10 text-white hover:border-[#60a5fa]/60 hover:bg-[#3e6ff4]/18',
    locked: 'border-white/10 bg-white/[0.03] text-[#9CA3AF] hover:border-white/15',
    optional: 'border-dashed border-white/12 bg-white/[0.02] text-[#9CA3AF] hover:border-white/20',
  }

  return (
    <div className="relative flex shrink-0 flex-col items-center">
      {optional && (
        <span className="absolute -top-5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#93c5fd]">
          Optional
        </span>
      )}

      <button
        type="button"
        onClick={onClick}
        className={`relative flex h-[88px] min-w-[160px] items-center justify-center rounded-2xl border px-4 text-center text-xs font-semibold leading-6 transition-all sm:min-w-[188px] ${toneClasses[status]} ${lockedByActivation ? 'cursor-not-allowed border-amber-400/25 bg-amber-500/10 text-amber-50' : ''}`}
      >
        <span className="whitespace-pre-line">{label}</span>
        {lockedByActivation && (
          <span className="absolute left-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-200">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-5a2 2 0 00-2-2h-1V7a5 5 0 00-10 0v1H6a2 2 0 00-2 2v5a2 2 0 002 2zm3-9V7a3 3 0 016 0v1H9z" />
            </svg>
          </span>
        )}
        {status === 'complete' && (
          <span className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}
      </button>
    </div>
  )
}

function SegmentSelectionModal({ segments, selectedSegmentId, onSelect, onClose, onSave }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/75 px-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-lg rounded-[28px] border border-[#3e6ff4]/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(29,26,34,0.95))] p-6 shadow-[0_30px_100px_rgba(2,6,23,0.55)] md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#93c5fd]">Recourring sms</p>
            <h2 className="mt-3 text-xl font-semibold text-white">Select segment list</h2>
            <p className="mt-2 text-xs leading-6 text-[#CAC4CF]">
              Choose the segment that should receive the recourring sms automation.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#CAC4CF] transition-colors hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-6 rounded-3xl border border-[#3e6ff4]/20 bg-[#0f172a]/70 p-5 text-left">
          <label className="block">
            <span className="text-xs font-medium text-[#E5E7EB]">Segment list</span>
            <select
              value={selectedSegmentId}
              onChange={(event) => onSelect(event.target.value)}
              className="mt-4 w-full rounded-2xl border border-[#3e6ff4]/25 bg-[#111827] px-4 py-3 text-xs text-white outline-none transition-colors focus:border-[#60a5fa]"
            >
              {segments.map((segment) => (
                <option key={segment.id} value={segment.id}>
                  {segment.segment_name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-medium text-[#E5E7EB] transition-colors hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] px-5 py-3 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            Save segment
          </button>
        </div>
      </div>
    </div>
  )
}

function OccurrenceScheduleModal({ initialEvery, initialPeriod, onClose, onSave }) {
  const [every, setEvery] = useState(String(initialEvery ?? DEFAULT_RECURRING_EVERY))
  const [period, setPeriod] = useState(initialPeriod ?? DEFAULT_RECURRING_PERIOD)
  const [error, setError] = useState('')

  const handleSave = () => {
    const parsedEvery = Number(every)

    if (!Number.isInteger(parsedEvery) || parsedEvery <= 0) {
      setError('Frequency must be a whole number greater than 0.')
      return
    }

    if (!PERIOD_OPTIONS.includes(period)) {
      setError('Select a valid time frame.')
      return
    }

    onSave(parsedEvery, period)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/75 px-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-xl rounded-[28px] border border-[#3e6ff4]/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(29,26,34,0.95))] p-6 shadow-[0_30px_100px_rgba(2,6,23,0.55)] md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#93c5fd]">Recurring sms</p>
            <h2 className="mt-3 text-xl font-semibold text-white">Select occurrence</h2>
            <p className="mt-2 text-xs leading-6 text-[#CAC4CF]">
              Configure how often this automation runs for Celery beat.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#CAC4CF] transition-colors hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-6 grid gap-4 rounded-3xl border border-[#3e6ff4]/20 bg-[#0f172a]/70 p-5 md:grid-cols-[1fr_1.3fr]">
          <label className="block text-left">
            <span className="text-xs font-medium text-[#E5E7EB]">Every</span>
            <input
              type="number"
              min={1}
              step={1}
              value={every}
              onChange={(event) => {
                setEvery(event.target.value)
                setError('')
              }}
              className="mt-3 w-full rounded-2xl border border-[#3e6ff4]/25 bg-[#111827] px-4 py-3 text-xs text-white outline-none transition-colors focus:border-[#60a5fa]"
              placeholder="1"
            />
          </label>

          <label className="block text-left">
            <span className="text-xs font-medium text-[#E5E7EB]">Time frame</span>
            <select
              value={period}
              onChange={(event) => {
                setPeriod(event.target.value)
                setError('')
              }}
              className="mt-3 w-full rounded-2xl border border-[#3e6ff4]/25 bg-[#111827] px-4 py-3 text-xs text-white outline-none transition-colors focus:border-[#60a5fa]"
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option} value={option}>{formatPeriodLabel(option)}</option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-xs text-red-100">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-medium text-[#E5E7EB] transition-colors hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] px-5 py-3 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            Save occurrence
          </button>
        </div>
      </div>
    </div>
  )
}

function FlowStatusConfirmModal({ flowId, mode, onClose, onConfirm }) {
  const isDeactivate = mode === 'deactivate'
  const isWelcomeFlow = flowId === 'welcome_user'
  const flowLabel = isWelcomeFlow ? 'New customer signup' : 'Recurring sms'
  const flowName = isWelcomeFlow ? 'welcome' : 'recurring'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/75 px-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-lg rounded-[28px] border border-[#3e6ff4]/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(29,26,34,0.95))] p-6 shadow-[0_30px_100px_rgba(2,6,23,0.55)] md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#93c5fd]">{flowLabel}</p>
            <h2 className="mt-3 text-xl font-semibold text-white">{isDeactivate ? 'Deactivate this flow?' : 'Activate this flow?'}</h2>
            <p className="mt-2 text-xs leading-6 text-[#CAC4CF]">
              {isDeactivate
                ? `Once deactivated, this ${flowName} automation will stop sending messages.`
                : `Once activated, this ${flowName} automation will start sending messages automatically.`}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#CAC4CF] transition-colors hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-6 rounded-3xl border border-[#3e6ff4]/20 bg-[#0f172a]/70 p-5 text-left">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${isDeactivate ? 'bg-amber-500/15 text-amber-300' : 'bg-[#3e6ff4]/15 text-[#93c5fd]'}`}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isDeactivate ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-white">{isDeactivate ? 'This turns the automation off immediately.' : 'This turns on the automation immediately.'}</p>
              <p className="mt-1 text-xs leading-6 text-[#CAC4CF]">
                {isDeactivate
                  ? `The ${flowName} automation will remain saved, but it will not send messages until you activate it again.`
                  : `You can only activate after saving the message template. Future sends will use the message currently saved in this automation.`}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-medium text-[#E5E7EB] transition-colors hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-xs font-semibold text-white transition-opacity hover:opacity-90 ${
              isDeactivate ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa]'
            }`}
          >
            {isDeactivate ? 'Deactivate flow' : 'Activate flow'}
          </button>
        </div>
      </div>
    </div>
  )
}

const AutomationPage = () => {
  const [flowState, setFlowState] = useState(INITIAL_FLOW_STATE)
  const [flowFeedback, setFlowFeedback] = useState({})
  const [modalState, setModalState] = useState(null)
  const [flowStatusModal, setFlowStatusModal] = useState(null)
  const [isSubmittingSms, setIsSubmittingSms] = useState(false)
  const [activatingFlowId, setActivatingFlowId] = useState(null)
  const [isLoadingAutomations, setIsLoadingAutomations] = useState(true)
  const [selectedSegmentId, setSelectedSegmentId] = useState('')
  const [contactLists, setContactLists] = useState([])

  const availableSegments = contactLists.length
    ? contactLists
    : FALLBACK_SEGMENTS.map((segment, index) => ({ id: `fallback-${index}`, segment_name: segment }))

  const modalFlow = modalState ? getFlowConfig(modalState.flowId) : null
  const currentModalFlowState = modalState ? flowState[modalState.flowId] : null

  useEffect(() => {
    let ignore = false

    Promise.all([
      getContactLists().catch(() => []),
      getAutomations().catch(() => []),
    ])
      .then(([contactListData, automationData]) => {
        if (ignore) return

        const contactListItems = Array.isArray(contactListData) ? contactListData : contactListData?.results ?? []
        const automationItems = Array.isArray(automationData) ? automationData : automationData?.results ?? []
        const welcomeAutomation = automationItems.find((automation) => automation?.automation_type === 'welcome_user') ?? null
        const recourringAutomation = automationItems.find((automation) => automation?.automation_type === 'recurring') ?? null

        setContactLists(contactListItems)

        if (welcomeAutomation) {
          setFlowState((prev) => ({
            ...prev,
            welcome_user: {
              ...prev.welcome_user,
              automation: mergeAutomationRecord(prev.welcome_user.automation, welcomeAutomation),
              smsBody: getAutomationSmsBody(welcomeAutomation),
              smsSender: getAutomationSmsSender(welcomeAutomation),
            },
          }))
          setFeedback(
            'welcome_user',
            'info',
            welcomeAutomation.is_active
              ? 'You already have an active welcome automation for new customer signups. Deactivate it to edit the sender or message template.'
              : 'A welcome automation already exists for this account. Click the message step to update its sender or body.',
          )
        }

        if (recourringAutomation) {
          const recourringSegment = resolveAutomationSegment(recourringAutomation, contactListItems)

          setFlowState((prev) => ({
            ...prev,
            recurring: {
              ...prev.recurring,
              automation: mergeAutomationRecord(prev.recurring.automation, recourringAutomation),
              smsBody: getAutomationSmsBody(recourringAutomation),
              smsSender: getAutomationSmsSender(recourringAutomation),
              segment: recourringSegment,
              every: getAutomationEvery(recourringAutomation),
              period: getAutomationPeriod(recourringAutomation),
            },
          }))
        }
      })
      .finally(() => {
        if (!ignore) setIsLoadingAutomations(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  const setFeedback = (flowId, type, message) => {
    setFlowFeedback((prev) => ({
      ...prev,
      [flowId]: { type, message },
    }))
  }

  const openModal = (type, flowId) => {
    setFeedback(flowId, null, '')

    if (type === 'segment') {
      const currentSegmentId = flowState[flowId].segment?.id
      setSelectedSegmentId(String(currentSegmentId ?? availableSegments[0]?.id ?? ''))
    }

    setModalState({ type, flowId })
  }

  const closeModal = () => {
    setModalState(null)
  }

  const openFlowStatusModal = (flowId, mode) => {
    setFeedback(flowId, null, '')
    setFlowStatusModal({ flowId, mode })
  }

  const closeFlowStatusModal = () => {
    setFlowStatusModal(null)
  }

  const persistAutomation = async (flowId, { smsBody, smsSender, isActive, contactListId, every, period } = {}) => {
    const flowConfig = getFlowConfig(flowId)
    const currentFlow = flowState[flowId]
    const resolvedSmsBody = (smsBody ?? currentFlow.smsBody ?? currentFlow.automation?.sms_body ?? '').trim()
    const resolvedSmsSender = (smsSender ?? currentFlow.smsSender ?? currentFlow.automation?.sms_sender ?? '').trim()
    const resolvedIsActive = typeof isActive === 'boolean'
      ? isActive
      : Boolean(currentFlow.automation?.is_active)
    const resolvedStatus = typeof isActive === 'boolean'
      ? (isActive ? 'activated' : 'deactivated')
      : (currentFlow.automation?.status ?? (resolvedIsActive ? 'activated' : 'deactivated'))
    const resolvedContactListId = contactListId
      ?? currentFlow.segment?.id
      ?? currentFlow.automation?.segment_list_id
      ?? null
    const resolvedEvery = flowId === 'recurring'
      ? (Number.isInteger(Number(every)) && Number(every) > 0
        ? Number(every)
        : (Number.isInteger(Number(currentFlow.every)) && Number(currentFlow.every) > 0
          ? Number(currentFlow.every)
          : getAutomationEvery(currentFlow.automation)))
      : null
    const resolvedPeriod = flowId === 'recurring'
      ? (PERIOD_OPTIONS.includes(String(period || '').toUpperCase())
        ? String(period).toUpperCase()
        : (PERIOD_OPTIONS.includes(String(currentFlow.period || '').toUpperCase())
          ? String(currentFlow.period).toUpperCase()
          : getAutomationPeriod(currentFlow.automation)))
      : null

    if (!resolvedSmsBody) {
      throw new Error('Create the SMS template before saving the automation.')
    }

    if (!resolvedSmsSender) {
      throw new Error('Provide the SMS sender before saving the automation.')
    }

    const payload = {
      name: flowConfig.automationTitle,
      automation_type: flowId,
      description: flowConfig.automationDescription,
      sms_body: resolvedSmsBody,
      sms_sender: resolvedSmsSender,
      is_active: resolvedIsActive,
      status: resolvedStatus,
      ...(flowId === 'recurring' && resolvedContactListId ? { segment_list_id: resolvedContactListId } : {}),
      ...(flowId === 'recurring' ? { every: resolvedEvery, period: resolvedPeriod } : {}),
    }

    if (currentFlow.automation?.id) {
      return updateAutomation(currentFlow.automation.id, payload)
    }

    return createAutomation({
      ...payload,
      is_active: resolvedIsActive,
      status: resolvedStatus,
    })
  }

  const handleCreateAutomation = async ({ sender, body }) => {
    const flowId = modalState?.flowId
    if (!flowId) return
    const isEditingAutomation = Boolean(flowState[flowId].automation?.id)

    setIsSubmittingSms(true)

    try {
      const savedAutomation = await persistAutomation(flowId, {
        smsBody: body,
        smsSender: sender,
      })

      setFlowState((prev) => ({
        ...prev,
        [flowId]: {
          ...prev[flowId],
          automation: mergeAutomationRecord(prev[flowId].automation, savedAutomation),
          smsBody: body.trim(),
          smsSender: sender.trim(),
        },
      }))
      setFeedback(
        flowId,
        'success',
        flowId === 'recurring'
          ? isEditingAutomation
            ? 'Automation updated. You can activate it when you are ready.'
            : 'Automation created. Choose the segment list next.'
          : isEditingAutomation
            ? 'Welcome automation updated. Activate the flow when you are ready.'
            : 'Welcome automation created. Activate the flow when you are ready.',
      )
      closeModal()
    } catch (error) {
      setFeedback(
        flowId,
        'error',
        error?.response?.data?.detail || error?.response?.data?.error || 'Unable to create the automation right now.',
      )
    } finally {
      setIsSubmittingSms(false)
    }
  }

  const handleSaveSegment = async () => {
    const flowId = modalState?.flowId
    if (!flowId) return

    const selectedSegment = availableSegments.find((segment) => String(segment.id) === String(selectedSegmentId))

    if (!selectedSegment) {
      setFeedback(flowId, 'error', 'Select a segment list before continuing.')
      return
    }

    if (String(selectedSegment.id).startsWith('fallback-')) {
      setFeedback(flowId, 'error', 'Load real segment lists before saving this step to automation.')
      return
    }

    try {
      const savedAutomation = await persistAutomation(flowId, {
        contactListId: selectedSegment.id,
      })

      setFlowState((prev) => ({
        ...prev,
        [flowId]: {
          ...prev[flowId],
          automation: mergeAutomationRecord(prev[flowId].automation, savedAutomation),
          smsBody: savedAutomation?.sms_body ?? prev[flowId].smsBody,
          smsSender: savedAutomation?.sms_sender ?? prev[flowId].smsSender,
          segment: selectedSegment,
        },
      }))
      setFeedback(flowId, 'success', `${selectedSegment.segment_name} saved for recourring sms automation.`)
      closeModal()
    } catch (error) {
      setFeedback(
        flowId,
        'error',
        error?.response?.data?.detail || error?.response?.data?.error || 'Unable to save the segment to automation right now.',
      )
    }
  }

  const handleSaveOccurrence = async (nextEvery, nextPeriod) => {
    const flowId = modalState?.flowId
    if (!flowId) return

    try {
      const savedAutomation = await persistAutomation(flowId, {
        every: nextEvery,
        period: nextPeriod,
      })

      setFlowState((prev) => ({
        ...prev,
        [flowId]: {
          ...prev[flowId],
          automation: mergeAutomationRecord(prev[flowId].automation, savedAutomation),
          smsBody: savedAutomation?.sms_body ?? prev[flowId].smsBody,
          smsSender: savedAutomation?.sms_sender ?? prev[flowId].smsSender,
          every: getAutomationEvery(savedAutomation),
          period: getAutomationPeriod(savedAutomation),
        },
      }))
      setFeedback(flowId, 'success', `Occurrence saved: every ${nextEvery} ${formatPeriodLabel(nextPeriod).toLowerCase()}.`)
      closeModal()
    } catch (error) {
      setFeedback(
        flowId,
        'error',
        error?.response?.data?.detail || error?.response?.data?.error || 'Unable to save occurrence right now.',
      )
    }
  }

  const updateFlowActivation = async (flowId, isActive, { skipConfirmation = false } = {}) => {
    const flow = flowState[flowId]

    if (isActive && (!flow.smsBody || !flow.smsSender)) {
      setFeedback(
        flowId,
        'error',
        flowId === 'welcome_user'
          ? 'Create the welcome message template and sender before activating the flow.'
          : 'Create the message template and sender before activating the automation.',
      )
      return
    }

    if (isActive && flowId === 'recurring' && !flow.segment) {
      setFeedback(flowId, 'error', 'Select a segment list before activating the recourring sms automation.')
      return
    }

    if (isActive && flowId === 'recurring' && !(flow.automation?.every && flow.automation?.period)) {
      setFeedback(flowId, 'error', 'Select occurrence before activating the recurring sms automation.')
      return
    }

    if ((flowId === 'welcome_user' || flowId === 'recurring') && !skipConfirmation) {
      openFlowStatusModal(flowId, isActive ? 'activate' : 'deactivate')
      return
    }

    setActivatingFlowId(flowId)

    try {
      const updatedAutomation = await persistAutomation(flowId, { isActive })

      setFlowState((prev) => ({
        ...prev,
        [flowId]: {
          ...prev[flowId],
          automation: mergeAutomationRecord(prev[flowId].automation, updatedAutomation),
          smsBody: updatedAutomation?.sms_body ?? prev[flowId].smsBody,
          smsSender: updatedAutomation?.sms_sender ?? prev[flowId].smsSender,
        },
      }))
      setFeedback(
        flowId,
        'success',
        isActive
          ? flowId === 'welcome_user'
            ? 'New customer signup flow activated. New QR signups will now receive this welcome SMS.'
            : 'Recourring sms automation activated.'
          : flowId === 'welcome_user'
            ? 'New customer signup flow deactivated. New QR signups will no longer receive this welcome SMS.'
            : 'Recourring sms automation deactivated.',
      )
    } catch (error) {
      setFeedback(
        flowId,
        'error',
        error?.response?.data?.detail
          || error?.response?.data?.error
          || (isActive ? 'Unable to activate the automation right now.' : 'Unable to deactivate the automation right now.'),
      )
    } finally {
      setActivatingFlowId(null)
    }
  }

  const handleActivateFlow = async (flowId, options = {}) => {
    await updateFlowActivation(flowId, true, options)
  }

  const handleDeactivateFlow = async (flowId, options = {}) => {
    await updateFlowActivation(flowId, false, options)
  }

  const handleStepClick = (flowId, stepId) => {
    const currentFlow = flowState[flowId]

    if (currentFlow.automation?.is_active && stepId !== 'trigger') {
      setFeedback(
        flowId,
        'info',
        flowId === 'welcome_user'
          ? 'This automation is active and locked. Deactivate it before editing the sender or message template.'
          : 'This automation is active and locked. Deactivate it before editing the sender or message template.',
      )
      return
    }

    if (stepId === 'sms') {
      if (flowId === 'welcome_user' && isLoadingAutomations) {
        setFeedback(flowId, 'info', 'Checking whether a welcome automation already exists...')
        return
      }

      openModal('sms', flowId)
      return
    }

    if (stepId === 'content') {
      setFeedback(flowId, 'info', 'Personalized content is left blank for now. You can connect this step later.')
      return
    }

    if (stepId === 'segment') {
      if (!currentFlow.smsBody) {
        setFeedback(flowId, 'error', 'Create the recourring sms template before selecting the segment list.')
        return
      }

      if (flowId === 'recurring' && !(currentFlow.automation?.every && currentFlow.automation?.period)) {
        setFeedback(flowId, 'error', 'Select occurrence before selecting the segment list.')
        return
      }

      openModal('segment', flowId)
      return
    }

    if (stepId === 'occurrence') {
      if (!currentFlow.smsBody) {
        setFeedback(flowId, 'error', 'Create the recourring sms template before selecting occurrence.')
        return
      }

      openModal('occurrence', flowId)
      return
    }

    if (stepId === 'trigger') {
      void (currentFlow.automation?.is_active ? handleDeactivateFlow(flowId) : handleActivateFlow(flowId))
    }
  }

  const getStepStatus = (flowId, stepId) => {
    const flow = flowState[flowId]
    const hasOccurrenceSaved = Boolean(flow?.automation?.every && flow?.automation?.period)

    if (stepId === 'content') return 'optional'
    if (stepId === 'sms') {
      if (flowId === 'welcome_user' && isLoadingAutomations) return 'locked'
      if (flowId === 'welcome_user' && flow.automation?.id) return flow.smsBody ? 'complete' : 'locked'
      return flow.smsBody ? 'complete' : 'ready'
    }
    if (stepId === 'occurrence') return hasOccurrenceSaved ? 'complete' : flow.smsBody ? 'ready' : 'locked'
    if (stepId === 'segment') return flow.segment ? 'complete' : (flow.smsBody && hasOccurrenceSaved ? 'ready' : 'locked')
    if (stepId === 'trigger') {
      if (flow.automation?.is_active) return 'complete'
      return flow.smsBody && flow.segment ? 'ready' : 'locked'
    }

    return 'locked'
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827]">
      <TopBar />

      <div className="flex min-h-0 flex-1">
        <Header />

        <div className="relative m-4 flex flex-1 flex-col overflow-hidden rounded-2xl border border-[#3e6ff4]/20">
          {/* Subtle notebook-style grid, confined to this panel only */}
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          <main className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6 xl:p-8">
            <div className="w-full">
              <div className="rounded-[28px] border border-[#3e6ff4]/20 bg-[linear-gradient(180deg,rgba(17,24,39,0.94),rgba(17,24,39,0.78))] p-6 shadow-[0_30px_80px_rgba(2,6,23,0.28)] md:p-8 xl:p-10">
                <div className="max-w-3xl text-left">
                  <h1 className="mt-1 text-2xl font-bold text-white md:text-2xl xl:text-3xl">Automation flow</h1>
                 
                </div>

                <div className="mt-8 space-y-6 xl:mt-10">
                  {FLOWS.map((flow) => {
                    const feedback = flowFeedback[flow.id]
                    const currentFlow = flowState[flow.id]
                    const isFlowLocked = Boolean(currentFlow.automation?.is_active)

                    return (
                      <section
                        key={flow.id}
                        className={`rounded-[28px] border bg-[linear-gradient(180deg,rgba(2,6,23,0.26),rgba(15,23,42,0.22))] p-5 shadow-[0_20px_50px_rgba(2,6,23,0.18)] md:p-6 ${isFlowLocked ? 'border-amber-400/30' : 'border-white/10'}`}
                      >
                        <div className="flex flex-col gap-4 text-left sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h2 className="text-xl font-semibold text-white">{flow.heading}</h2>
                            {flow.id === 'welcome_user' && (
                              <p className="mt-2 max-w-xl text-xs leading-6 text-[#CAC4CF]">
                                {isLoadingAutomations
                                  ? 'Checking whether a welcome automation already exists for this account.'
                                  : currentFlow.automation?.is_active
                                    ? 'This welcome automation is active and locked. Deactivate it before editing the sender or message template.'
                                    : currentFlow.automation?.id
                                      ? 'This welcome automation already exists. Click the message step to update its sender or body.'
                                    : 'Create the welcome message template, set the sender, and activate the flow when you are ready to send it after each QR-code signup.'}
                              </p>
                            )}
                          </div>

                          {(flow.id === 'welcome_user' || flow.id === 'recurring') && (
                            <div className="flex flex-col items-start gap-2 sm:items-end">
                              <button
                                type="button"
                                onClick={() =>
                                  void (currentFlow.automation?.is_active ? handleDeactivateFlow(flow.id) : handleActivateFlow(flow.id))
                                }
                                disabled={(
                                  ((!currentFlow.smsBody || !currentFlow.smsSender) && !currentFlow.automation?.is_active)
                                  || (flow.id === 'recurring' && !currentFlow.automation?.is_active && !(currentFlow.automation?.every && currentFlow.automation?.period))
                                  || (flow.id === 'recurring' && !currentFlow.automation?.is_active && !currentFlow.segment)
                                  || activatingFlowId === flow.id
                                )}
                                className={`inline-flex min-w-[124px] items-center justify-center rounded-2xl px-5 py-2.5 text-xs font-semibold transition-opacity ${
                                  currentFlow.automation?.is_active
                                    ? 'bg-amber-500/20 text-amber-100 hover:bg-amber-500/30'
                                    : 'bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
                                }`}
                              >
                                {activatingFlowId === flow.id
                                    ? currentFlow.automation?.is_active
                                      ? 'Deactivating...'
                                      : 'Activating...'
                                    : currentFlow.automation?.is_active
                                      ? 'Deactivate'
                                      : 'Activate'}
                              </button>
                              
                            </div>
                          )}
                        </div>

                        {isFlowLocked && (
                          <div className="mt-4 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                            {flow.id === 'welcome_user'
                              ? 'This automation is locked while active. Deactivate it to edit the sender or message template.'
                              : 'This automation is locked while active. Deactivate it to edit the sender or message template.'}
                          </div>
                        )}

                        <div className="mt-5 overflow-x-auto pb-2">
                          <div className="flex min-w-max items-center py-3">
                            {flow.steps.map((step, index) => (
                              <div key={step.id} className="flex items-center">
                                <FlowStep
                                  label={step.id === 'trigger' && currentFlow.automation?.is_active ? 'Deactivate\nautomation' : step.label}
                                  status={getStepStatus(flow.id, step.id)}
                                  optional={step.optional}
                                  lockedByActivation={isFlowLocked && step.id !== 'trigger'}
                                  onClick={() => handleStepClick(flow.id, step.id)}
                                />
                                {index < flow.steps.length - 1 && <StepConnector />}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[#E5E7EB]">
                            Message: {currentFlow.smsBody ? 'saved' : 'not created'}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[#E5E7EB]">
                            Sender: {currentFlow.smsSender || 'not set'}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[#E5E7EB]">
                            Automation: {currentFlow.automation ? (currentFlow.automation.is_active ? 'active' : 'inactive') : 'not saved'}
                          </span>
                          {flow.id === 'recurring' && (
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[#E5E7EB]">
                              Occurrence: {currentFlow.automation?.every && currentFlow.automation?.period ? `Every ${currentFlow.automation.every} ${formatPeriodLabel(currentFlow.automation.period).toLowerCase()}` : 'not set'}
                            </span>
                          )}
                          {flow.id === 'recurring' && (
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[#E5E7EB]">
                              Segment: {currentFlow.segment?.segment_name || 'not selected'}
                            </span>
                          )}
                        </div>

                        {feedback?.message && (
                          <div
                            className={`mt-4 rounded-2xl border px-4 py-3 text-xs ${
                              feedback.type === 'success'
                                ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'
                                : feedback.type === 'error'
                                  ? 'border-red-400/25 bg-red-400/10 text-red-100'
                                  : 'border-[#3e6ff4]/20 bg-[#3e6ff4]/10 text-[#dbeafe]'
                            }`}
                          >
                            {feedback.message}
                          </div>
                        )}
                      </section>
                    )
                  })}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {modalState?.type === 'sms' && modalFlow && (
        <CreateSmsModal
          onClose={closeModal}
          onCreate={handleCreateAutomation}
          submitting={isSubmittingSms}
          title={modalFlow.smsTitle}
          submitLabel={currentModalFlowState?.automation?.id ? 'Save changes' : 'Create automation'}
          lockedCampaign={null}
          showCampaign={false}
          showAudience={false}
          bodyPlaceholder={modalFlow.smsPlaceholder}
          templateText={modalFlow.smsTemplate}
          initialValues={{
            sender: currentModalFlowState?.smsSender ?? currentModalFlowState?.automation?.sms_sender ?? '',
            body: currentModalFlowState?.smsBody ?? currentModalFlowState?.automation?.sms_body ?? '',
          }}
          personalizationTokens={modalFlow.smsTokens}
        />
      )}

      {modalState?.type === 'segment' && (
        <SegmentSelectionModal
          segments={availableSegments}
          selectedSegmentId={selectedSegmentId}
          onSelect={setSelectedSegmentId}
          onClose={closeModal}
          onSave={handleSaveSegment}
        />
      )}

      {modalState?.type === 'occurrence' && currentModalFlowState && (
        <OccurrenceScheduleModal
          initialEvery={currentModalFlowState.every ?? getAutomationEvery(currentModalFlowState.automation)}
          initialPeriod={currentModalFlowState.period ?? getAutomationPeriod(currentModalFlowState.automation)}
          onClose={closeModal}
          onSave={handleSaveOccurrence}
        />
      )}

      {flowStatusModal && (
        <FlowStatusConfirmModal
          flowId={flowStatusModal.flowId}
          mode={flowStatusModal.mode}
          onClose={closeFlowStatusModal}
          onConfirm={() => {
            const isActivation = flowStatusModal.mode === 'activate'
            const targetFlowId = flowStatusModal.flowId
            closeFlowStatusModal()
            void (isActivation
              ? handleActivateFlow(targetFlowId, { skipConfirmation: true })
              : handleDeactivateFlow(targetFlowId, { skipConfirmation: true }))
          }}
        />
      )}
    </div>
  )
}

export default AutomationPage