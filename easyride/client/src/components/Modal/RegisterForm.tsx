"use client";

import styles from "./Form.module.css";
import { useState, useEffect } from "react";

type RegisterFormProps = {
  defaultValues?: {
    name?: string;
    email?: string;
  };
};

const RegisterForm = ({ defaultValues }: RegisterFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Если defaultValues переданы, заполняем поля значениями из Google
  useEffect(() => {
    if (defaultValues) {
      setName(defaultValues.name || "");
      setEmail(defaultValues.email || "");
    }
  }, [defaultValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Логика отправки данных на сервер для регистрации
    const response = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({ name, email }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    // Логика после успешной регистрации, например, редирект на страницу профиля
    if (data) {
      console.log("Пользователь успешно зарегистрирован:", data);
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
        required
      />

      <input
        className={styles.input}
        type="password"
        placeholder="Пароль"
        required
      />

      <button className={styles.button} type="submit">
        Зареєструватися
      </button>
    </form>
  );
};

export default RegisterForm;
