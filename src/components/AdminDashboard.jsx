import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FilePlus, BarChart3, Users, BookOpen, ArrowRight } from 'lucide-react'

const AdminDashboard = () => {
  const navigate = useNavigate()

  useEffect(() => {
    if (!sessionStorage.getItem('admin_authenticated')) {
      navigate('/admin')
    }
  }, [])

  const cards = [
    {
      title: 'Create Exam',
      description: 'Build a new interactive exam with questions and answers',
      icon: FilePlus,
      href: '/admin/create-exam',
      color: 'bg-primary-50 text-primary-600',
      btnColor: 'btn-primary'
    },
    {
      title: 'Student Results',
      description: 'View all student submissions and performance data',
      icon: BarChart3,
      href: '/admin/results',
      color: 'bg-emerald-50 text-emerald-600',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all'
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage exams and monitor student performance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {cards.map((card) => (
          <div key={card.title} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon size={24} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
            <p className="text-gray-500 mb-6">{card.description}</p>
            <Link
              to={card.href}
              className={`${card.btnColor} inline-flex items-center gap-2`}
            >
              Go to {card.title}
              <ArrowRight size={16} />
            </Link>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card text-center">
          <Users className="mx-auto text-primary-400 mb-3" size={32} />
          <p className="text-sm text-gray-500">Total Students</p>
          <p className="text-2xl font-bold text-gray-900">Active</p>
        </div>
        <div className="card text-center">
          <BookOpen className="mx-auto text-primary-400 mb-3" size={32} />
          <p className="text-sm text-gray-500">Exams Created</p>
          <p className="text-2xl font-bold text-gray-900">Manage</p>
        </div>
        <div className="card text-center">
          <BarChart3 className="mx-auto text-primary-400 mb-3" size={32} />
          <p className="text-sm text-gray-500">Submissions</p>
          <p className="text-2xl font-bold text-gray-900">Track</p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard