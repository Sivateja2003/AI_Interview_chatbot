import axios from "axios";
import { auth } from "./firebase";

// Use environment variables properly with Vite
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add Firebase JWT token to requests automatically
apiClient.interceptors.request.use(
  async (config) => {
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const uploadDocument = async (file, docType) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("doc_type", docType);

  const response = await apiClient.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getDocuments = async () => {
  const response = await apiClient.get("/documents");
  return response.data;
};

export const deleteDocument = async (documentId) => {
  const response = await apiClient.delete(`/documents/${documentId}`);
  return response.data;
};

export const generateQuestion = async (sessionId, difficulty, focusArea) => {
  const payload = {
    session_id: sessionId,
    difficulty: difficulty,
    focus_area: focusArea,
  };
  const response = await apiClient.post("/generate-question", payload);
  return response.data;
};

export const evaluateAnswer = async (
  sessionId,
  questionId,
  question,
  answer,
  difficulty,
  retrievedContext
) => {
  const payload = {
    session_id: sessionId,
    question_id: questionId,
    question: question,
    answer: answer,
    difficulty: difficulty,
    retrieved_context: retrievedContext,
  };
  const response = await apiClient.post("/evaluate-answer", payload);
  return response.data;
};

export const adjustDifficulty = async (sessionId, direction) => {
  const response = await apiClient.post("/adjust-difficulty", {
    session_id: sessionId,
    direction: direction,
  });
  return response.data;
};

export const getHistory = async () => {
  const response = await apiClient.get("/history");
  return response.data;
};

export const getWeakAreas = async () => {
  const response = await apiClient.get("/weak-areas");
  return response.data;
};
