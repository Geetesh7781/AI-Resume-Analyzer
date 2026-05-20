import { useState } from 'react'
import ScoreGauge from '../components/ScoreGauge'
import { useSelection } from '../hooks/useSelection'
import { analyzeAPI } from '../services/api'

export default function ATSAnalysis() {
  const { resumes, jds, resumeId, setResumeId, jdId, setJdId, loading } = useSelection()
  const [result, setResult] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  const runAnalysis = async () => {
    setAnalyzing(true)
    try {
      const { data } = await analyzeAPI.atsScore({
        resume_id: parseInt(resumeId),
        jd_id: jdId ? parseInt(jdId) : null,
      })
      setResult(data)
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) return <div>Loading...</div>

  const metrics = result ? [
    { label: 'Skills', value: result.skills_match },
    { label: 'Keywords', value: result.keywords_match },
    { label: 'Experience', value: result.experience_match },
    { label: 'Education', value: result.education_match },
    { label: 'Formatting', value: result.formatting_score },
    { label: 'Projects', value: result.project_relevance },
  ] : []

  return (
    <div className="animate-slide-up">
      <h2 className="text-3xl font-bold">ATS Analysis</h2>
      <p className="mt-2 text-slate-500">Applicant Tracking System compatibility score</p>

      <div className="mt-6 flex flex-wrap gap-4">
        <select className="input-field max-w-xs" value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
          {resumes.map((r) => <option key={r.id} value={r.id}>{r.filename}</option>)}
        </select>
        <select className="input-field max-w-xs" value={jdId} onChange={(e) => setJdId(e.target.value)}>
          <option value="">No JD (general ATS)</option>
          {jds.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
        <button onClick={runAnalysis} disabled={!resumeId || analyzing} className="btn-primary">
          {analyzing ? 'Analyzing...' : 'Run ATS Analysis'}
        </button>
      </div>

      {result && (
        <div className="mt-10">
          <div className="card flex flex-col items-center lg:flex-row lg:justify-around">
            <ScoreGauge score={result.ats_score} label="Overall ATS Score" size={160} />
            <div className="mt-8 grid grid-cols-2 gap-4 lg:mt-0 lg:grid-cols-3">
              {metrics.map((m) => (
                <div key={m.label} className="text-center">
                  <p className="text-xl font-bold">{Math.round(m.value)}%</p>
                  <p className="text-xs text-slate-500">{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="card">
              <h3 className="font-semibold text-green-600">Strengths</h3>
              <ul className="mt-3 space-y-2 text-sm">{result.strengths.map((s, i) => <li key={i}>✓ {s}</li>)}</ul>
            </div>
            <div className="card">
              <h3 className="font-semibold text-red-600">Weaknesses</h3>
              <ul className="mt-3 space-y-2 text-sm">{result.weaknesses.map((s, i) => <li key={i}>✗ {s}</li>)}</ul>
            </div>
            <div className="card">
              <h3 className="font-semibold text-amber-600">Missing Skills</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.missing_skills.map((s) => (
                  <span key={s} className="rounded-full bg-amber-100 px-3 py-1 text-sm dark:bg-amber-950">{s}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="card mt-6">
            <h3 className="font-semibold">Recommendations</h3>
            <ul className="mt-3 space-y-2">{result.recommendations.map((r, i) => <li key={i}>• {r}</li>)}</ul>
          </div>
        </div>
      )}
    </div>
  )
}
