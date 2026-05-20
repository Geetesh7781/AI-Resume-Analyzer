import { useState } from 'react'
import ScoreGauge from '../components/ScoreGauge'
import { useSelection } from '../hooks/useSelection'
import { analyzeAPI } from '../services/api'

export default function MatchReport() {
  const { resumes, jds, resumeId, setResumeId, jdId, setJdId, loading } = useSelection()
  const [result, setResult] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  const runMatch = async () => {
    if (!jdId) return
    setAnalyzing(true)
    try {
      const { data } = await analyzeAPI.match({
        resume_id: parseInt(resumeId),
        jd_id: parseInt(jdId),
      })
      setResult(data)
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="animate-slide-up">
      <h2 className="text-3xl font-bold">Resume vs JD Match</h2>
      <p className="mt-2 text-slate-500">Compare your resume against a job description</p>

      <div className="mt-6 flex flex-wrap gap-4">
        <select className="input-field max-w-xs" value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
          {resumes.map((r) => <option key={r.id} value={r.id}>{r.filename}</option>)}
        </select>
        <select className="input-field max-w-xs" value={jdId} onChange={(e) => setJdId(e.target.value)}>
          {jds.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
        <button onClick={runMatch} disabled={!resumeId || !jdId || analyzing} className="btn-primary">
          {analyzing ? 'Matching...' : 'Compare'}
        </button>
      </div>

      {result && (
        <div className="mt-10 space-y-6">
          <div className="card flex flex-col items-center gap-6 md:flex-row">
            <ScoreGauge score={result.match_percentage} label="Match Score" size={140} />
            <p className="flex-1 text-slate-600 dark:text-slate-400">{result.summary}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card">
              <h3 className="font-semibold text-green-600">Matching Skills</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.matching_skills.map((s) => (
                  <span key={s} className="rounded-full bg-green-100 px-3 py-1 text-sm dark:bg-green-950">{s}</span>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="font-semibold text-red-600">Missing Technologies</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.missing_technologies.map((s) => (
                  <span key={s} className="rounded-full bg-red-100 px-3 py-1 text-sm dark:bg-red-950">{s}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold">Recommended Improvements</h3>
            <ul className="mt-3 space-y-2">
              {result.recommended_improvements.map((r, i) => <li key={i}>→ {r}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
