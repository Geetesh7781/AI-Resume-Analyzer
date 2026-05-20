import { useState } from 'react'
import { useSelection } from '../hooks/useSelection'
import { generateAPI } from '../services/api'

const CATEGORIES = [
  { key: 'hr_questions', label: 'HR Questions', color: 'text-blue-600' },
  { key: 'technical_questions', label: 'Technical Questions', color: 'text-purple-600' },
  { key: 'resume_based_questions', label: 'Resume-Based', color: 'text-green-600' },
  { key: 'project_based_questions', label: 'Project-Based', color: 'text-amber-600' },
]

export default function InterviewQuestions() {
  const { resumeId, jdId, loading } = useSelection()
  const [result, setResult] = useState(null)
  const [generating, setGenerating] = useState(false)

  const generate = async () => {
    setGenerating(true)
    try {
      const { data } = await generateAPI.interviewQuestions({
        resume_id: parseInt(resumeId),
        jd_id: jdId ? parseInt(jdId) : null,
        count_per_category: 5,
      })
      setResult(data)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="animate-slide-up">
      <h2 className="text-3xl font-bold">Interview Questions</h2>
      <p className="mt-2 text-slate-500">AI-generated questions based on your resume & JD</p>

      <button onClick={generate} disabled={!resumeId || generating} className="btn-primary mt-6">
        {generating ? 'Generating...' : 'Generate Interview Questions'}
      </button>

      {result && (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {CATEGORIES.map((cat) => (
            <div key={cat.key} className="card">
              <h3 className={`font-semibold ${cat.color}`}>{cat.label}</h3>
              <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm">
                {(result[cat.key] || []).map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
