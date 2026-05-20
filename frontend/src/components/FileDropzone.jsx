import { useCallback, useState } from 'react'

export default function FileDropzone({ onFile, accept = '.pdf', label = 'Drop PDF here or click to browse' }) {
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState('')

  const handleFile = useCallback(
    (file) => {
      if (!file) return
      setFileName(file.name)
      onFile(file)
    },
    [onFile],
  )

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`card flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-12 transition ${
        dragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' : 'border-slate-300 dark:border-slate-700'
      }`}
    >
      <input
        type="file"
        accept={accept}
        className="hidden"
        id="file-upload"
        onChange={(e) => handleFile(e.target.files[0])}
      />
      <label htmlFor="file-upload" className="cursor-pointer text-center">
        <div className="mb-4 text-4xl">📁</div>
        <p className="font-medium">{label}</p>
        <p className="mt-2 text-sm text-slate-500">PDF only</p>
        {fileName && <p className="mt-4 text-sm text-primary-600">Selected: {fileName}</p>}
      </label>
    </div>
  )
}
