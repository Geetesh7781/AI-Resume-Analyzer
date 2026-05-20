import { useEffect, useState } from 'react'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend } from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'
import { dashboardAPI } from '../services/api'

ChartJS.register(ArcElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend)

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardAPI.stats().then((res) => setStats(res.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center">Loading dashboard...</div>
  if (!stats) return <div>Failed to load stats</div>

  const lineData = {
    labels: stats.ats_history.map((h) => new Date(h.date).toLocaleDateString()),
    datasets: [{
      label: 'ATS Score',
      data: stats.ats_history.map((h) => h.score),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.1)',
      tension: 0.4,
      fill: true,
    }],
  }

  const doughnutData = {
    labels: ['ATS', 'Remaining'],
    datasets: [{
      data: [stats.latest_ats_score || 0, 100 - (stats.latest_ats_score || 0)],
      backgroundColor: ['#6366f1', '#e2e8f0'],
      borderWidth: 0,
    }],
  }

  const cards = [
    { label: 'Resumes', value: stats.total_resumes, icon: '📄' },
    { label: 'Job Descriptions', value: stats.total_jds, icon: '💼' },
    { label: 'Analyses', value: stats.total_analyses, icon: '📈' },
    { label: 'Latest ATS', value: stats.latest_ats_score ? `${Math.round(stats.latest_ats_score)}%` : 'N/A', icon: '🎯' },
  ]

  return (
    <div className="animate-slide-up">
      <h2 className="text-3xl font-bold">Dashboard</h2>
      <p className="mt-2 text-slate-500">Your resume analysis overview</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card flex items-center gap-4">
            <span className="text-3xl">{c.icon}</span>
            <div>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-sm text-slate-500">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-4 font-semibold">ATS Score History</h3>
          {stats.ats_history.length ? (
            <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } }} />
          ) : (
            <p className="text-slate-500">Run ATS analysis to see history</p>
          )}
        </div>
        <div className="card flex flex-col items-center">
          <h3 className="mb-4 font-semibold">Latest ATS Score</h3>
          {stats.latest_ats_score ? (
            <div className="h-48 w-48">
              <Doughnut data={doughnutData} options={{ cutout: '70%', plugins: { legend: { display: false } } }} />
              <p className="-mt-24 text-center text-2xl font-bold">{Math.round(stats.latest_ats_score)}%</p>
            </div>
          ) : (
            <p className="text-slate-500">No ATS data yet</p>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-4 font-semibold">Top Skills</h3>
          <div className="flex flex-wrap gap-2">
            {stats.top_skills.length ? stats.top_skills.map((s) => (
              <span key={s} className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">{s}</span>
            )) : <p className="text-slate-500">Upload a resume to extract skills</p>}
          </div>
        </div>
        <div className="card">
          <h3 className="mb-4 font-semibold">Missing Skills & Suggestions</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {stats.missing_skills.map((s) => (
              <span key={s} className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-800 dark:bg-red-950 dark:text-red-300">{s}</span>
            ))}
          </div>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            {stats.recent_suggestions.map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </div>
      </div>
    </div>
  )
}
