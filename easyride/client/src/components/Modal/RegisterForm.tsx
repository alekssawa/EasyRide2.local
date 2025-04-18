"use client";

import styles from "./Form.module.css";
import { useState, useEffect } from "react";

type RegisterFormProps = {
  defaultValues?: {
    name?: string;
    email?: string;
    provider?: string;
    googleId?: string;
  };
  setAuthType: (authType: "login" | "register") => void;
};

const RegisterForm = ({ defaultValues, setAuthType }: RegisterFormProps) => {

  console.log("Received defaultValues in RegisterForm:", defaultValues);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [provider, setProvider] = useState(""); // предполагаем, что это строка
  const [googleId, setGoogleId] = useState<string | null>(null); // предполагаем, что это может быть строка или null

  // Если defaultValues переданы, заполняем поля значениями из Google
  useEffect(() => {
    if (defaultValues) {
      setName(defaultValues.name || "");
      setEmail(defaultValues.email || "");
      setProvider(defaultValues.googleId ? "google" : "local");
      setGoogleId(defaultValues.googleId || null); 
    }
  }, [defaultValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("User post for front:", { googleId, email, name, password, provider});
      // Логика отправки данных на сервер для регистрации клиента
      const response = await fetch('http://localhost:5000/api/clients', {
        method: 'POST',
        body: JSON.stringify({
          name,
          phone,
          email,
          password,  // Передаём пароль (не хешированный, это делает сервер)
          provider,
          googleId: googleId || null
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      // Если сервер вернул ошибку
      if (!response.ok) {
        throw new Error('Ошибка регистрации на сервере');
      }

      const data = await response.json();

      // Логика после успешной регистрации
      if (data) {
        console.log("Пользователь успешно зарегистрирован:", data);
        setAuthType("login");

        // Можно выполнить редирект на страницу профиля или другую логику
      } else {
        console.error("Ошибка регистрации: данные не получены");
      }
    } catch (err: unknown) {
      // Проверяем, что ошибка является объектом Error
      if (err instanceof Error) {
        console.error("Ошибка при отправке данных:", err.message);
      } else {
        console.error("Неизвестная ошибка", err);
      }
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Реєстрація</h2>

      <input
        className={styles.input}
        type="text"
        placeholder="ПІБ"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        className={styles.input}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        className={styles.input}
        type="tel"
        placeholder="Номер телефону"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />

      <input
        className={styles.input}
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button className={styles.button} type="submit">
        Зареєструватися
      </button>
    </form>
  );
};

export default RegisterForm;
