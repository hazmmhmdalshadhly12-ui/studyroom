import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Login from './components/Login'
import Signup from './components/Signup'
import StudentDashboard from './components/StudentDashboard'
import ExamTaker from './components/ExamTaker'
import AdminGate from './components/AdminGate'
import AdminDashboard from './components/AdminDashboard'
import ExamBuilder from './components/ExamBuilder'
import ResultsDashboard from './components/ResultsDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/exam/:examId" element={<ExamTaker />} />
          </Route>

          <Route path="/admin" element={<AdminGate />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/create-exam" element={<ExamBuilder />} />
          <Route path="/admin/results" element={<ResultsDashboard />} />

          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login" />} />
        </Routes>
      </main>
    </div>
  )
}

export default App