import { useState, useRef } from 'react';
import { uploadPDF } from '../services/api';
import { FiUpload, FiX, FiFile } from 'react-icons/fi';

export default function Sidebar({ open, onToggle, uploadedFiles, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are allowed.');
      return;
    }

    setError('');
    setUploading(true);
    try {
      const res = await uploadPDF(file);
      onUploadSuccess(res.filename);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  if (!open) return null;

  return (
    <aside className="flex h-full w-72 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-lg font-bold tracking-tight text-brand-600 dark:text-brand-500">
          📄 RAG Chat
        </h1>
        <button
          onClick={onToggle}
          className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Close sidebar"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>

      {/* Upload */}
      <div className="px-4">
        <label
          className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed
            px-4 py-3 text-sm font-medium transition
            ${uploading
              ? 'border-brand-400 bg-brand-50 text-brand-600 dark:bg-brand-700/20 dark:text-brand-400'
              : 'border-gray-300 text-gray-500 hover:border-brand-500 hover:text-brand-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-brand-500 dark:hover:text-brand-400'
            }`}
        >
          <FiUpload className="h-4 w-4" />
          {uploading ? 'Processing…' : 'Upload PDF'}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFile}
            disabled={uploading}
          />
        </label>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>

      {/* Uploaded files list */}
      <div className="mt-4 flex-1 overflow-y-auto px-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Documents ({uploadedFiles.length})
        </p>
        {uploadedFiles.length === 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500">No documents yet.</p>
        )}
        <ul className="space-y-1">
          {uploadedFiles.map((name, i) => (
            <li
              key={i}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <FiFile className="h-4 w-4 shrink-0 text-brand-500" />
              <span className="truncate">{name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-3 text-center text-[10px] text-gray-400 dark:border-gray-700 dark:text-gray-500">
        Powered by LangChain + FAISS + HuggingFace
      </div>
    </aside>
  );
}
