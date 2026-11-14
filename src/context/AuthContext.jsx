import { createContext, useContext, useState, useEffect } from 'react';
import { 
  registerStudentAPI, 
  loginStudentAPI, 
  getCurrentUserAPI, 
  logoutStudentAPI, 
  requestPasswordResetAPI 
} from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate existing JWT session on initial load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('evalai_jwt_token');
        const storedUser = localStorage.getItem('evalai_user_session');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Verify token against backend GET /api/auth/me
          try {
            const profile = await getCurrentUserAPI();
            if (profile?.user) {
              setUser(profile.user);
              localStorage.setItem('evalai_user_session', JSON.stringify(profile.user));
            }
          } catch (e) {
            // Token expired or invalid: purge
            console.warn('Backend rejected stored session token; logging out');
            localStorage.removeItem('evalai_jwt_token');
            localStorage.removeItem('evalai_user_session');
            setToken(null);
            setUser(null);
          }
        }
      } catch (e) {
        console.error('Failed to parse local auth session', e);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for automatic token expiration event from Axios interceptor
    const handleExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('evalai_session_expired', handleExpired);
    return () => window.removeEventListener('evalai_session_expired', handleExpired);
  }, []);

  // Login handler connected to FastAPI backend POST /api/auth/login
  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error('Please provide both email and password.');
    }

    try {
      const res = await loginStudentAPI({ email, password });
      const authenticatedUser = {
        id: res.user.id,
        email: res.user.email,
        fullName: res.user.full_name,
        role: res.user.role || 'student',
        university: res.user.university || 'Student Researcher'
      };

      // Store JWT token and user session securely in client storage
      localStorage.setItem('evalai_jwt_token', res.access_token);
      localStorage.setItem('evalai_user_session', JSON.stringify(authenticatedUser));

      setToken(res.access_token);
      setUser(authenticatedUser);
      return authenticatedUser;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || err.message || 'Login failed. Please check credentials.';
      throw new Error(errorMsg);
    }
  };

  // Registration handler connected to FastAPI backend POST /api/auth/register
  const register = async ({ fullName, email, password, university }) => {
    if (!fullName || !email || !password) {
      throw new Error('All required fields must be filled.');
    }

    try {
      const res = await registerStudentAPI({
        full_name: fullName,
        email,
        password,
        university
      });

      const registeredUser = {
        id: res.user.id,
        email: res.user.email,
        fullName: res.user.full_name,
        university: res.user.university,
        role: res.user.role || 'student'
      };

      if (res.access_token) {
        localStorage.setItem('evalai_jwt_token', res.access_token);
        setToken(res.access_token);
      }
      localStorage.setItem('evalai_user_session', JSON.stringify(registeredUser));

      setUser(registeredUser);
      return registeredUser;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || err.message || 'Registration failed.';
      throw new Error(errorMsg);
    }
  };

  // Logout handler connected to backend audit POST /api/auth/logout
  const logout = async () => {
    try {
      await logoutStudentAPI();
    } catch (e) {
      console.warn('Backend logout sync skipped');
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('evalai_jwt_token');
      localStorage.removeItem('evalai_user_session');
    }
  };

  const resetPassword = async (email) => {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    try {
      const res = await requestPasswordResetAPI(email);
      return { success: true, message: res.message || `Reset instructions sent to ${email}` };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || err.message || 'Failed to request reset.';
      throw new Error(errorMsg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        register,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
