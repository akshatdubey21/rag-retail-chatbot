import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';

export default function App() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleUploadSuccess = (filename) => {
    setUploadedFiles((prev) => [...prev, filename]);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        uploadedFiles={uploadedFiles}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Main chat area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile menu button */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="m-2 w-10 self-start rounded-lg bg-white p-2 shadow dark:bg-gray-800"
            aria-label="Open sidebar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <Chat hasDocuments={uploadedFiles.length > 0} />
      </main>
    </div>
  );
}
