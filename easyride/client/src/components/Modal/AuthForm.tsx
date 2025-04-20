import { useState } from "react";
import styles from "./Form.module.css";
import AuthSignIn from "./AuthSignIn";
import axios, { AxiosError } from "axios";
import { useAuth } from "../../context/authContext"; // Импортируем useAuth

interface AuthFormProps {
  openModal: (type: "login" | "register" | null, data?: { name?: string; email?: string }) => void;
  onClose: () => void;  // Функция для закрытия модалки
}

const AuthForm: React.FC<AuthFormProps> = ({ onClose }) => {
  const { setUser } = useAuth(); // Используем setUser из контекста
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/login",
        { provider: "local", email, password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        console.log("Авторизация успешна", response.data);

        // Добавляем данные пользователя в контекст
        setUser({
          authenticated: true,
          userId: response.data.client_id,
          email: response.data.email,
          name: response.data.name,
          picture: response.data.picture,
          googleId: response.data.googleId,
        });

        // Закрываем модалку после успешной авторизации
        onClose();  // Закрываем модалку через onClose
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        setErrorMessage(error.response.data.message || "Ошибка авторизации");
      } else {
        setErrorMessage("Сервер не доступен");
      }
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
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
      {errorMessage && <div className={styles.error}>{errorMessage}</div>}
      <button className={styles.button} type="submit">
        Увійти
      </button>
      <AuthSignIn />
    </form>
  );
};

export default AuthForm;
