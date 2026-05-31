import axiosInstance from '../interceptor/axiosInstance'

const BASE = '/api/automations/v1/'

export async function getAutomations(){
    const response = await axiosInstance.get(BASE)
    return response.data
}

export async function createAutomation(payload){
    const response = await axiosInstance.post(BASE, payload)
    return response.data
}

export async function updateAutomation(id, payload){
    const response = await axiosInstance.put(`${BASE}${id}/`, payload)
    return response.data
}