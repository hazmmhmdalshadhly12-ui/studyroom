import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GraduationCap, LogOut, User, Shield } from 'lucide-react'

const Navbar = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-primary-700 font-bold text-xl">
            <GraduationCap size={28} />
            <span>StudyRoom</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 text-gray-600 text-sm">
                  <User size={16} />
                  <span>{user.user_metadata?.full_name || user.email}</span>
                </div>
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  <Shield size={16} />
                  Admin
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm">
                  Sign In
                </Link>
                <Link to="/signup" className="btn-primary text-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar