import { useEffect, useState } from 'react'
import Header from '../components/Header'
import TopBar from '../components/TopBar'
import CreateCampaignModal from '../modals/CreateCampaignModal'
import CreateSmsModal from '../modals/CreateSmsModal'
import { createAutomation, getAutomations, updateAutomation } from '../service/api/automation'
import { createCampaign } from '../service/api/campaign'
import { getContactLists } from '../service/api/segments'

const FALLBACK_SEGMENTS = ['Test list', 'Other list', 'VIP Customers', 'New Subscribers']

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
    id: 'weekly_offer',
    heading: 'Weekly offers',
    automationTitle: 'Weekly offers SMS',
    automationDescription: 'Send the weekly offer SMS to the selected audience.',
    campaignDefaults: {
      name: 'Weekly offers campaign',
      description: 'Draft campaign for weekly offers automation.',
    },
    smsTitle: 'Create weekly offer SMS',
    smsPlaceholder: 'This week only: discover the latest offer here {{page_link}}',
    smsTemplate: 'This week only: discover the latest offer here {{page_link}}',
    smsTokens: [
      { label: 'First Name', token: '{{first_name}}' },
      { label: 'Page Link', token: '{{page_link}}' },
    ],
    steps: [
      { id: 'campaign', label: 'create campaign' },
      { id: 'sms', label: 'Craft curated\nmessage to\nweekly offers' },
      { id: 'content', label: 'Create personalized\ncontent', optional: true },
      { id: 'segment', label: 'Select segment\nlist' },
      { id: 'trigger', label: 'Trigger the\nautomation' },
    ],
  },
]

const INITIAL_FLOW_STATE = {
  welcome_user: { automation: null, campaign: null, smsBody: '', smsSender: '', segment: null },
  weekly_offer: { automation: null, campaign: null, smsBody: '', smsSender: '', segment: null },
}

const getFlowConfig = (flowId) => FLOWS.find((flow) => flow.id === flowId)

const getAutomationSmsBody = (automation) => (typeof automation?.sms_body === 'string' ? automation.sms_body : '')

const getAutomationSmsSender = (automation) => (typeof automation?.sms_sender === 'string' ? automation.sms_sender : '')

const mergeAutomationRecord = (currentAutomation, nextAutomation) => ({
  ...currentAutomation,
  ...nextAutomation,
  sms_body: nextAutomation?.sms_body ?? currentAutomation?.sms_body ?? '',
  sms_sender: nextAutomation?.sms_sender ?? currentAutomation?.sms_sender ?? '',
  is_active: nextAutomation?.is_active ?? currentAutomation?.is_active ?? false,
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
        className={`relative flex h-[88px] min-w-[160px] items-center justify-center rounded-2xl border px-4 text-center text-sm font-semibold leading-6 transition-all sm:min-w-[188px] ${toneClasses[status]} ${lockedByActivation ? 'cursor-not-allowed border-amber-400/25 bg-amber-500/10 text-amber-50' : ''}`}
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
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#93c5fd]">Weekly offers</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Select segment list</h2>
            <p className="mt-2 text-sm leading-6 text-[#CAC4CF]">
              Choose the segment that should receive the weekly offer automation.
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
            <span className="text-sm font-medium text-[#E5E7EB]">Segment list</span>
            <select
              value={selectedSegmentId}
              onChange={(event) => onSelect(event.target.value)}
              className="mt-4 w-full rounded-2xl border border-[#3e6ff4]/25 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#60a5fa]"
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
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-[#E5E7EB] transition-colors hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Save segment
          </button>
        </div>
      </div>
    </div>
  )
}

function FlowStatusConfirmModal({ mode, onClose, onConfirm }) {
  const isDeactivate = mode === 'deactivate'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/75 px-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-lg rounded-[28px] border border-[#3e6ff4]/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(29,26,34,0.95))] p-6 shadow-[0_30px_100px_rgba(2,6,23,0.55)] md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#93c5fd]">New customer signup</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{isDeactivate ? 'Deactivate this flow?' : 'Activate this flow?'}</h2>
            <p className="mt-2 text-sm leading-6 text-[#CAC4CF]">
              {isDeactivate
                ? 'Once deactivated, new customers who sign up through the QR code will stop receiving this welcome SMS.'
                : 'Once activated, every customer who signs up through the QR code will automatically receive this welcome SMS.'}
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
              <p className="text-sm font-medium text-white">{isDeactivate ? 'This turns the automation off immediately.' : 'This turns on the automation immediately.'}</p>
              <p className="mt-1 text-sm leading-6 text-[#CAC4CF]">
                {isDeactivate
                  ? 'The welcome automation will remain saved, but new QR signups will not receive the message until you activate it again.'
                  : 'You can only activate it after saving the welcome message template, and future QR signups will use the message currently saved in this automation.'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-[#E5E7EB] transition-colors hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 ${
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
  const [isSubmittingCampaign, setIsSubmittingCampaign] = useState(false)
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

  const persistAutomation = async (flowId, { smsBody, smsSender, isActive } = {}) => {
    const flowConfig = getFlowConfig(flowId)
    const currentFlow = flowState[flowId]
    const resolvedSmsBody = (smsBody ?? currentFlow.smsBody ?? currentFlow.automation?.sms_body ?? '').trim()
    const resolvedSmsSender = (smsSender ?? currentFlow.smsSender ?? currentFlow.automation?.sms_sender ?? '').trim()

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
      ...(typeof isActive === 'boolean' ? { is_active: isActive } : {}),
    }

    if (currentFlow.automation?.id) {
      return updateAutomation(currentFlow.automation.id, payload)
    }

    return createAutomation({
      ...payload,
      is_active: typeof isActive === 'boolean' ? isActive : false,
    })
  }

  const handleCreateCampaign = async (form) => {
    const flowId = modalState?.flowId
    if (!flowId) return

    setIsSubmittingCampaign(true)

    try {
      const created = await createCampaign({
        name: form.name,
        description: form.description,
        content: form.content !== '' ? Number(form.content) : null,
        status: 'draft',
      })

      setFlowState((prev) => ({
        ...prev,
        [flowId]: {
          ...prev[flowId],
          campaign: created,
          smsBody: '',
          smsSender: '',
          segment: null,
        },
      }))
      setFeedback(flowId, 'success', 'Campaign created. Continue to the message template step.')
      closeModal()
    } catch (error) {
      setFeedback(
        flowId,
        'error',
        error?.response?.data?.detail || error?.response?.data?.error || 'Unable to create the campaign right now.',
      )
    } finally {
      setIsSubmittingCampaign(false)
    }
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
        flowId === 'weekly_offer'
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

  const handleSaveSegment = () => {
    const flowId = modalState?.flowId
    if (!flowId) return

    const selectedSegment = availableSegments.find((segment) => String(segment.id) === String(selectedSegmentId))

    if (!selectedSegment) {
      setFeedback(flowId, 'error', 'Select a segment list before continuing.')
      return
    }

    setFlowState((prev) => ({
      ...prev,
      [flowId]: {
        ...prev[flowId],
        segment: selectedSegment,
      },
    }))
    setFeedback(flowId, 'success', `${selectedSegment.segment_name} selected for weekly offers.`)
    closeModal()
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

    if (isActive && flowId === 'weekly_offer' && !flow.segment) {
      setFeedback(flowId, 'error', 'Select a segment list before activating the weekly offer automation.')
      return
    }

    if (flowId === 'welcome_user' && !skipConfirmation) {
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
            : 'Weekly offer automation activated.'
          : flowId === 'welcome_user'
            ? 'New customer signup flow deactivated. New QR signups will no longer receive this welcome SMS.'
            : 'Weekly offer automation deactivated.',
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
          : 'This automation is active and locked. Deactivate it before editing the campaign, sender, or message template.',
      )
      return
    }

    if (stepId === 'campaign') {
      openModal('campaign', flowId)
      return
    }

    if (stepId === 'sms') {
      if (flowId === 'welcome_user' && isLoadingAutomations) {
        setFeedback(flowId, 'info', 'Checking whether a welcome automation already exists...')
        return
      }

      if (flowId !== 'welcome_user' && !currentFlow.campaign) {
        setFeedback(flowId, 'error', 'Create the campaign first before saving the message template.')
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
        setFeedback(flowId, 'error', 'Create the weekly message template before selecting the segment list.')
        return
      }

      openModal('segment', flowId)
      return
    }

    if (stepId === 'trigger') {
      void (currentFlow.automation?.is_active ? handleDeactivateFlow(flowId) : handleActivateFlow(flowId))
    }
  }

  const getStepStatus = (flowId, stepId) => {
    const flow = flowState[flowId]

    if (stepId === 'content') return 'optional'
    if (stepId === 'campaign') return flow.campaign ? 'complete' : 'ready'
    if (stepId === 'sms') {
      if (flowId === 'welcome_user' && isLoadingAutomations) return 'locked'
      if (flowId === 'welcome_user' && flow.automation?.id) return flow.smsBody ? 'complete' : 'locked'
      return flow.smsBody ? 'complete' : flowId === 'welcome_user' || flow.campaign ? 'ready' : 'locked'
    }
    if (stepId === 'segment') return flow.segment ? 'complete' : flow.smsBody ? 'ready' : 'locked'
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

        <div className="m-4 flex flex-1 flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827]">
          <main className="flex-1 overflow-y-auto p-4 md:p-6 xl:p-8">
            <div className="w-full">
              <div className="rounded-[28px] border border-[#3e6ff4]/20 bg-[linear-gradient(180deg,rgba(17,24,39,0.94),rgba(17,24,39,0.78))] p-6 shadow-[0_30px_80px_rgba(2,6,23,0.28)] md:p-8 xl:p-10">
                <div className="max-w-3xl text-left">
                  <h1 className="mt-1 text-3xl font-bold text-white md:text-3xl xl:text-4xl">Automation flow</h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-[#CAC4CF] md:text-base">
                    Build each automation step by step. The welcome flow now starts from the message template itself, while weekly offers can still reuse campaign and segment setup.
                  </p>
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
                            <h2 className="text-2xl font-semibold text-white">{flow.heading}</h2>
                            {flow.id === 'welcome_user' && (
                              <p className="mt-2 max-w-xl text-sm leading-6 text-[#CAC4CF]">
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

                          {flow.id === 'welcome_user' && (
                            <div className="flex flex-col items-start gap-2 sm:items-end">
                              <button
                                type="button"
                                onClick={() =>
                                  void (currentFlow.automation?.is_active ? handleDeactivateFlow(flow.id) : handleActivateFlow(flow.id))
                                }
                                disabled={((!currentFlow.smsBody || !currentFlow.smsSender) && !currentFlow.automation?.is_active) || activatingFlowId === flow.id}
                                className={`inline-flex min-w-[124px] items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold transition-opacity ${
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
                          <div className="mt-4 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                            {flow.id === 'welcome_user'
                              ? 'This automation is locked while active. Deactivate it to edit the sender or message template.'
                              : 'This automation is locked while active. Use the trigger step to deactivate it before editing.'}
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
                          {flow.steps.some((step) => step.id === 'campaign') && (
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[#E5E7EB]">
                              Campaign: {currentFlow.campaign?.name || 'not created'}
                            </span>
                          )}
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[#E5E7EB]">
                            Message: {currentFlow.smsBody ? 'saved' : 'not created'}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[#E5E7EB]">
                            Sender: {currentFlow.smsSender || 'not set'}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[#E5E7EB]">
                            Automation: {currentFlow.automation ? (currentFlow.automation.is_active ? 'active' : 'inactive') : 'not saved'}
                          </span>
                          {flow.id === 'weekly_offer' && (
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[#E5E7EB]">
                              Segment: {currentFlow.segment?.segment_name || 'not selected'}
                            </span>
                          )}
                        </div>

                        {feedback?.message && (
                          <div
                            className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
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

      {modalState?.type === 'campaign' && modalFlow && (
        <CreateCampaignModal
          onClose={closeModal}
          onCreate={handleCreateCampaign}
          submitting={isSubmittingCampaign}
          title={`${modalFlow.automationTitle} campaign`}
          submitLabel="Save campaign"
          initialValues={modalFlow.campaignDefaults}
        />
      )}

      {modalState?.type === 'sms' && modalFlow && (
        <CreateSmsModal
          onClose={closeModal}
          onCreate={handleCreateAutomation}
          submitting={isSubmittingSms}
          title={modalFlow.smsTitle}
          submitLabel={currentModalFlowState?.automation?.id ? 'Save changes' : 'Create automation'}
          lockedCampaign={modalState.flowId === 'welcome_user' ? null : currentModalFlowState?.campaign}
          showCampaign={modalState.flowId !== 'welcome_user'}
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

      {flowStatusModal?.flowId === 'welcome_user' && (
        <FlowStatusConfirmModal
          mode={flowStatusModal.mode}
          onClose={closeFlowStatusModal}
          onConfirm={() => {
            const isActivation = flowStatusModal.mode === 'activate'
            closeFlowStatusModal()
            void (isActivation
              ? handleActivateFlow('welcome_user', { skipConfirmation: true })
              : handleDeactivateFlow('welcome_user', { skipConfirmation: true }))
          }}
        />
      )}
    </div>
  )
}

export default AutomationPage