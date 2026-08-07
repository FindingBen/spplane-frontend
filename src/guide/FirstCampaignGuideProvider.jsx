import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const STORAGE_KEY = 'spplane:first-campaign-guide'

const GUIDE_STEPS = [
  {
    id: 'nav-content-builder',
    title: 'Create your landing page content',
    description: 'Start in Content. Use the Create entry in the sidebar so we can build the page that your SMS will link to.',
    targetId: 'nav-content-builder',
    action: 'nav:content-builder',
  },
  {
    id: 'content-add-text',
    title: 'Add a simple text block',
    description: 'Add a simple text block first so the page has a clear message before you attach the CTA.',
    compactDescription: 'Click the highlighted text block.',
    route: '/content/builder',
    targetId: 'content-add-text',
    action: 'content:text-added',
  },
  {
    id: 'content-edit-text',
    title: 'Fill in the text block values',
    description: 'Use the editor on the right to change the text block values before you move on. This is where the user writes the message shown on the landing page.',
    compactDescription: 'Edit the text, then click outside to continue.',
    route: '/content/builder',
    targetId: 'content-edit-text',
    action: 'content:text-edited',
  },
  {
    id: 'content-add-cta',
    title: 'Add the CTA block',
    description: 'Now add the CTA block so your landing page has a button the SMS can drive traffic to.',
    compactDescription: 'Click the highlighted CTA block.',
    route: '/content/builder',
    targetId: 'content-add-cta',
    action: 'content:cta-added',
  },
  {
    id: 'content-edit-cta',
    title: 'Set the CTA values',
    description: 'Before publishing, update the CTA boxes on the right. Change the button text, link, or other values so the landing page points users to the right destination.',
    compactDescription: 'Update the CTA values, then click outside to continue.',
    route: '/content/builder',
    targetId: 'content-edit-cta',
    action: 'content:cta-edited',
  },
  {
    id: 'content-publish',
    title: 'Publish the content',
    description: 'Publish the content when the page is ready. The guide will take you straight into campaign creation after this.',
    compactDescription: 'Publish when the page is ready.',
    route: '/content/builder',
    targetId: 'content-publish',
    action: 'content:published',
  },
  {
    id: 'nav-campaigns',
    title: 'Open Campaigns',
    description: 'Next, create the campaign that will own this SMS send and connect it to the content you just published.',
    targetId: 'nav-campaigns',
    action: 'nav:campaigns',
  },
  {
    id: 'campaign-open',
    title: 'Start a campaign draft',
    description: 'Open the campaign modal. We will use it to attach the published content to a new campaign draft.',
    route: '/campaigns',
    targetId: 'campaign-new',
    action: 'campaign:open',
  },
  {
    id: 'campaign-form',
    title: 'Link the content to the campaign',
    description: 'Fill in the campaign details, choose the content from the dropdown, and save the draft to continue.',
    disableFocus: true,
    route: '/campaigns',
    targetId: 'campaign-form',
    action: 'campaign:created',
  },
  {
    id: 'nav-customers',
    title: 'Open Customers',
    description: 'Now create the contact who will receive the first guided SMS send.',
    targetId: 'nav-customers',
    action: 'nav:customers',
  },
  {
    id: 'customer-open',
    title: 'Create a customer',
    description: 'Open the customer form so you can add the recipient details needed for the segment.',
    route: '/customers',
    targetId: 'customer-create',
    action: 'customer:open',
  },
  {
    id: 'customer-form',
    title: 'Add the first recipient',
    description: 'Enter the customer details and create the contact. Use a valid SMS-ready phone number so you can keep testing the full flow.',
    disableFocus: true,
    route: '/customers',
    targetId: 'customer-form',
    action: 'customer:created',
  },
  {
    id: 'nav-audience',
    title: 'Open Audience',
    description: 'Next we will create the audience segment that groups the recipient for the SMS send.',
    targetId: 'nav-audience',
    action: 'nav:audience',
  },
  {
    id: 'audience-open-segment',
    title: 'Create a new segment',
    description: 'Open the segment modal so we can create the list that this SMS will target.',
    route: '/audience',
    targetId: 'audience-new-segment',
    action: 'audience:open-segment',
  },
  {
    id: 'audience-segment-form',
    title: 'Name the audience segment',
    description: 'Create the segment here. After that, the guide will move you into the segment detail view to add your customer.',
    disableFocus: true,
    route: '/audience',
    targetId: 'audience-segment-form',
    action: 'audience:segment-created',
  },
  {
    id: 'audience-add-customers',
    title: 'Add customers to the segment',
    description: 'Open the add-customers flow for this segment so you can include the recipient you just created.',
    route: '/audience',
    targetId: 'audience-add-customers',
    action: 'audience:open-add-customers',
  },
  {
    id: 'audience-add-customers-form',
    title: 'Pick the recipient for the segment',
    description: 'Select the customer from the list and add them to the segment. That audience will be used in the SMS create step.',
    disableFocus: true,
    route: '/audience',
    targetId: 'audience-add-customers-form',
    action: 'audience:customers-added',
  },
  {
    id: 'nav-sms',
    title: 'Open SMS',
    description: 'Everything is ready. Open SMS so you can connect the campaign and audience segment and create the message.',
    targetId: 'nav-sms',
    action: 'nav:sms',
  },
  {
    id: 'sms-open',
    title: 'Create a new SMS',
    description: 'Open the SMS modal. We will use it to pick the campaign, the audience segment, and write the message body.',
    route: '/sms',
    targetId: 'sms-new',
    action: 'sms:open',
  },
  {
    id: 'sms-form',
    title: 'Build the SMS message',
    description: 'Choose the campaign and segment, write your own message or use a template, personalize it with tokens, add the landing-page link, choose a sender number, then create the SMS.',
    disableFocus: true,
    route: '/sms',
    targetId: 'sms-form',
    action: 'sms:created',
  },
  {
    id: 'sms-send-button',
    title: 'Review before sending',
    description: 'Open the send review for the SMS you just created. The next screen shows the estimated sending cost before you queue the send.',
    fixedPopover: 'top-right',
    route: '/sms',
    targetId: ({ createdSmsId }) => (createdSmsId ? `sms-send-${createdSmsId}` : null),
    action: 'sms:open-send-review',
  },
  {
    id: 'sms-send-confirm',
    title: 'Check cost and send',
    description: 'Review the estimated cost, confirm the numbers look right, and hit Send SMS to finish the first full campaign flow.',
    route: /^\/sms\/[^/]+\/sending$/,
    targetId: 'sms-send-confirm',
    action: 'sms:sent',
  },
]

const GUIDE_TARGET_QUERY = 'data-guide-id'
const GUIDE_ACTIVE_ATTR = 'data-guide-active'

const EMPTY_RUNTIME = {
  createdSmsId: null,
}

const FirstCampaignGuideContext = createContext(null)

const readStoredGuide = () => {
  if (typeof window === 'undefined') {
    return {
      active: false,
      completed: false,
      currentStepId: null,
      runtime: EMPTY_RUNTIME,
    }
  }

  try {
    const rawValue = window.sessionStorage.getItem(STORAGE_KEY)
    if (!rawValue) {
      return {
        active: false,
        completed: false,
        currentStepId: null,
        runtime: EMPTY_RUNTIME,
      }
    }

    const parsed = JSON.parse(rawValue)
    return {
      active: Boolean(parsed?.active),
      completed: Boolean(parsed?.completed),
      currentStepId: typeof parsed?.currentStepId === 'string' ? parsed.currentStepId : null,
      runtime: {
        ...EMPTY_RUNTIME,
        ...(parsed?.runtime ?? {}),
      },
    }
  } catch {
    return {
      active: false,
      completed: false,
      currentStepId: null,
      runtime: EMPTY_RUNTIME,
    }
  }
}

const persistGuide = (snapshot) => {
  if (typeof window === 'undefined') return

  if (!snapshot.active && !snapshot.completed) {
    window.sessionStorage.removeItem(STORAGE_KEY)
    return
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
}

const matchRoute = (pathname, route) => {
  if (!route) return true
  if (Array.isArray(route)) return route.some((entry) => matchRoute(pathname, entry))
  if (route instanceof RegExp) return route.test(pathname)
  return pathname === route
}

const resolveTargetId = (targetId, runtime) => {
  if (!targetId) return null
  if (typeof targetId === 'function') return targetId(runtime)
  return targetId
}

const getRuntimePatch = (action, payload) => {
  if (action === 'sms:created' && payload?.sms?.id) {
    return { createdSmsId: payload.sms.id }
  }

  if (action === 'guide:restart') {
    return EMPTY_RUNTIME
  }

  return null
}

const getStepById = (stepId) => GUIDE_STEPS.find((step) => step.id === stepId) ?? null

const getNextStep = (stepId) => {
  const stepIndex = GUIDE_STEPS.findIndex((step) => step.id === stepId)
  if (stepIndex < 0) return null
  return GUIDE_STEPS[stepIndex + 1] ?? null
}

const clampRect = (rect, margin = 10) => ({
  top: Math.max(8, rect.top - margin),
  left: Math.max(8, rect.left - margin),
  right: Math.min(window.innerWidth - 8, rect.right + margin),
  bottom: Math.min(window.innerHeight - 8, rect.bottom + margin),
  width: Math.min(window.innerWidth - 16, rect.width + margin * 2),
  height: Math.min(window.innerHeight - 16, rect.height + margin * 2),
})

function GuideIntroModal({ active, completed, currentStep, onClose, onConfirm, onRestart, onCancelGuide }) {
  const confirmLabel = active ? 'Continue guide' : completed ? 'Start again' : 'Yes, guide me'

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#050816]/78" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-[#3e6ff4]/30 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.18),_rgba(17,24,39,0.94)_38%,_rgba(13,18,30,0.98)_100%)] p-7 text-left shadow-[0_35px_80px_rgba(2,6,23,0.55)]">
        <div className="mb-5 inline-flex rounded-full border border-[#60a5fa]/30 bg-[#3e6ff4]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#93c5fd]">
          First Campaign Guide
        </div>

        <h2 className="text-xl font-semibold text-white">Create your first full SMS send flow</h2>
        <p className="mt-3 text-xs leading-6 text-[#d1d5db]">
          This walkthrough takes you through the whole path: content creation, campaign setup, customer creation,
          audience segment setup, SMS creation, cost review, and the final send action.
        </p>

        {currentStep && active && (
          <div className="mt-5 rounded-2xl border border-[#60a5fa]/20 bg-[#0f172a]/70 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#93c5fd]/80">Continue from</p>
            <p className="mt-2 text-sm font-semibold text-white">{currentStep.title}</p>
            <p className="mt-1 text-xs text-[#cbd5e1]">{currentStep.description}</p>
          </div>
        )}

        {completed && !active && (
          <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-100">
            You already completed the walkthrough once. You can restart it any time.
          </div>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] px-4 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            {confirmLabel}
          </button>
          {(active || completed) && (
            <button
              type="button"
              onClick={onRestart}
              className="inline-flex items-center justify-center rounded-xl border border-[#60a5fa]/25 bg-[#111827]/70 px-4 py-2.5 text-xs font-medium text-[#dbeafe] transition-colors hover:border-[#60a5fa]/45 hover:text-white"
            >
              Restart from the beginning
            </button>
          )}
          {active && (
            <button
              type="button"
              onClick={onCancelGuide}
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-[#d1d5db] transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              Stop guide
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-xs font-medium text-[#9ca3af] transition-colors hover:border-white/20 hover:text-white"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}

function GuideCompletionToast({ onDismiss }) {
  return (
    <div className="fixed bottom-5 right-5 z-[92] w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-emerald-500/30 bg-[linear-gradient(145deg,rgba(5,46,22,0.94),rgba(6,78,59,0.94))] p-4 shadow-[0_20px_40px_rgba(2,6,23,0.45)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/15 text-emerald-200">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-xs font-semibold text-white">First campaign guide complete</p>
          <p className="mt-1 text-xs leading-5 text-emerald-50/85">
            You have completed the full content-to-send flow. You can restart the guide from the dashboard any time.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg p-1 text-emerald-100/75 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Dismiss guide completion message"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function GuideOverlay({ active, currentStep, currentTargetId, currentStepIndex, onSkip }) {
  const [targetRect, setTargetRect] = useState(null)
  const [targetElement, setTargetElement] = useState(null)
  const activeTargetRef = useRef(null)
  const isContentBuilderStep = currentStep?.id?.startsWith('content-')
  const isPassiveStep = currentStep?.disableFocus === true
  const usesFixedTopRightPopover = currentStep?.fixedPopover === 'top-right'
  const stepDescription = isContentBuilderStep
    ? currentStep?.compactDescription ?? currentStep?.description
    : currentStep?.description

  const refreshTarget = useCallback(() => {
    if (!active || isPassiveStep || !currentTargetId) {
      setTargetElement(null)
      setTargetRect(null)
      return
    }

    const nextTarget = document.querySelector(`[${GUIDE_TARGET_QUERY}="${currentTargetId}"]`)
    if (!nextTarget) {
      setTargetElement(null)
      setTargetRect(null)
      return
    }

    const nextRect = nextTarget.getBoundingClientRect()
    if (nextRect.width === 0 && nextRect.height === 0) {
      setTargetElement(nextTarget)
      setTargetRect(null)
      return
    }

    setTargetElement(nextTarget)
    setTargetRect(clampRect(nextRect))
  }, [active, currentTargetId, isPassiveStep])

  useEffect(() => {
    refreshTarget()
  }, [refreshTarget])

  useEffect(() => {
    if (!active || isPassiveStep || !currentTargetId) return undefined

    let frameId = window.requestAnimationFrame(refreshTarget)
    const mutationObserver = new MutationObserver(() => {
      window.cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(refreshTarget)
    })

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    })

    return () => {
      mutationObserver.disconnect()
      window.cancelAnimationFrame(frameId)
    }
  }, [active, currentTargetId, isPassiveStep, refreshTarget])

  useEffect(() => {
    if (!active || isPassiveStep || !currentTargetId) return undefined

    const handleWindowUpdate = () => refreshTarget()
    const resizeObserver = new ResizeObserver(handleWindowUpdate)

    if (targetElement) {
      resizeObserver.observe(targetElement)
      targetElement.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })
    }

    window.addEventListener('resize', handleWindowUpdate)
    window.addEventListener('scroll', handleWindowUpdate, true)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleWindowUpdate)
      window.removeEventListener('scroll', handleWindowUpdate, true)
    }
  }, [active, currentTargetId, isPassiveStep, refreshTarget, targetElement])

  useEffect(() => {
    if (activeTargetRef.current && activeTargetRef.current !== targetElement) {
      activeTargetRef.current.removeAttribute(GUIDE_ACTIVE_ATTR)
    }

    if (!targetElement) {
      activeTargetRef.current = null
      return undefined
    }

    targetElement.setAttribute(GUIDE_ACTIVE_ATTR, 'true')
    activeTargetRef.current = targetElement

    return () => {
      targetElement.removeAttribute(GUIDE_ACTIVE_ATTR)
      if (activeTargetRef.current === targetElement) {
        activeTargetRef.current = null
      }
    }
  }, [targetElement])

  const popoverStyle = useMemo(() => {
    if (usesFixedTopRightPopover) {
      const width = Math.min(320, window.innerWidth - 32)

      return {
        width,
        top: 20,
        left: Math.max(16, window.innerWidth - width - 20),
        placement: 'floating',
      }
    }

    if (isPassiveStep) {
      const width = Math.min(320, window.innerWidth - 32)

      return {
        width,
        top: 20,
        left: Math.max(16, window.innerWidth - width - 20),
        placement: 'top',
      }
    }

    if (!targetRect) return null

    if (window.innerWidth < 640) {
      return { placement: 'bottom-sheet', width: window.innerWidth, bottom: 0, left: 0 }
    }

    const width = Math.min(isContentBuilderStep ? 272 : 360, window.innerWidth - 32)
    const spacing = isContentBuilderStep ? 14 : 18
    const estimatedHeight = isContentBuilderStep ? 132 : 220
    const canFitBelow = targetRect.bottom + spacing + estimatedHeight <= window.innerHeight
    const canFitAbove = targetRect.top - spacing - estimatedHeight >= 16

    let top = targetRect.bottom + spacing
    const targetCenterX = (targetRect.left + targetRect.right) / 2
    const targetIsOnLeft = targetCenterX < window.innerWidth / 2
    let left = targetIsOnLeft
      ? Math.min(window.innerWidth - width - 16, targetRect.right + spacing)
      : Math.min(window.innerWidth - width - 16, Math.max(16, targetRect.left))
    let placement = 'bottom'

    if (!canFitBelow && canFitAbove) {
      placement = 'top'
      top = Math.max(16, targetRect.top - spacing - estimatedHeight)
    }

    if (canFitBelow || canFitAbove) {
      return { width, top, left, placement }
    }

    const rightAligned = targetRect.right + spacing + width <= window.innerWidth - 16
    placement = rightAligned ? 'right' : 'left'
    top = Math.min(window.innerHeight - estimatedHeight - 16, Math.max(16, targetRect.top))
    left = rightAligned
      ? Math.min(window.innerWidth - width - 16, targetRect.right + spacing)
      : Math.max(16, targetRect.left - spacing - width)

    return { width, top, left, placement }
  }, [isContentBuilderStep, isPassiveStep, targetRect, usesFixedTopRightPopover])

  const spotlightStyle = useMemo(() => {
    if (!targetRect) return null

    if (isContentBuilderStep || isPassiveStep) {
      return null
    }

    const padding = isContentBuilderStep ? 22 : 14
    const top = Math.max(6, targetRect.top - padding)
    const left = Math.max(6, targetRect.left - padding)
    const right = Math.min(window.innerWidth - 6, targetRect.right + padding)
    const bottom = Math.min(window.innerHeight - 6, targetRect.bottom + padding)

    return {
      top,
      left,
      width: right - left,
      height: bottom - top,
      border: isContentBuilderStep
        ? '1px solid rgba(191, 219, 254, 0.62)'
        : '1px solid rgba(96, 165, 250, 0.38)',
      background: isContentBuilderStep
        ? 'radial-gradient(circle at center, rgba(255,255,255,0.18), rgba(191,219,254,0.14) 42%, rgba(96,165,250,0.08) 74%, rgba(96,165,250,0.03) 100%)'
        : 'radial-gradient(circle at center, rgba(191,219,254,0.10), rgba(96,165,250,0.06) 48%, rgba(96,165,250,0.02) 100%)',
      boxShadow: isContentBuilderStep
        ? '0 0 0 1px rgba(255,255,255,0.12) inset, 0 0 38px rgba(191,219,254,0.32), 0 0 84px rgba(96,165,250,0.24)'
        : '0 0 24px rgba(96,165,250,0.18)',
    }
  }, [isContentBuilderStep, isPassiveStep, targetRect])

  if (!active || !currentStep || !popoverStyle || (!isPassiveStep && !targetRect)) {
    return null
  }

  const arrowBaseClasses = 'absolute h-4 w-4 rotate-45 rounded-[2px] border border-[#60a5fa]/25 bg-[#0b1221]'
  const arrowStyle = (popoverStyle.placement === 'floating' || popoverStyle.placement === 'bottom-sheet')
    ? null
    : {
        bottom: popoverStyle.placement === 'top' ? '-8px' : undefined,
        top: popoverStyle.placement === 'bottom' ? '-8px' : undefined,
        left: popoverStyle.placement === 'right' ? '-8px' : popoverStyle.placement === 'left' ? undefined : '22px',
        right: popoverStyle.placement === 'left' ? '-8px' : undefined,
      }

  return (
    <>
      {!isPassiveStep && (
        <div className="pointer-events-auto fixed inset-0 z-[60]">
          <div className="absolute left-0 right-0 top-0" style={{ height: targetRect.top, background: isContentBuilderStep ? 'transparent' : 'rgba(3, 7, 18, 0.72)' }} />
          <div className="absolute left-0" style={{ top: targetRect.top, width: targetRect.left, height: targetRect.height, background: isContentBuilderStep ? 'transparent' : 'rgba(3, 7, 18, 0.72)' }} />
          <div className="absolute right-0" style={{ top: targetRect.top, width: Math.max(0, window.innerWidth - targetRect.right), height: targetRect.height, background: isContentBuilderStep ? 'transparent' : 'rgba(3, 7, 18, 0.72)' }} />
          <div className="absolute bottom-0 left-0 right-0" style={{ top: targetRect.bottom, background: isContentBuilderStep ? 'transparent' : 'rgba(3, 7, 18, 0.72)' }} />
        </div>
      )}

      {spotlightStyle && (
        <div
          className="pointer-events-none fixed z-[71] rounded-[30px]"
          style={spotlightStyle}
        />
      )}

      <div
        className={`pointer-events-auto fixed z-[80] text-left ${
          popoverStyle.placement === 'bottom-sheet'
            ? 'rounded-t-[24px] border-t border-x border-[#60a5fa]/25 bg-[#0b1221]/96 p-5 shadow-[0_-22px_55px_rgba(2,6,23,0.55)]'
            : isContentBuilderStep
            ? 'rounded-[18px] border border-[#3e6ff4]/20 bg-[#0b1221]/88 p-3.5 shadow-[0_14px_32px_rgba(2,6,23,0.28)]'
            : 'rounded-[24px] border border-[#60a5fa]/25 bg-[#0b1221]/96 p-5 shadow-[0_22px_55px_rgba(2,6,23,0.55)]'
        }`}
        style={
          popoverStyle.placement === 'bottom-sheet'
            ? { bottom: 0, left: 0, right: 0 }
            : { top: popoverStyle.top, left: popoverStyle.left, width: popoverStyle.width }
        }
      >
        {arrowStyle && <span className={`${arrowBaseClasses}`} style={arrowStyle} />}

        <div className="flex items-center justify-between gap-3">
          <div className={`inline-flex rounded-full border bg-[#3e6ff4]/10 font-semibold uppercase tracking-[0.18em] text-[#93c5fd] ${
            isContentBuilderStep
              ? 'border-[#3e6ff4]/15 px-2 py-0.5 text-[10px]'
              : 'border-[#60a5fa]/20 px-2.5 py-1 text-[11px]'
          }`}>
            Step {currentStepIndex + 1} of {GUIDE_STEPS.length}
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="rounded-lg px-2 py-1 text-xs font-medium text-[#9ca3af] transition-colors hover:bg-white/5 hover:text-white"
          >
            Skip guide
          </button>
        </div>

        <h3 className={`font-semibold text-white ${isContentBuilderStep ? 'mt-2 text-xs' : 'mt-4 text-base'}`}>{currentStep.title}</h3>
        <p className={`text-[#d1d5db] ${isContentBuilderStep ? 'mt-1 text-xs leading-5' : 'mt-2 text-xs leading-6'}`}>{stepDescription}</p>
        {!isContentBuilderStep && (
          <p className="mt-3 text-xs leading-5 text-[#93c5fd]/80">
            Only the highlighted area stays interactive during this walkthrough.
          </p>
        )}
      </div>
    </>
  )
}

export function FirstCampaignGuideProvider({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const storedGuide = useMemo(() => readStoredGuide(), [])
  const [active, setActive] = useState(storedGuide.active)
  const [completed, setCompleted] = useState(storedGuide.completed)
  const [currentStepId, setCurrentStepId] = useState(storedGuide.currentStepId)
  const [runtime, setRuntime] = useState(storedGuide.runtime)
  const [introOpen, setIntroOpen] = useState(false)
  const [completionVisible, setCompletionVisible] = useState(storedGuide.completed)

  const currentStep = useMemo(() => getStepById(currentStepId), [currentStepId])
  const currentStepIndex = useMemo(
    () => GUIDE_STEPS.findIndex((step) => step.id === currentStepId),
    [currentStepId],
  )
  const currentTargetId = useMemo(
    () => resolveTargetId(currentStep?.targetId, runtime),
    [currentStep?.targetId, runtime],
  )

  useEffect(() => {
    persistGuide({ active, completed, currentStepId, runtime })
  }, [active, completed, currentStepId, runtime])

  const openIntro = useCallback(() => {
    setIntroOpen(true)
  }, [])

  const closeIntro = useCallback(() => {
    setIntroOpen(false)
  }, [])

  const cancelGuide = useCallback(() => {
    setActive(false)
    setCurrentStepId(null)
    setRuntime(EMPTY_RUNTIME)
    setCompleted(false)
    setCompletionVisible(false)
    setIntroOpen(false)
  }, [])

  const finishGuide = useCallback(() => {
    setActive(false)
    setCurrentStepId(null)
    setCompleted(true)
    setCompletionVisible(true)
  }, [])

  const advanceToNextStep = useCallback(
    (stepId) => {
      const nextStep = getNextStep(stepId)

      if (!nextStep) {
        finishGuide()
        return
      }

      setCurrentStepId(nextStep.id)
    },
    [finishGuide],
  )

  const startGuide = useCallback(() => {
    setRuntime(EMPTY_RUNTIME)
    setCompleted(false)
    setCompletionVisible(false)
    setActive(true)
    setCurrentStepId(GUIDE_STEPS[0]?.id ?? null)
    setIntroOpen(false)
  }, [])

  const focusCurrentStep = useCallback(() => {
    if (!currentStep?.route || currentStep.route instanceof RegExp) return
    if (location.pathname === currentStep.route) return
    navigate(currentStep.route)
  }, [currentStep?.route, location.pathname, navigate])

  const handleIntroConfirm = useCallback(() => {
    if (!active || !currentStepId) {
      startGuide()
      return
    }

    setIntroOpen(false)
    focusCurrentStep()
  }, [active, currentStepId, focusCurrentStep, startGuide])

  const restartGuide = useCallback(() => {
    const resetRuntime = getRuntimePatch('guide:restart')
    setRuntime(resetRuntime ?? EMPTY_RUNTIME)
    setCompleted(false)
    setCompletionVisible(false)
    setActive(true)
    setCurrentStepId(GUIDE_STEPS[0]?.id ?? null)
    setIntroOpen(false)
    navigate('/dashboard')
  }, [navigate])

  const trackAction = useCallback(
    (action, payload = {}) => {
      const runtimePatch = getRuntimePatch(action, payload)
      if (runtimePatch) {
        setRuntime((previousRuntime) => ({ ...previousRuntime, ...runtimePatch }))
      }

      if (!active || !currentStep || currentStep.action !== action) {
        return
      }

      advanceToNextStep(currentStep.id)
    },
    [active, advanceToNextStep, currentStep],
  )

  const value = useMemo(
    () => ({
      active,
      completed,
      currentStep,
      currentStepId,
      currentTargetId,
      openIntro,
      closeIntro,
      startGuide,
      restartGuide,
      cancelGuide,
      trackAction,
      isCurrentTarget: (targetId) => currentTargetId === targetId,
    }),
    [active, closeIntro, completed, currentStep, currentStepId, currentTargetId, openIntro, restartGuide, startGuide, cancelGuide, trackAction],
  )

  return (
    <FirstCampaignGuideContext.Provider value={value}>
      <style>{`
        [${GUIDE_ACTIVE_ATTR}="true"] {
          position: relative !important;
          z-index: 70 !important;
          box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.95), 0 0 0 10px rgba(59, 130, 246, 0.18), 0 18px 45px rgba(2, 6, 23, 0.45);
          border-radius: 18px;
          animation: first-campaign-guide-pulse 1.75s ease-in-out infinite;
        }

        @keyframes first-campaign-guide-pulse {
          0%, 100% {
            box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.95), 0 0 0 10px rgba(59, 130, 246, 0.18), 0 18px 45px rgba(2, 6, 23, 0.45);
          }

          50% {
            box-shadow: 0 0 0 2px rgba(125, 211, 252, 1), 0 0 0 14px rgba(59, 130, 246, 0.12), 0 20px 50px rgba(2, 6, 23, 0.55);
          }
        }
      `}</style>

      {children}

      <GuideOverlay
        active={active && matchRoute(location.pathname, currentStep?.route)}
        currentStep={currentStep}
        currentTargetId={currentTargetId}
        currentStepIndex={Math.max(currentStepIndex, 0)}
        onSkip={cancelGuide}
      />

      {introOpen && (
        <GuideIntroModal
          active={active}
          completed={completed}
          currentStep={currentStep}
          onClose={closeIntro}
          onConfirm={handleIntroConfirm}
          onRestart={restartGuide}
          onCancelGuide={cancelGuide}
        />
      )}

      {completionVisible && <GuideCompletionToast onDismiss={() => setCompletionVisible(false)} />}
    </FirstCampaignGuideContext.Provider>
  )
}

export function useFirstCampaignGuide() {
  const context = useContext(FirstCampaignGuideContext)

  if (!context) {
    throw new Error('useFirstCampaignGuide must be used within FirstCampaignGuideProvider')
  }

  return context
}