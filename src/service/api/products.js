import axios from 'axios'
import axiosInstance from '../interceptor/axiosInstance'

const PRODUCTS_BASE = '/api/shopify/products'

export async function getShopifyProducts({ search = '', first = 50 } = {}) {
  const response = await axiosInstance.get(`${PRODUCTS_BASE}/`, {
    params: {
      ...(search ? { search } : {}),
      ...(first ? { first } : {}),
    },
  })

  return response.data
}

export async function importShopifyProducts() {
  const response = await axiosInstance.post(`${PRODUCTS_BASE}/import/`, {})
  return response.data
}