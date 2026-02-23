import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import { listDocuments } from './services/api';

export default function App() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeFile, setActiveFile] = useState(null);

  // Load existing documents on mount
  const fetchDocuments = useCallback(async () => {
    try {
      const res = await listDocuments();
      setUploadedFiles(res.documents || []);
    } catch {
      // Backend might not be running yet
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUploadSuccess = (fileInfo) => {
    setUploadedFiles((prev) => [
      ...prev,
      {
        filename: fileInfo.filename,
        chunks: fileInfo.chunks,
        size: fileInfo.size || 0,
        uploaded_at: Date.now() / 1000,
      },
    ]);
  };

  const handleFileDeleted = (filename) => {
    setUploadedFiles((prev) => prev.filter((f) => f.filename !== filename));
    if (activeFile === filename) setActiveFile(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        uploadedFiles={uploadedFiles}
        onUploadSuccess={handleUploadSuccess}
        onFileDeleted={handleFileDeleted}
        activeFile={activeFile}
        setActiveFile={setActiveFile}
      />

      {/* Main chat area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile menu button */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="group m-3 flex w-10 items-center justify-center self-start rounded-xl
              bg-gray-800 p-2.5 shadow-md shadow-black/20 transition-all hover:shadow-lg hover:scale-105
              hover:bg-gray-700"
            aria-label="Open sidebar"
          >
            <svg className="h-5 w-5 text-gray-400 transition group-hover:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <Chat hasDocuments={uploadedFiles.length > 0} />
      </main>
    </div>
  );
}
