import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const features = [
  { title: 'ATS Scoring', desc: 'Skills, keywords, experience & formatting analysis', icon: '🎯' },
  { title: 'JD Matching', desc: 'Compare resume against job descriptions', icon: '🔗' },
  { title: 'RAG Chatbot', desc: 'Ask AI questions with resume context', icon: '💬' },
  { title: 'Interview Prep', desc: 'HR, technical & project-based questions', icon: '🎤' },
]

export default function Home() {
  const { isAuthenticated } = useAuth()
  const { dark, toggle } = useTheme()

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-slate-200 px-8 py-4 dark:border-slate-800">
        <h1 className="text-xl font-bold text-primary-600">AI Resume Analyzer</h1>
        <div className="flex gap-3">
          <button onClick={toggle} className="btn-secondary text-sm">{dark ? '☀️' : '🌙'}</button>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-8 py-20 text-center animate-slide-up">
        <span className="rounded-full bg-primary-100 px-4 py-1 text-sm font-medium text-primary-700 dark:bg-primary-950 dark:text-primary-300">
          RAG Powered · Gemini AI · FAISS
        </span>
        <h2 className="mt-6 text-5xl font-bold tracking-tight">
          Analyze Your Resume with <span className="text-primary-600">AI</span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Upload your resume, paste a job description, and get ATS scores, skill gap analysis,
          interview questions, and personalized career recommendations.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link to="/register" className="btn-primary px-8 py-3 text-lg">Start Free Analysis</Link>
          <Link to="/login" className="btn-secondary px-8 py-3 text-lg">Sign In</Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-8 pb-20 md:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="card animate-slide-up text-center">
            <div className="mb-4 text-3xl">{f.icon}</div>
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-500">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
