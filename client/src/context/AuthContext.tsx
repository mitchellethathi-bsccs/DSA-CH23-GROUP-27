import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

export interface UserInfo {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  title?: string;
  isAdmin?: boolean;
  isBanned?: boolean;
  token: string;
}

interface AuthContextType {
  user: UserInfo | null;
  login: (userData: UserInfo) => void;
  logout: () => void;
  loading: boolean;
  socket: Socket | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  loading: true,
  socket: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in on mount
    const userInfoString = localStorage.getItem('userInfo');
    if (userInfoString) {
      try {
        const userInfo = JSON.parse(userInfoString);
        setUser(userInfo);
      } catch (e) {
        console.error('Failed to parse userInfo:', e);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const newSocket = io(backendUrl);
      setSocket(newSocket);

      newSocket.on('connect', () => {
        newSocket.emit('register', user._id);
      });

      return () => {
        newSocket.close();
      };
    } else if (!user && socket) {
      socket.close();
      setSocket(null);
    }
  }, [user]);

  const login = (userData: UserInfo) => {
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, socket }}>
      {children}
    </AuthContext.Provider>
  );
};
