import axiosInstance from '../interceptor/axiosInstance'

const BASE = '/api/contacts/v1'
const CONTACTS_BASE = '/api/contacts/audience/v1'

// ── Contact Lists ─────────────────────────────────────────────────────────────

export async function getContactLists() {
  const response = await axiosInstance.get(`${BASE}/`)
  return response.data
}

export async function createContactList({ segment_name }) {
  const response = await axiosInstance.post(`${BASE}/`, { segment_name })
  return response.data
}

export async function updateContactList(id, { segment_name }) {
  const response = await axiosInstance.patch(`${BASE}/${id}/`, { segment_name })
  return response.data
}

export async function deleteContactList(id) {
  await axiosInstance.delete(`${BASE}/${id}/`)
}

// ── Contacts ──────────────────────────────────────────────────────────────────

export async function getContacts(contactListId) {
  const response = await axiosInstance.get(`${CONTACTS_BASE}/`, {
    params: { contact_list: contactListId },
  })
  return response.data
}

export async function createContact({ contact_list, phone, first_name, last_name, status, source }) {
  const response = await axiosInstance.post(`${CONTACTS_BASE}/`, {
    contact_list,
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
