import axios from 'axios';

// Base API instance pointing to FastAPI backend
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach JWT access token
API.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('evalai_jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error attaching JWT token', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle token expiration and 401s
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      console.warn('Session expired or unauthorized. Clearing local token.');
      localStorage.removeItem('evalai_jwt_token');
      localStorage.removeItem('evalai_user_session');
      // Dispatch event to inform React AuthContext
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('evalai_session_expired'));
      }
    }
    return Promise.reject(error);
  }
);

export const checkBackendHealth = async () => {
  const response = await API.get('/api/health');
  return response.data;
};

// -------------------------------------------------------------
// Authentication API methods
// -------------------------------------------------------------
export const registerStudentAPI = async (userData) => {
  const response = await API.post('/api/auth/register', userData);
  return response.data;
};

export const loginStudentAPI = async (credentials) => {
  const response = await API.post('/api/auth/login', credentials);
  return response.data;
};

export const getCurrentUserAPI = async () => {
  const response = await API.get('/api/auth/me');
  return response.data;
};

export const logoutStudentAPI = async () => {
  try {
    const response = await API.post('/api/auth/logout');
    return response.data;
  } catch (e) {
    // Client-side purge is sufficient if offline
    return { status: 'logged_out' };
  }
};

export const requestPasswordResetAPI = async (email) => {
  const response = await API.post('/api/auth/forgot-password', { email });
  return response.data;
};

// -------------------------------------------------------------
// Project Evaluation & Submission API methods
// -------------------------------------------------------------
export const evaluateProjectAPI = async (projectData) => {
  const response = await API.post('/api/projects/evaluate', projectData);
  return response.data;
};

export const submitProjectAPI = async (projectData) => {
  const response = await API.post('/api/projects/submit', projectData);
  return response.data;
};

export const getProjectByIdAPI = async (projectId) => {
  const response = await API.get(`/api/projects/${projectId}`);
  return response.data;
};

export const getAllProjectsAPI = async (userId = null) => {
  const url = userId ? `/api/projects?user_id=${userId}` : '/api/projects';
  const response = await API.get(url);
  return response.data;
};

// -------------------------------------------------------------
// Gemini AI Project Evaluation API methods
// -------------------------------------------------------------

/**
 * Run a full Gemini AI evaluation for a project.
 * Maps the existing ProjectSubmissionForm field names to the
 * backend ProjectEvaluationInput schema.
 *
 * @param {Object} projectData - Form fields from the frontend
 * @returns {Promise<Object>} - Validated evaluation result with AI scores
 */
export const evaluateProjectWithGeminiAPI = async (projectData) => {
  const payload = {
    title: projectData.title,
    domain: projectData.domain,
    technologies: projectData.technologies,
    description: projectData.description || 'Not provided',
    problem_statement: projectData.problemStatement || null,
    target_users: projectData.targetUsers || 'General public',
    skill_level: projectData.skillLevel || 'Intermediate',
    timeline: projectData.timeline || '3 - 4 Months',
    budget: projectData.budget || 'Flexible',
    team_size: projectData.teamSize || 'Capstone Team (3 - 4 Students)',
  };
  const response = await API.post('/api/evaluate', payload, { timeout: 60000 });

  // Flatten: merge top-level metadata + nested evaluation fields
  // so callers can access data.feasibility_score, data.strengths, etc. directly
  const { evaluation, ...meta } = response.data;
  return { ...meta, ...(evaluation || {}) };
};

/**
 * Check if the backend Gemini AI service is configured and ready.
 * @returns {Promise<Object>} - { configured: bool, model: string, ... }
 */
export const getGeminiStatusAPI = async () => {
  const response = await API.get('/api/ai/status');
  return response.data;
};

// -------------------------------------------------------------
// Project Failure Risk Analysis API methods (8 Categories)
// -------------------------------------------------------------
/**
 * Run a standalone 8-dimension failure risk analysis.
 * Analyzes:
 * 1. Technical limitations
 * 2. Lack of programming knowledge
 * 3. Insufficient budget
 * 4. Unrealistic deadlines
 * 5. Lack of datasets
 * 6. Security vulnerabilities
 * 7. Integration problems
 * 8. Team coordination issues
 *
 * @param {Object} projectData - Project specifications
 * @returns {Promise<Object>} - ProjectFailureRiskAnalysis object
 */
export const analyzeProjectRisksAPI = async (projectData) => {
  const payload = {
    title: projectData.title,
    domain: projectData.domain,
    technologies: projectData.technologies,
    description: projectData.description || 'Not provided',
    problem_statement: projectData.problemStatement || null,
    target_users: projectData.targetUsers || 'General public',
    skill_level: projectData.skillLevel || 'Intermediate',
    timeline: projectData.timeline || '3 - 4 Months',
    budget: projectData.budget || 'Flexible',
    team_size: projectData.teamSize || 'Capstone Team (3 - 4 Students)',
  };
  const response = await API.post('/api/evaluate/risk-analysis', payload, { timeout: 30000 });
  return response.data;
};

// -------------------------------------------------------------
// MODULE A: AI Project Assistant Chatbot (Chat History Collection)
// -------------------------------------------------------------
export const getProjectChatAPI = async (projectId) => {
  const response = await API.get(`/api/projects/${projectId}/chat`);
  return response.data;
};

export const sendProjectChatMessageAPI = async (projectId, message) => {
  const response = await API.post(`/api/projects/${projectId}/chat`, { message });
  return response.data;
};

export const clearProjectChatAPI = async (projectId) => {
  const response = await API.delete(`/api/projects/${projectId}/chat`);
  return response.data;
};

// -------------------------------------------------------------
// MODULE B: Development Roadmap (Phases, Tasks & Progress in MongoDB)
// -------------------------------------------------------------
export const getProjectRoadmapAPI = async (projectId) => {
  const response = await API.get(`/api/projects/${projectId}/roadmap`);
  return response.data;
};

export const generateProjectRoadmapAPI = async (projectId) => {
  const response = await API.post(`/api/projects/${projectId}/roadmap/generate`);
  return response.data;
};

export const toggleRoadmapTaskAPI = async (projectId, taskId, completed = null) => {
  const payload = completed !== null ? { completed } : {};
  const response = await API.post(`/api/projects/${projectId}/roadmap/tasks/${taskId}/toggle`, payload);
  return response.data;
};

export const addCustomRoadmapTaskAPI = async (projectId, taskData) => {
  const response = await API.post(`/api/projects/${projectId}/roadmap/tasks`, taskData);
  return response.data;
};

export default API;
