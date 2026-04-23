import axiosInstance from '../interceptor/axiosInstance'

const BASE = '/api/sms'

// ── SMS ───────────────────────────────────────────────────────────────────────

export async function getSmsList() {
  const res = await axiosInstance.get(`${BASE}/v1/`)
  return res.data
}

export async function createSms({ campaign, contact_list, sender, body, status = 'draft' }) {
  const res = await axiosInstance.post(`${BASE}/v1/`, {
    ...(campaign && { campaign }),
    ...(contact_list && { contact_list }),
    sender,
    body,
    status,
  })
  return res.data
}

export async function updateSms(id, data) {
  const res = await axiosInstance.patch(`${BASE}/v1/${id}/`, data)
  return res.data
}

export async function deleteSms(id) {
  await axiosInstance.delete(`${BASE}/v1/${id}/`)
}

// ── SMS Pages ─────────────────────────────────────────────────────────────────

export async function getSmsPages() {
  const res = await axiosInstance.get(`${BASE}/sms-pages/`)
  return res.data
}

export async function createSmsPage({ sms, source_content, public_slug, content_snapshot, page_status = 'draft' }) {
  const res = await axiosInstance.post(`${BASE}/sms-pages/`, {
    sms,
    ...(source_content && { source_content }),
    public_slug,
    content_snapshot,
    page_status,
  })
  return res.data
}

export async function deleteSmsPage(id) {
  await axiosInstance.delete(`${BASE}/sms-pages/${id}/`)
}

// ── SMS Page Actions ──────────────────────────────────────────────────────────

export async function getSmsPageActions(pageId) {
  const res = await axiosInstance.get(`${BASE}/sms-page-actions/`, {
    params: { page: pageId },
  })
  return res.data
}

export async function createSmsPageAction({
  page,
  action_key,
  label,
  action_type,
  target_url = '',
  target_value = '',
  position = 0,
  metadata = {},
}) {
  const res = await axiosInstance.post(`${BASE}/sms-page-actions/`, {
    page,
    action_key,
    label,
    action_type,
    target_url,
    target_value,
    position,
    metadata,
  })
  return res.data
}

export async function deleteSmsPageAction(id) {
  await axiosInstance.delete(`${BASE}/sms-page-actions/${id}/`)
}

// ── SMS Recipients ────────────────────────────────────────────────────────────

export async function getSmsRecipients(smsId) {
  const res = await axiosInstance.get(`${BASE}/sms-recipients/`, {
    params: { sms: smsId },
  })
  return res.data
}

// ── SMS Events ────────────────────────────────────────────────────────────────

export async function getSmsEvents(smsId) {
  const res = await axiosInstance.get(`${BASE}/sms-events/`, {
    params: { sms: smsId },
  })
  return res.data
}
