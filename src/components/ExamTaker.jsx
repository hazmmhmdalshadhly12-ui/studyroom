import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import { Clock, AlertTriangle, CheckCircle, ArrowLeft, ArrowRight, Send } from 'lucide-react'

const ExamTaker = () => {
  const { examId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [exam, setExam] = useState(null)
  const [answers, setAnswers] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchExam()
    checkExistingSubmission()
  }, [])

  const fetchExam = async () => {
    const { data } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .single()

    if (data) {
      setExam(data)
    }
    setLoading(false)
  }

  const checkExistingSubmission = async () => {
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .eq('exam_id', examId)
      .eq('student_id', user.id)
      .single()

    if (data) {
      navigate('/dashboard')
    }
  }

  const handleAnswer = (questionIndex, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }))
  }

  const calculateScore = () => {
    let score = 0
    exam.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        score++
      }
    })
    return score
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')

    const score = calculateScore()
    const answersData = exam.questions.map((q, idx) => ({
      question: q.question,
      selectedOption: q.options[answers[idx]],
      correctOption: q.options[q.correctAnswer],
      isCorrect: answers[idx] === q.correctAnswer
    }))

    const { error: submitError } = await supabase
      .from('submissions')
      .insert({
        exam_id: examId,
        student_id: user.id,
        student_name: user.user_metadata?.full_name || user.email,
        student_email: user.email,
        score: score,
        total_questions: exam.questions.length,
        answers_data: answersData
      })

    if (submitError) {
      if (submitError.code === '23505') {
        setError('You have already submitted this exam.')
      } else {
        setError(submitError.message)
      }
      setSubmitting(false)
      return
    }

    navigate('/dashboard')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="card text-center py-16">
        <AlertTriangle className="mx-auto text-gray-300 mb-4" size={48} />
        <h3 className="text-lg font-medium text-gray-900">Exam not found</h3>
      </div>
    )
  }

  const questions = exam.questions || []
  const progress = ((currentQuestion + 1) / questions.length) * 100
  const answeredCount = Object.keys(answers).length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
          <p className="text-gray-500 text-sm">{exam.subject}</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium text-primary-600">
            {answeredCount}/{questions.length} Answered
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
            {questions[currentQuestion]?.question}
          </h3>

          <div className="space-y-3">
            {questions[currentQuestion]?.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(currentQuestion, idx)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                  answers[currentQuestion] === idx
                    ? 'border-primary-500 bg-primary-50 text-primary-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQuestion] === idx
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion] === idx && (
                      <CheckCircle size={14} className="text-white" />
                    )}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Previous
        </button>

        {currentQuestion < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestion((prev) => prev + 1)}
            className="btn-primary flex items-center gap-2"
          >
            Next
            <ArrowRight size={18} />
          </button>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={answeredCount < questions.length}
            className="btn-primary flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            Submit Exam
            <Send size={18} />
          </button>
        )}
      </div>

      {answeredCount < questions.length && currentQuestion === questions.length - 1 && (
        <p className="text-center text-amber-600 text-sm">
          <AlertTriangle size={14} className="inline mr-1" />
          Please answer all questions before submitting
        </p>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Submit Exam?</h3>
            <p className="text-gray-600">
              You have answered {answeredCount} out of {questions.length} questions. 
              Once submitted, you cannot retake this exam.
            </p>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-secondary flex-1"
              >
                Review Answers
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {submitting ? 'Submitting...' : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExamTaker