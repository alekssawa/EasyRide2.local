"use client";

import styles from "@/components/Modal/Form.module.css";

const AuthForm = () => {
  return (
    <form className={styles.form}>
      <h2 className={styles.title}>Увійти</h2>
      <input className={styles.input} type="email" placeholder="Email" required />
      <input className={styles.input} type="password" placeholder="Пароль" required />
      <button className={styles.button} type="submit">Увійти</button>
      <button className={`${styles.button} ${styles.google}`} type="button">
        Увійти через Google
      </button>
    </form>
  );
};

export default AuthForm;
