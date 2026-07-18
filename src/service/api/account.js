import axiosInstance from '../interceptor/axiosInstance'

export async function getStatistics() {
  const response = await axiosInstance.get('/api/accounts/me/statistic-numbers/')
  return response.data.data
}
