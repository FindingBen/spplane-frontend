import { Navigate } from 'react-router-dom'
import { tokenService } from '../service/token/tokenService'

export default function ProtectedRoute({ children }) {
  const isAuthenticated = !!tokenService.getAccess()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
