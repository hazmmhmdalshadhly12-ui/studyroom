import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import { BookOpen, CheckCircle, Clock, ArrowRight, AlertCircle } from 'lucide-react'

const StudentDashboard = () => {
  const { user } = useAuth()
  const [exams, setExams] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: examsData } = await supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false })

      const { data: submissionsData } = await supabase
        .from('submissions')
        .select('*')
        .eq('student_id', user.id)

      setExams(examsData || [])
      setSubmissions(submissionsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasSubmitted = (examId) => {
    return submissions.some((sub) => sub.exam_id === examId)
  }

  const getSubmission = (examId) => {
    return submissions.find((sub) => sub.exam_id === examId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.user_metadata?.full_name || 'Student'}!</p>
        </div>
        <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg text-sm font-medium">
          {exams.length} Available Exams
        </div>
      </div>

      {exams.length === 0 ? (
        <div className="card text-center py-16">
          <AlertCircle className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900">No exams available yet</h3>
          <p className="text-gray-500 mt-1">Check back later for new exams from your teacher.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => {
            const submitted = hasSubmitted(exam.id)
            const submission = getSubmission(exam.id)

            return (
              <div key={exam.id} className={`card transition-all duration-200 ${submitted ? 'bg-gray-50 border-gray-200' : 'hover:shadow-md'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <BookOpen className="text-primary-600" size={24} />
                  </div>
                  {submitted && (
                    <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-semibold">
                      <CheckCircle size={14} />
                      Completed
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-lg text-gray-900 mb-1">{exam.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{exam.subject}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {exam.questions?.length || 0} Questions
                  </span>
                  {submitted && (
                    <span className="font-semibold text-emerald-600">
                      Score: {submission?.score}/{submission?.total_questions}
                    </span>
                  )}
                </div>

                {submitted ? (
                  <div className="w-full py-2.5 px-4 bg-gray-100 text-gray-500 rounded-lg text-center text-sm font-medium cursor-not-allowed">
                    Already Submitted
                  </div>
                ) : (
                  <Link
                    to={`/exam/${exam.id}`}
                    className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
                  >
                    Start Exam
                    <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default StudentDashboard