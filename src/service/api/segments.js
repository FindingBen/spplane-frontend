import axiosInstance from '../interceptor/axiosInstance'
import { tokenService } from '../token/tokenService'

const API_URL       = import.meta.env.VITE_API_URL
const LISTS_BASE    = '/api/contacts/v1'
const CONTACTS_BASE = '/api/contacts/audience/v1'
const BASE = '/api/contacts/'

// ── Contact Lists (Segments) ──────────────────────────────────────────────────

export async function getContactLists() {
  const response = await axiosInstance.get(`${LISTS_BASE}/`)
  return response.data
}

export async function createContactList({ segment_name }) {
  const response = await axiosInstance.post(`${LISTS_BASE}/`, { segment_name })
  return response.data
}

export async function updateContactList(id, { segment_name }) {
  const response = await axiosInstance.patch(`${LISTS_BASE}/${id}/`, { segment_name })
  return response.data
}

export async function deleteContactList(id) {
  await axiosInstance.delete(`${LISTS_BASE}/${id}/`)
}

// ── Contacts (global — Customers page) ───────────────────────────────────────

export async function getContacts() {
  const response = await axiosInstance.get(`${CONTACTS_BASE}/`)
  return response.data
}

export async function createContact({ phone, first_name, last_name, status, source }) {
  const response = await axiosInstance.post(`${CONTACTS_BASE}/`, {
    phone,
    first_name,
    last_name,
    status,
    source,
  })
  return response.data
}

export async function updateContact(id, data) {
  const response = await axiosInstance.patch(`${CONTACTS_BASE}/${id}/`, data)
  return response.data
}

export async function deleteContact(id) {
  await axiosInstance.delete(`${CONTACTS_BASE}/${id}/`)
}

export async function customerSignupWithQrCode(payload){
   const res = await axiosInstance.post(`${BASE}sms-optin/v1/`, payload) 
   return res.data
}

export async function optOutCustomer(token){
   const res = await axiosInstance.get(`${BASE}sms-opt-out/v1/unsubscribe?t=${token}`) 
   return res.data
}

// ── Shopify Import ──────────────────────────────────────────────────────────

export async function importShopifyCustomers() {
  const response = await axiosInstance.post('/api/shopify/customers/import/', {})
  return response.data
}

// ── Segment Memberships ───────────────────────────────────────────────────────

export async function addContactToSegment(segmentId, contact) {
  const response = await axiosInstance.post(`${CONTACTS_BASE}/`, {
    phone: contact.phone,
    first_name: contact.first_name,
    last_name: contact.last_name,
    status: contact.status,
    source: contact.source,
    segment_ids: [segmentId],
  })
  return response.data
}

export async function removeContactFromSegment(segmentId, contactId) {
  const token = tokenService.getAccess()
  await fetch(`${API_URL}/api/contacts/v1/${segmentId}/members/${contactId}/`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
}
