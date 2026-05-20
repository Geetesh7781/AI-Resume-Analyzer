import { useEffect, useState } from 'react'
import FileDropzone from '../components/FileDropzone'
import { jdAPI } from '../services/api'

export default function JDUpload() {
  const [title, setTitle] = useState('Software Engineer')
  const [text, setText] = useState('')
  const [jds, setJds] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const loadJds = () => jdAPI.list().then((res) => setJds(res.data))
  useEffect(() => { loadJds() }, [])

  const submitText = async () => {
    setLoading(true)
    try {
      await jdAPI.uploadText({ title, text })
      setMessage('Job description saved')
      setText('')
      loadJds()
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const submitPdf = async (file) => {
    setLoading(true)
    const form = new FormData()
    form.append('title', title)
    form.append('file', file)
    try {
      await jdAPI.upload(form)
      setMessage('JD PDF uploaded')
      loadJds()
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-slide-up">
      <h2 className="text-3xl font-bold">Job Description</h2>
      <p className="mt-2 text-slate-500">Paste text or upload a JD PDF</p>

      <div className="mt-8 card space-y-4">
        <input className="input-field" placeholder="Job title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea
          className="input-field min-h-[200px]"
          placeholder="Paste job description here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={submitText} disabled={loading || text.length < 10} className="btn-primary">
          Save Job Description
        </button>
      </div>

      <div className="mt-8">
        <h3 className="mb-4 font-semibold">Or upload JD PDF</h3>
        <FileDropzone onFile={submitPdf} label="Drop JD PDF here" />
      </div>

      {message && <p className="mt-4 text-primary-600">{message}</p>}

      <div className="mt-10 space-y-3">
        <h3 className="font-semibold">Saved Job Descriptions</h3>
        {jds.map((j) => (
          <div key={j.id} className="card flex justify-between">
            <span className="font-medium">{j.title}</span>
            <span className="text-sm text-slate-500">#{j.id} · {j.source_type}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
