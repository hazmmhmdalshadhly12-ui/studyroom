import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { ArrowLeft, User, BookOpen, Award, Calendar, Search, ChevronDown, ChevronUp } from 'lucide-react'

const ResultsDashboard = () => {
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState([])
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedSubmission, setExpandedSubmission] = useState(null)

  useEffect(() => {
    if (!sessionStorage.getItem('admin_authenticated')) {
      navigate('/admin')
      return
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [{ data: submissionsData }, { data: examsData }] = await Promise.all([
        supabase.from('submissions').select('*').order('submitted_at', { ascending: false }),
        supabase.from('exams').select('*')
      ])

      setSubmissions(submissionsData || [])
      setExams(examsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getExamTitle = (examId) => {
    return exams.find((e) => e.id === examId)?.title || 'Unknown Exam'
  }

  const filteredSubmissions = submissions.filter((sub) =>
    sub.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.student_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getExamTitle(sub.exam_id).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleExpand = (id) => {
    setExpandedSubmission(expandedSubmission === id ? null : id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Results</h1>
            <p className="text-gray-500 text-sm">{submissions.length} total submissions</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
          placeholder="Search by student name, email, or exam title..."
        />
      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="card text-center py-16">
          <Award className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900">No submissions yet</h3>
          <p className="text-gray-500 mt-1">Student results will appear here once exams are taken.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((sub) => (
            <div key={sub.id} className="card overflow-hidden">
              <div
                onClick={() => toggleExpand(sub.id)}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="text-primary-600" size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{sub.student_name}</h4>
                      <p className="text-sm text-gray-500">{sub.student_email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen size={16} />
                      {getExamTitle(sub.exam_id)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Award size={16} className={
                        (sub.score / sub.total_questions) >= 0.7 ? 'text-emerald-500' :
                        (sub.score / sub.total_questions) >= 0.5 ? 'text-amber-500' : 'text-red-500'
                      } />
                      <span className={`font-bold text-lg ${
                        (sub.score / sub.total_questions) >= 0.7 ? 'text-emerald-600' :
                        (sub.score / sub.total_questions) >= 0.5 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {sub.score}/{sub.total_questions}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar size={14} />
                      {new Date(sub.submitted_at).toLocaleDateString()}
                    </div>
                    {expandedSubmission === sub.id ? (
                      <ChevronUp size={18} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {expandedSubmission === sub.id && (
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                  <h5 className="font-semibold text-gray-900 mb-4">Detailed Answers</h5>
                  {sub.answers_data?.map((answer, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg ${
                        answer.isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <p className="font-medium text-gray-900 mb-2">
                        {idx + 1}. {answer.question}
                      </p>
                      <div className="grid sm:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Student Answer:</span>{' '}
                          <span className={answer.isCorrect ? 'text-emerald-700 font-medium' : 'text-red-700 font-medium'}>
                            {answer.selectedOption || 'Not answered'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Correct Answer:</span>{' '}
                          <span className="text-emerald-700 font-medium">{answer.correctOption}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ResultsDashboard