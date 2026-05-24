import { useEffect, useState } from 'react'
import Header from '../components/Header'
import TopBar from '../components/TopBar'
import CreateCampaignModal from '../modals/CreateCampaignModal'
import CreateSmsModal from '../modals/CreateSmsModal'
import { createCampaign } from '../service/api/campaign'
import { createSms } from '../service/api/sms'
import { getContactLists } from '../service/api/segments'

const FALLBACK_SEGMENTS = ['Test list', 'Other list', 'VIP Customers', 'New Subscribers']

const FLOWS = [
  {
    id: 'welcome_user',
    heading: 'New customer signup',
    automationTitle: 'Welcome new user SMS',
    campaignDefaults: {
      name: 'Welcome new user campaign',
      description: 'Draft campaign for new customer signup automation.',
    },
    smsTitle: 'Create welcome SMS draft',
    smsPlaceholder: 'Welcome {{first_name}}! Thanks for joining us. Tap here: {{page_link}}',
    smsTemplate: 'Welcome {{first_name}}! Thanks for joining us. Tap here: {{page_link}}',
    steps: [
      { id: 'campaign', label: 'create campaign' },
      { id: 'sms', label: 'Craft curated\nmessage to\nwelcome new user' },
      { id: 'content', label: 'Create personalized\ncontent', optional: true },
      { id: 'trigger', label: 'Trigger the\nautomation' },
    ],
  },
  {
    id: 'weekly_offer',
    heading: 'Weekly offers',
    automationTitle: 'Weekly offers SMS',
    campaignDefaults: {
      name: 'Weekly offers campaign',
      description: 'Draft campaign for weekly offers automation.',
    },
    smsTitle: 'Create weekly offer SMS draft',
    smsPlaceholder: 'This week only: discover the latest offer here {{page_link}}',
    smsTemplate: 'This week only: discover the latest offer here {{page_link}}',
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
  welcome_user: { campaign: null, sms: null, segment: null, triggered: false },
  weekly_offer: { campaign: null, sms: null, segment: null, triggered: false },
}

const getFlowConfig = (flowId) => FLOWS.find((flow) => flow.id === flowId)

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

function FlowStep({ label, status, onClick, optional = false }) {
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
        className={`relative flex h-[88px] min-w-[160px] items-center justify-center rounded-2xl border px-4 text-center text-sm font-semibold leading-6 transition-all sm:min-w-[188px] ${toneClasses[status]}`}
      >
        <span className="whitespace-pre-line">{label}</span>
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

const AutomationPage = () => {
  const [flowState, setFlowState] = useState(INITIAL_FLOW_STATE)
  const [flowFeedback, setFlowFeedback] = useState({})
  const [modalState, setModalState] = useState(null)
  const [isSubmittingCampaign, setIsSubmittingCampaign] = useState(false)
  const [isSubmittingSms, setIsSubmittingSms] = useState(false)
  const [selectedSegmentId, setSelectedSegmentId] = useState('')
  const [contactLists, setContactLists] = useState([])

  const availableSegments = contactLists.length
    ? contactLists
    : FALLBACK_SEGMENTS.map((segment, index) => ({ id: `fallback-${index}`, segment_name: segment }))

  const modalFlow = modalState ? getFlowConfig(modalState.flowId) : null
  const currentModalFlowState = modalState ? flowState[modalState.flowId] : null

  useEffect(() => {
    let ignore = false

    getContactLists()
      .then((data) => {
        if (ignore) return
        const items = Array.isArray(data) ? data : data?.results ?? []
        setContactLists(items)
      })
      .catch(() => {
        if (!ignore) setContactLists([])
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
          campaign: created,
          sms: null,
          segment: null,
          triggered: false,
        },
      }))
      setFeedback(flowId, 'success', 'Campaign created. Continue to the SMS step.')
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

  const handleCreateSmsDraft = async ({ campaign, contact_list, sender, body }) => {
    const flowId = modalState?.flowId
    if (!flowId) return

    setIsSubmittingSms(true)

    try {
      const created = await createSms({
        campaign,
        ...(contact_list ? { contact_list } : {}),
        sender,
        body,
        status: 'draft',
      })

      setFlowState((prev) => ({
        ...prev,
        [flowId]: {
          ...prev[flowId],
          sms: created,
          triggered: false,
        },
      }))
      setFeedback(
        flowId,
        'success',
        flowId === 'weekly_offer'
          ? 'SMS draft created. Choose the segment list next.'
          : 'SMS draft created. You can now trigger the automation.',
      )
      closeModal()
    } catch (error) {
      setFeedback(
        flowId,
        'error',
        error?.response?.data?.detail || error?.response?.data?.error || 'Unable to create the SMS draft right now.',
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
        triggered: false,
      },
    }))
    setFeedback(flowId, 'success', `${selectedSegment.segment_name} selected for weekly offers.`)
    closeModal()
  }

  const handleTriggerFlow = (flowId) => {
    const flow = flowState[flowId]

    if (!flow.campaign) {
      setFeedback(flowId, 'error', 'Create a campaign first.')
      return
    }

    if (!flow.sms) {
      setFeedback(flowId, 'error', 'Create the SMS draft before triggering the automation.')
      return
    }

    if (flowId === 'weekly_offer' && !flow.segment) {
      setFeedback(flowId, 'error', 'Select a segment list before triggering the weekly offer automation.')
      return
    }

    setFlowState((prev) => ({
      ...prev,
      [flowId]: {
        ...prev[flowId],
        triggered: true,
      },
    }))
    setFeedback(
      flowId,
      'success',
      flowId === 'welcome_user'
        ? 'Automation triggered on the frontend. It will use this campaign and SMS for future new users.'
        : 'Automation triggered on the frontend. It will use this campaign, SMS, and segment for weekly offers.',
    )
  }

  const handleStepClick = (flowId, stepId) => {
    if (stepId === 'campaign') {
      openModal('campaign', flowId)
      return
    }

    if (stepId === 'sms') {
      if (!flowState[flowId].campaign) {
        setFeedback(flowId, 'error', 'Create the campaign first so the SMS can attach to it.')
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
      if (!flowState[flowId].sms) {
        setFeedback(flowId, 'error', 'Create the weekly SMS draft before selecting the segment list.')
        return
      }

      openModal('segment', flowId)
      return
    }

    if (stepId === 'trigger') {
      handleTriggerFlow(flowId)
    }
  }

  const getStepStatus = (flowId, stepId) => {
    const flow = flowState[flowId]

    if (stepId === 'content') return 'optional'
    if (stepId === 'campaign') return flow.campaign ? 'complete' : 'ready'
    if (stepId === 'sms') return flow.sms ? 'complete' : flow.campaign ? 'ready' : 'locked'
    if (stepId === 'segment') return flow.segment ? 'complete' : flow.sms ? 'ready' : 'locked'
    if (stepId === 'trigger') {
      if (flow.triggered) return 'complete'
      if (flowId === 'weekly_offer') return flow.campaign && flow.sms && flow.segment ? 'ready' : 'locked'
      return flow.campaign && flow.sms ? 'ready' : 'locked'
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
                    Build each automation step by step. Campaign and SMS creation reuse the same modals already used across the app, while content remains optional for now.
                  </p>
                </div>

                <div className="mt-8 space-y-6 xl:mt-10">
                  {FLOWS.map((flow) => {
                    const feedback = flowFeedback[flow.id]
                    const currentFlow = flowState[flow.id]

                    return (
                      <section
                        key={flow.id}
                        className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.26),rgba(15,23,42,0.22))] p-5 shadow-[0_20px_50px_rgba(2,6,23,0.18)] md:p-6"
                      >
                        <div className="text-left">
                          <h2 className="text-2xl font-semibold text-white">{flow.heading}</h2>
                        </div>

                        <div className="mt-5 overflow-x-auto pb-2">
                          <div className="flex min-w-max items-center py-3">
                            {flow.steps.map((step, index) => (
                              <div key={step.id} className="flex items-center">
                                <FlowStep
                                  label={step.label}
                                  status={getStepStatus(flow.id, step.id)}
                                  optional={step.optional}
                                  onClick={() => handleStepClick(flow.id, step.id)}
                                />
                                {index < flow.steps.length - 1 && <StepConnector />}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[#E5E7EB]">
                            Campaign: {currentFlow.campaign?.name || 'not created'}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[#E5E7EB]">
                            SMS: {currentFlow.sms?.sender || 'not created'}
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

      {modalState?.type === 'sms' && modalFlow && currentModalFlowState?.campaign && (
        <CreateSmsModal
          onClose={closeModal}
          onCreate={handleCreateSmsDraft}
          submitting={isSubmittingSms}
          title={modalFlow.smsTitle}
          submitLabel="Save SMS draft"
          lockedCampaign={currentModalFlowState.campaign}
          showAudience={false}
          bodyPlaceholder={modalFlow.smsPlaceholder}
          templateText={modalFlow.smsTemplate}
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
    </div>
  )
}

export default AutomationPage