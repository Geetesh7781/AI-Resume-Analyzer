import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', full_name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <form onSubmit={handleSubmit} className="card w-full max-w-md animate-slide-up">
        <h2 className="text-2xl font-bold">Create account</h2>
        <p className="mt-2 text-slate-500">Start analyzing your resume with AI</p>
        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950">{error}</p>}
        <div className="mt-6 space-y-4">
          <input className="input-field" placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          <input type="email" className="input-field" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input type="password" className="input-field" placeholder="Password (min 6 chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
          {loading ? 'Creating...' : 'Create Account'}
        </button>
        <p className="mt-4 text-center text-sm text-slate-500">
          Have an account? <Link to="/login" className="text-primary-600 hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
