import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/resume', label: 'Resume Upload', icon: '📄' },
  { to: '/jd', label: 'Job Description', icon: '💼' },
  { to: '/ats', label: 'ATS Analysis', icon: '🎯' },
  { to: '/match', label: 'Match Report', icon: '🔗' },
  { to: '/chat', label: 'AI Chatbot', icon: '💬' },
  { to: '/interview', label: 'Interview Qs', icon: '🎤' },
]

export default function Sidebar() {
  const { logout, user } = useAuth()
  const { dark, toggle } = useTheme()

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 p-6 dark:border-slate-800">
        <h1 className="text-lg font-bold text-primary-600">Resume Analyzer</h1>
        <p className="text-xs text-slate-500">RAG + Gemini AI</p>
        <p className="mt-1 text-xs font-semibold text-slate-400">Powered by Priyanshu Patidar</p>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`
            }
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <p className="mb-2 truncate text-xs text-slate-500">{user?.email}</p>
        <button onClick={toggle} className="btn-secondary mb-2 w-full text-sm">
          {dark ? '☀️ Light' : '🌙 Dark'}
        </button>
        <button onClick={logout} className="w-full rounded-xl border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950">
          Logout
        </button>
      </div>
    </aside>
  )
}
