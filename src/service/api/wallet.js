import axiosInstance from '../interceptor/axiosInstance'

export async function getWallet() {
	const response = await axiosInstance.get('/api/accounts/wallet/')
	return response.data
}
