// components/Modal/AuthForm.tsx
import { useState } from "react";

import styles from "./Form.module.css";
import AuthSignIn from "./AuthSignIn";

interface AuthFormProps {
  openModal: (type: "login" | "register", data?: { name?: string; email?: string }) => void;
}

const AuthForm: React.FC<AuthFormProps> = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");



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

      <AuthSignIn />
    </form>
  );
};

export default AuthForm;
