import axiosInstance from '../interceptor/axiosInstance'

// GET /api/content/mine/
// Returns: [{ id, title, ... }]
export async function getContents() {
  const response = await axiosInstance.get('/api/content/mine/')
  return response.data
}

// GET /api/campaigns/
// Returns: [{ id, user, name, description, content, status, created_at, updated_at }]
export async function getCampaigns() {
  const response = await axiosInstance.get('/api/campaign/v1/')
  return response.data
}

// POST /api/campaigns/
// Body: { name, description, content, status }
// Returns: created campaign object
export async function createCampaign({ name, description, content, status }) {
  const response = await axiosInstance.post('/api/campaign/v1/', {
    name,
    description,
    ...(content !== null && content !== '' && { content }),
    status,
  })
  return response.data
}

// DELETE /api/campaigns/{id}/
export async function deleteCampaign(id) {
  await axiosInstance.delete(`/api/campaign/v1/${id}/`)
}

export async function getCampaignAnalytics(){
  const response = await axiosInstance.get('/api/campaign/v1/get_campaign_analytics/')
  return response.data
}