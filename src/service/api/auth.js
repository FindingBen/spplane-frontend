export async function login(email, password) {
  const response = await fetch('http://localhost:8000/api/accounts/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.detail || 'Login failed')
  }

  return data
}

export async function register(email, password, user_type) {
  const response = await fetch('http://localhost:8000/api/accounts/register/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, user_type }),
  })

  const data = await response.json()

  if (!response.ok) {
    const firstError = Object.values(data)[0]
    throw new Error(Array.isArray(firstError) ? firstError[0] : firstError || 'Registration failed')
  }

  return data
}