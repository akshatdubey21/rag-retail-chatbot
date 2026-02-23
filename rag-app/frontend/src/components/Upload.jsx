import { useRef, useState, useCallback } from 'react';
import { uploadPDF } from '../services/api';
import { FiUploadCloud, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';

/**
 * Standalone upload component with drag-and-drop support.
 */
export default function Upload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const processFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setMessage({ text: 'Only PDF files are supported.', type: 'error' });
      return;
    }

    setMessage({ text: '', type: '' });
    setUploading(true);

    try {
      const res = await uploadPDF(file);
      setMessage({
        text: `"${res.filename}" uploaded successfully (${res.chunks} chunks).`,
        type: 'success',
      });
      onUploadSuccess?.(res);
    } catch (err) {
      setMessage({
        text: err.response?.data?.detail || 'Upload failed. Please try again.',
        type: 'error',
      });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }, [onUploadSuccess]);

  const handleFile = (e) => processFile(e.target.files?.[0]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files?.[0]);
  }, [processFile]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`relative w-full max-w-sm overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-200 ${
          dragOver
            ? 'border-brand-500 bg-brand-50 scale-[1.02] dark:bg-brand-900/20'
            : uploading
              ? 'border-brand-400 bg-brand-50/50 dark:bg-brand-900/10'
              : 'border-gray-200 hover:border-brand-400 dark:border-gray-700 dark:hover:border-brand-600'
        }`}
      >
        <label className="flex cursor-pointer flex-col items-center gap-3 px-8 py-8">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition ${
            uploading || dragOver
              ? 'bg-brand-100 text-brand-600 dark:bg-brand-800/50 dark:text-brand-400'
              : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
          }`}>
            <FiUploadCloud className="h-7 w-7" />
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-700 dark:text-gray-300">
              {uploading ? 'Processing document…' : dragOver ? 'Drop your PDF here' : 'Upload a PDF'}
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Drag & drop or click to browse
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFile}
            disabled={uploading}
          />
        </label>
        {uploading && (
          <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden bg-brand-100 dark:bg-brand-900/30">
            <div className="h-full animate-progress-indeterminate bg-gradient-to-r from-brand-500 to-brand-600" />
          </div>
        )}
      </div>

      {message.text && (
        <div className={`flex items-start gap-2 rounded-xl px-4 py-2.5 text-xs ${
          message.type === 'error'
            ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
            : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
        }`}>
          {message.type === 'error' ? (
            <FiAlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          ) : (
            <FiCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          )}
          <p>{message.text}</p>
          <button onClick={() => setMessage({ text: '', type: '' })} className="ml-2 shrink-0 opacity-60 hover:opacity-100">
            <FiX className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
