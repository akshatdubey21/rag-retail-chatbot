import { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../services/api';
import Message from './Message';
import { FiSend } from 'react-icons/fi';

export default function Chat({ hasDocuments }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || loading) return;

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendMessage(question);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.answer,
          sources: res.sources,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="text-5xl">📄</div>
            <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-200">
              Chat with your PDFs
            </h2>
            <p className="mt-2 max-w-md text-sm text-gray-400 dark:text-gray-500">
              {hasDocuments
                ? 'Your documents are ready! Ask any question about them.'
                : 'Upload a retail PDF document from the sidebar, then ask questions about it.'}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <Message key={i} message={msg} />
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="my-4 flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm dark:bg-brand-700">
              🤖
            </div>
            <div className="rounded-2xl rounded-tl-none bg-white px-4 py-3 shadow dark:bg-gray-800">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              hasDocuments
                ? 'Ask a question about your documents…'
                : 'Upload a PDF first…'
            }
            disabled={loading}
            className="flex-1 resize-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm
              placeholder-gray-400 outline-none transition focus:border-brand-500 focus:ring-2
              focus:ring-brand-500/30 disabled:opacity-50
              dark:border-gray-600 dark:bg-gray-700 dark:placeholder-gray-500 dark:focus:border-brand-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white
              transition hover:bg-brand-700 disabled:opacity-40"
            aria-label="Send message"
          >
            <FiSend className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
