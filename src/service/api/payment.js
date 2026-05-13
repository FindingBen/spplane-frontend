import axiosInstance from '../interceptor/axiosInstance'

export async function getBillingStatus() {
	const response = await axiosInstance.get('/api/payment/v1/billing-status/')
	return response.data
}

export async function getSmsPackages() {
	const response = await axiosInstance.get('/api/payment/v1/sms-packages/')
	return response.data
}

export async function createOneTimeCharge({ packageId, description, test = false }) {
	const response = await axiosInstance.post('/api/payment/v1/one-time-charges/', {
		package_id: packageId,
		...(description ? { description } : {}),
		test,
	})

	return response.data
}

export function getOneTimeChargeRedirectUrl(payload) {
	if (!payload || typeof payload !== 'object') return ''

	const candidates = [
		payload.confirmation_url,
		payload.confirmationUrl,
		payload.redirect_url,
		payload.redirectUrl,
		payload.approval_url,
		payload.approvalUrl,
		payload.url,
		payload.charge?.confirmation_url,
		payload.charge?.confirmationUrl,
		payload.app_purchase_one_time?.confirmation_url,
		payload.app_purchase_one_time?.confirmationUrl,
	]

	return candidates.find((value) => typeof value === 'string' && value.trim()) ?? ''
}
