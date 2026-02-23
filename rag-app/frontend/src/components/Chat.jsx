import { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../services/api';
import Message from './Message';
import { FiSend, FiMessageSquare, FiUploadCloud } from 'react-icons/fi';

const SUGGESTIONS = [
  'Summarize the key points of this document',
  'What are the main topics discussed?',
  'List any important dates or figures mentioned',
];

export default function Chat({ hasDocuments }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleSend = async (question) => {
    const q = (question || input).trim();
    if (!q || loading) return;

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendMessage(q);
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

  const clearChat = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Top bar */}
      {messages.length > 0 && (
        <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/80 px-6 py-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <FiMessageSquare className="h-4 w-4" />
            <span>{messages.filter((m) => m.role === 'user').length} messages</span>
          </div>
          <button
            onClick={clearChat}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition
              hover:bg-gray-800 hover:text-gray-300"
          >
            Clear chat
          </button>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            {hasDocuments ? (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/20">
                  <FiMessageSquare className="h-8 w-8 text-white" />
                </div>
                <h2 className="mt-5 text-xl font-bold text-white">
                  Ready to chat!
                </h2>
                <p className="mt-2 max-w-sm text-sm text-gray-500">
                  Your documents are loaded. Ask anything about them below.
                </p>
                {/* Suggestion chips */}
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s)}
                      className="rounded-full border border-gray-700 bg-gray-800 px-4 py-2 text-xs font-medium text-gray-400
                        shadow-sm transition hover:border-brand-600 hover:bg-brand-900/20 hover:text-brand-400 hover:shadow-md"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-800">
                  <FiUploadCloud className="h-8 w-8 text-gray-600" />
                </div>
                <h2 className="mt-5 text-xl font-bold text-white">
                  Upload a PDF to begin
                </h2>
                <p className="mt-2 max-w-sm text-sm text-gray-500">
                  Use the sidebar to upload a PDF document, then start asking questions about it.
                </p>
              </>
            )}
          </div>
        )}

        <div className="mx-auto max-w-3xl">
          {messages.map((msg, i) => (
            <Message key={i} message={msg} />
          ))}
        </div>

        {/* Typing indicator */}
        {loading && (
          <div className="mx-auto max-w-3xl">
            <div className="my-4 flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-xs text-white shadow-md">
                AI
              </div>
              <div className="rounded-2xl rounded-tl-md bg-gray-800 px-5 py-4 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-800 bg-gray-900/80 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-end gap-3">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
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
              className="w-full resize-none rounded-xl border border-gray-700 bg-gray-800/60 px-4 py-3 pr-4 text-sm
                text-gray-100 placeholder-gray-500 outline-none transition-all
                focus:border-brand-500 focus:bg-gray-800 focus:ring-2 focus:ring-brand-500/20
                focus:shadow-lg focus:shadow-brand-500/10 disabled:opacity-50"
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-700
              text-white shadow-md shadow-brand-600/25 transition-all hover:shadow-lg hover:shadow-brand-600/30
              hover:scale-105 active:scale-95 disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100"
            aria-label="Send message"
          >
            <FiSend className="h-4 w-4" />
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] text-gray-600">
          Answers are generated from your uploaded documents only
        </p>
      </div>
    </div>
  );
}
