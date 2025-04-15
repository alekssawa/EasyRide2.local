// components/Modal/AuthForm.tsx
import { useState } from "react";
import styles from "./Form.module.css";
import AuthSignIn from "./AuthSignIn";

interface AuthFormProps {
  openModal: (type: "login" | "register", data?: { name?: string; email?: string }) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ openModal }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);

  const checkUserExists = async (email: string) => {
    try {
      const response = await fetch("/api/check-user", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ошибка при проверке пользователя");
      }

      setIsNewUser(data.isNewUser);

      // Пример использования openModal после проверки
      if (data.isNewUser) {
        openModal("register", { email }); // Переход к регистрации с email
      }
    } catch (error) {
      console.error("Ошибка при запросе к серверу:", error);
      setError("Ошибка при подключении к серверу");
    }
  };

  const handleGoogleSignIn = async (email: string) => {
    setEmail(email);
    await checkUserExists(email);
  };

  return (
    <form className={styles.form}>
      <h2 className={styles.title}>Увійти</h2>
      <input
        className={styles.input}
        type="email"
        placeholder="Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className={styles.input}
        type="password"
        placeholder="Пароль"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className={styles.button} type="submit">
        Увійти
      </button>

      <AuthSignIn onGoogleSignIn={handleGoogleSignIn} />

      {error && <p className={styles.error}>{error}</p>}
      {isNewUser === false && <p>Пользователь найден! Переходите к авторизации.</p>}
      {isNewUser === true && <p>Новый пользователь! Переходите к регистрации.</p>}
    </form>
  );
};

export default AuthForm;
