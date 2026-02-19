import { useRef, useState } from 'react';
import { uploadPDF } from '../services/api';
import { FiUploadCloud } from 'react-icons/fi';

/**
 * Standalone upload component (can be used outside the sidebar if needed).
 */
export default function Upload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
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
        text: `✅ "${res.filename}" uploaded (${res.chunks} chunks).`,
        type: 'success',
      });
      onUploadSuccess?.(res.filename);
    } catch (err) {
      setMessage({
        text: err.response?.data?.detail || 'Upload failed.',
        type: 'error',
      });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <label
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed
          px-8 py-6 text-sm transition
          ${uploading
            ? 'border-brand-400 bg-brand-50 dark:bg-brand-700/20'
            : 'border-gray-300 hover:border-brand-500 dark:border-gray-600 dark:hover:border-brand-500'
          }`}
      >
        <FiUploadCloud className="h-8 w-8 text-brand-500" />
        <span className="font-medium text-gray-600 dark:text-gray-300">
          {uploading ? 'Processing…' : 'Click to upload a PDF'}
        </span>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFile}
          disabled={uploading}
        />
      </label>

      {message.text && (
        <p
          className={`text-xs ${
            message.type === 'error' ? 'text-red-500' : 'text-green-600 dark:text-green-400'
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
