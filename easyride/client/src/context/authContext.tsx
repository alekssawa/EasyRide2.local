import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserData {
  authenticated: boolean;
  userId: string | null;
  email: string | null;
  name: string | null;
  picture: string | null; // Это поле будет хранить URL аватарки
  googleId: string | null;
  password?: string | null;
  role: string | null;
  // Добавляем дополнительные поля, если нужно
  phone?: string | null;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthContextType {
  user: UserData;
  setUser: React.Dispatch<React.SetStateAction<UserData>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  refreshUser: () => Promise<void>;
  updateUserAvatar: (avatarUrl: string) => void; // Новый метод
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData>({
    authenticated: false,
    userId: null,
    email: null,
    name: null,
    picture: null,
    googleId: null,
    password: null,
    role: null,
  });
  
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      // setLoading(true);
      const response = await fetch("http://localhost:5000/api/auth/user", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data)
        setUser({
          authenticated: true,
          userId: data.userId || null,
          email: data.email || null,
          name: data.name || null,
          picture: data.picture || null, // Поддержка разных названий поля
          googleId: data.googleId || null,
          password: data.password || null,
          role: data.role || null,
          phone: data.phone || null, // Добавляем телефон, если есть
        });
      } else {
        setUser({
          authenticated: false,
          userId: null,
          email: null,
          name: null,
          picture: null,
          googleId: null,
          password: null,
          role: null,
        });
      }
    } catch (error) {
      console.error("Error fetching user data", error);
      setUser({
        authenticated: false,
        userId: null,
        email: null,
        name: null,
        picture: null,
        googleId: null,
        password: null,
        role: null,
      });
    } finally {
      setLoading(false);
    }
  };

  // Метод для обновления аватарки
  const updateUserAvatar = (avatarUrl: string) => {
    setUser(prev => ({
      ...prev,
      picture: avatarUrl
    }));
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        setUser, 
        loading,
        setLoading, 
        refreshUser: fetchUserData,
        updateUserAvatar // Добавляем новый метод
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};