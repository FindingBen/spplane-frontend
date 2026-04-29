import axios from 'axios'
import axiosInstance from '../interceptor/axiosInstance'

const BASE = '/api/sms'
const API_URL = 'http://localhost:8000'

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

export async function getSms(id) {
  const res = await axiosInstance.get(`${BASE}/v1/${id}/`)
  return res.data
}

export async function estimateSmsCost(id) {
  const res = await axiosInstance.get(`${BASE}/v1/${id}/estimate-cost/`)
  return res.data
}

export async function sendSms(id) {
  const res = await axiosInstance.post(`${BASE}/v1/${id}/send/`)
  return res.data
}

// ── SMS Pages ─────────────────────────────────────────────────────────────────

export async function getSmsPages() {
  const res = await axiosInstance.get(`${BASE}/sms-pages/`)
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

// ── Public SMS Page ───────────────────────────────────────────────────────────

export async function getSmsPublicPage(slug, token) {
  const params = token ? { t: token } : {}
  const res = await axios.get(`${API_URL}/api/sms/public/page/${slug}/`, { params })
  return res.data
}
