"use client";

import styles from "@/components/Modal/Form.module.css";

const RegisterForm = () => {
  return (
    <form className={styles.form}>
      <h2>Реєстрація</h2>
      <input className={styles.input} type="text" placeholder="ПІБ" required />
      <input className={styles.input} type="email" placeholder="Email" required />
      <input className={styles.input} type="tel" placeholder="Номер телефону" required />
      <input className={styles.input} type="password" placeholder="Пароль" required />
      <button className={styles.button} type="submit">Зареєструватися</button>
    </form>
  );
};

export default RegisterForm;
