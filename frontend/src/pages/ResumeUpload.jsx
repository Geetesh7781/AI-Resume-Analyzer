import { useEffect, useState } from 'react'
import FileDropzone from '../components/FileDropzone'
import { resumeAPI } from '../services/api'

export default function ResumeUpload() {
  const [resumes, setResumes] = useState([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadResumes = () => resumeAPI.list().then((res) => setResumes(res.data))

  useEffect(() => { loadResumes() }, [])

  const handleUpload = async (file) => {
    setUploading(true)
    setError('')
    setMessage('')
    try {
      const { data } = await resumeAPI.upload(file)
      setMessage(`Uploaded: ${data.filename}`)
      loadResumes()
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="animate-slide-up">
      <h2 className="text-3xl font-bold">Resume Upload</h2>
      <p className="mt-2 text-slate-500">Upload PDF resumes for AI parsing and RAG indexing</p>

      <div className="mt-8">
        <FileDropzone onFile={handleUpload} label="Drop your resume PDF here" />
        {uploading && <p className="mt-4 text-primary-600">Uploading and parsing...</p>}
        {message && <p className="mt-4 text-green-600">{message}</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </div>

      <div className="mt-10">
        <h3 className="text-lg font-semibold">Your Resumes</h3>
        <div className="mt-4 space-y-4">
          {resumes.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{r.filename}</p>
                  <p className="text-sm text-slate-500">ID: {r.id} · {new Date(r.created_at).toLocaleString()}</p>
                </div>
              </div>
              {r.parsed_data && (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Name</p>
                    <p>{r.parsed_data.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Skills</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(r.parsed_data.skills || []).slice(0, 12).map((s) => (
                        <span key={s} className="rounded bg-primary-100 px-2 py-0.5 text-xs dark:bg-primary-950">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {!resumes.length && <p className="text-slate-500">No resumes uploaded yet</p>}
        </div>
      </div>
    </div>
  )
}
