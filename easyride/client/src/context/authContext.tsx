import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserData {
  authenticated: boolean;
  userId?: string;
  email?: string;
  name?: string;
  picture?: string;
  googleId?: string;
}

// Интерфейс для пропсов компонента AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// Тип контекста, который будет содержать user и setUser
interface AuthContextType {
  user: UserData | null;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined); // Тип контекста

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/user", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setUser({ authenticated: false });
        }
      } catch (error) {
        setUser({ authenticated: false });
        console.error("Error fetching user data", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
