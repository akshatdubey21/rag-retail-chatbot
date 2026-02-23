import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FiCopy, FiCheck, FiAlertTriangle } from 'react-icons/fi';

export default function Message({ message }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className={`group my-3 flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-sm
          ${isUser
            ? 'bg-gradient-to-br from-brand-500 to-brand-700 text-white'
            : message.error
              ? 'bg-red-900/30 text-red-400'
              : 'bg-gradient-to-br from-brand-500 to-brand-700 text-white'
          }`}
      >
        {isUser ? 'U' : 'AI'}
      </div>

      {/* Bubble */}
      <div className="relative max-w-[75%]">
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed
            ${isUser
              ? 'rounded-tr-md bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-md shadow-brand-600/20'
              : message.error
                ? 'rounded-tl-md border border-red-800 bg-red-900/20 text-red-400'
                : 'rounded-tl-md bg-gray-800 text-gray-200 shadow-sm ring-1 ring-gray-700/50'
            }`}
        >
          {message.error && (
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-red-500">
              <FiAlertTriangle className="h-3.5 w-3.5" />
              Error
            </div>
          )}

          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-li:my-0.5 prose-headings:mb-2 prose-headings:mt-3">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}

          {/* Sources */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-3 border-t border-gray-700/50 pt-2.5">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                Sources
              </p>
              <div className="flex flex-wrap gap-1.5">
                {message.sources.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-md bg-gray-700/50 px-2 py-1 text-[11px] text-gray-400 ring-1 ring-gray-600/50"
                  >
                    📄 {s.source} <span className="text-gray-600">•</span> p.{s.page}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Copy button (assistant messages only) */}
        {!isUser && !message.error && (
          <button
            onClick={handleCopy}
            className="absolute -bottom-1 right-2 flex items-center gap-1 rounded-md bg-gray-700 px-2 py-1 text-[10px]
              text-gray-500 opacity-0 shadow-sm ring-1 ring-gray-600 transition
              hover:text-gray-300 group-hover:opacity-100"
          >
            {copied ? (
              <>
                <FiCheck className="h-3 w-3 text-green-500" /> Copied
              </>
            ) : (
              <>
                <FiCopy className="h-3 w-3" /> Copy
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
