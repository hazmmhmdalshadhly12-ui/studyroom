import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Plus, Trash2, Save, ArrowLeft, GripVertical, CheckCircle } from 'lucide-react'

const ExamBuilder = () => {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correctAnswer: 0 }
  ])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sessionStorage.getItem('admin_authenticated')) {
      navigate('/admin')
    }
  }, [])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: '', options: ['', '', '', ''], correctAnswer: 0 }
    ])
  }

  const removeQuestion = (index) => {
    if (questions.length === 1) return
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index, field, value) => {
    const updated = [...questions]
    updated[index][field] = value
    setQuestions(updated)
  }

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions]
    updated[qIndex].options[oIndex] = value
    setQuestions(updated)
  }

  const setCorrectAnswer = (qIndex, oIndex) => {
    const updated = [...questions]
    updated[qIndex].correctAnswer = oIndex
    setQuestions(updated)
  }

  const validate = () => {
    if (!title.trim()) return 'Exam title is required'
    if (!subject.trim()) return 'Subject is required'

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim()) return `Question ${i + 1} is empty`
      for (let j = 0; j < questions[i].options.length; j++) {
        if (!questions[i].options[j].trim()) return `Option ${j + 1} in Question ${i + 1} is empty`
      }
    }
    return null
  }

  const handleSave = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError('')

    const { error: saveError } = await supabase
      .from('exams')
      .insert({
        title,
        subject,
        questions: questions.map((q) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer
        }))
      })

    if (saveError) {
      setError(saveError.message)
      setSaving(false)
      return
    }

    navigate('/admin/dashboard')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create New Exam</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="card space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Exam Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="e.g., Midterm Mathematics Exam"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input-field"
              placeholder="e.g., Mathematics"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="card space-y-4">
            <div className="flex items-center gap-3">
              <GripVertical className="text-gray-300" size={20} />
              <span className="text-sm font-semibold text-gray-500">Question {qIndex + 1}</span>
              {questions.length > 1 && (
                <button
                  onClick={() => removeQuestion(qIndex)}
                  className="ml-auto text-red-400 hover:text-red-600 p-1"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <input
              type="text"
              value={q.question}
              onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
              className="input-field"
              placeholder="Enter your question here..."
            />

            <div className="grid md:grid-cols-2 gap-3">
              {q.options.map((option, oIndex) => (
                <div key={oIndex} className="flex items-center gap-2">
                  <button
                    onClick={() => setCorrectAnswer(qIndex, oIndex)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      q.correctAnswer === oIndex
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {q.correctAnswer === oIndex && <CheckCircle size={14} className="text-white" />}
                  </button>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    className={`input-field text-sm ${
                      q.correctAnswer === oIndex ? 'border-emerald-300 bg-emerald-50' : ''
                    }`}
                    placeholder={`Option ${oIndex + 1}`}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">Click the circle to mark the correct answer</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={addQuestion}
          className="btn-secondary flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Add Question
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Exam'}
        </button>
      </div>
    </div>
  )
}

export default ExamBuilder