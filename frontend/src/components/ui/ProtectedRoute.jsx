import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Loader from './Loader'
export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth()
  if (loading) return <Loader />
  return admin ? children : <Navigate to="/admin/login" replace />
}
