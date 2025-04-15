// components/AuthSignIn.tsx
import { useState } from "react";
import styles from "./Form.module.css";


interface AuthSignInProps {
  onGoogleSignIn: (email: string) => void;
}

const AuthSignIn = ({ onGoogleSignIn }: AuthSignInProps) => {
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      // Здесь должна быть логика авторизации через Google OAuth
      // Пример: ты можешь открыть popup, получить токен и отправить его на свой бэкенд

      // Пока что просто симулируем успешный вход
      const mockEmail = "user@example.com";
      onGoogleSignIn(mockEmail);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Ошибка при авторизации через Google");
    }
  };

  return (
    <>
      <button className={`${styles.button} ${styles.google}`} type="button" onClick={handleGoogleLogin}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img
            loading="lazy"
            height="24"
            width="24"
            src="https://authjs.dev/img/providers/google.svg"
            alt="Google Icon"
          />
          <span>Увійти через Google</span>
        </div>
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </>
  );
};

export default AuthSignIn;
