import ReactMarkdown from 'react-markdown';

export default function Message({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`my-4 flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm
          ${isUser
            ? 'bg-brand-600 text-white'
            : 'bg-brand-100 dark:bg-brand-700'
          }`}
      >
        {isUser ? '👤' : '🤖'}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow
          ${isUser
            ? 'rounded-tr-none bg-brand-600 text-white'
            : message.error
              ? 'rounded-tl-none bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : 'rounded-tl-none bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-200'
          }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-700">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Sources
            </p>
            <ul className="space-y-0.5">
              {message.sources.map((s, i) => (
                <li key={i} className="text-[11px] text-gray-500 dark:text-gray-400">
                  📄 {s.source} — page {s.page}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
