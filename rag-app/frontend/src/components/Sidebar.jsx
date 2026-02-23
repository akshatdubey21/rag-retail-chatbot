import { useState, useRef, useCallback } from 'react';
import { uploadPDF, deleteDocument } from '../services/api';
import { FiUpload, FiX, FiFile, FiTrash2, FiCheck, FiAlertCircle } from 'react-icons/fi';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function getDisplayName(filename) {
  // Strip the UUID prefix (32 hex chars + underscore)
  return filename.replace(/^[a-f0-9]{32}_/, '');
}

export default function Sidebar({ open, onToggle, uploadedFiles, onUploadSuccess, onFileDeleted, activeFile, setActiveFile }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');
  const [deletingFile, setDeletingFile] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are allowed.');
      return;
    }

    setError('');
    setUploading(true);
    setUploadProgress(`Uploading "${file.name}"…`);
    try {
      const res = await uploadPDF(file);
      setUploadProgress('');
      onUploadSuccess(res);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (fileRef.current) fileRef.current.value = '';
    }
  }, [onUploadSuccess]);

  const handleInputChange = (e) => {
    handleFile(e.target.files?.[0]);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDelete = async (filename) => {
    setDeletingFile(filename);
    try {
      await deleteDocument(filename);
      onFileDeleted(filename);
      setConfirmDelete(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Delete failed.');
    } finally {
      setDeletingFile(null);
    }
  };

  if (!open) return null;

  return (
    <aside className="flex h-full w-80 flex-col border-r border-gray-800/80 bg-gray-900 shadow-lg shadow-black/20">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-500/25">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            RAG Chat
          </h1>
        </div>
        <button
          onClick={onToggle}
          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-800 hover:text-gray-300"
          aria-label="Close sidebar"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>

      {/* Upload zone */}
      <div className="px-4 pb-2">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200 ${
            dragOver
              ? 'border-brand-500 bg-brand-900/20 scale-[1.02]'
              : uploading
                ? 'border-brand-400 bg-brand-900/10'
                : 'border-gray-700 hover:border-brand-600 hover:bg-gray-800/50'
          }`}
        >
          <label className="flex cursor-pointer flex-col items-center gap-2 px-4 py-5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              uploading || dragOver
                ? 'bg-brand-800/50 text-brand-400'
                : 'bg-gray-800 text-gray-500'
            }`}>
              <FiUpload className="h-5 w-5" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-300">
                {uploading ? 'Processing…' : dragOver ? 'Drop PDF here' : 'Upload PDF'}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500">
                {uploading ? uploadProgress : 'Drag & drop or click to browse'}
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleInputChange}
              disabled={uploading}
            />
          </label>
          {/* Upload progress bar */}
          {uploading && (
            <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden bg-brand-900/30">
              <div className="h-full animate-progress-indeterminate bg-gradient-to-r from-brand-500 to-brand-600" />
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-2 flex items-start gap-2 rounded-lg bg-red-900/20 px-3 py-2">
            <FiAlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
            <p className="text-xs text-red-400">{error}</p>
            <button onClick={() => setError('')} className="ml-auto shrink-0 text-red-400 hover:text-red-600">
              <FiX className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Documents list */}
      <div className="mt-2 flex-1 overflow-y-auto px-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
            Documents
          </p>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-800 px-1.5 text-[10px] font-bold text-gray-400">
            {uploadedFiles.length}
          </span>
        </div>

        {uploadedFiles.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800">
              <FiFile className="h-6 w-6 text-gray-600" />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-500">No documents yet</p>
            <p className="mt-1 text-[11px] text-gray-600">Upload a PDF to get started</p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {uploadedFiles.map((file) => {
              const name = typeof file === 'string' ? file : file.filename;
              const displayName = getDisplayName(name);
              const size = file?.size;
              const isActive = activeFile === name;
              const isDeleting = deletingFile === name;
              const isConfirming = confirmDelete === name;

              return (
                <li
                  key={name}
                  className={`group relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-900/20 text-brand-400 shadow-sm'
                      : 'text-gray-400 hover:bg-gray-800/50'
                  }`}
                  onClick={() => setActiveFile?.(name)}
                >
                  {/* File icon */}
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                    isActive
                      ? 'bg-brand-800/50 text-brand-400'
                      : 'bg-gray-800 text-gray-500 group-hover:bg-brand-900/30 group-hover:text-brand-400'
                  }`}>
                    <FiFile className="h-4 w-4" />
                  </div>

                  {/* File info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">{displayName}</p>
                    {size ? (
                      <p className="text-[10px] text-gray-500">{formatBytes(size)}</p>
                    ) : null}
                  </div>

                  {/* Delete button */}
                  {isConfirming ? (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(name)}
                        disabled={isDeleting}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500 text-white transition hover:bg-red-600 disabled:opacity-50"
                        title="Confirm delete"
                      >
                        {isDeleting ? (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <FiCheck className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-700 text-gray-400 transition hover:bg-gray-600"
                        title="Cancel"
                      >
                        <FiX className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(name); }}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-600 opacity-0 transition-all
                        hover:bg-red-900/20 hover:text-red-400 group-hover:opacity-100"
                      title="Delete document"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 px-4 py-3">
        <div className="flex items-center gap-2 text-[10px] text-gray-600">
          <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          Powered by LangChain + FAISS + HuggingFace
        </div>
      </div>
    </aside>
  );
}
