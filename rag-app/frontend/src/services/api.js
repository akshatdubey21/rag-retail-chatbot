import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Upload a PDF file to the backend.
 * @param {File} file
 * @returns {Promise<{filename: string, chunks: number, status: string}>}
 */
export async function uploadPDF(file) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await API.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/**
 * Send a question to the RAG pipeline.
 * @param {string} question
 * @returns {Promise<{answer: string, sources: Array}>}
 */
export async function sendMessage(question) {
  const { data } = await API.post('/chat', { question });
  return data;
}

/**
 * Health check.
 * @returns {Promise<{status: string, uploaded_files: string[], index_ready: boolean}>}
 */
export async function healthCheck() {
  const { data } = await API.get('/health');
  return data;
}
