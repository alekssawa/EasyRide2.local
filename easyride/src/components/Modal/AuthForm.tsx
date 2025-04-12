"use client";

import styles from "@/components/Modal/Form.module.css";
import { signIn } from "next-auth/react";

const AuthForm = () => {
  return (
    <form className={styles.form}>
      <h2 className={styles.title}>Увійти</h2>
      <input
        className={styles.input}
        type="email"
        placeholder="Email"
        required
      />
      <input
        className={styles.input}
        type="password"
        placeholder="Пароль"
        required
      />
      <button className={styles.button} type="submit">
        Увійти
      </button>
      <button
        className={`${styles.button} ${styles.google}`}
        type="button"
        onClick={() => signIn("google")}
      >
        <div className={styles.buttonContent}>
          <img
            loading="lazy"
            height="24"
            width="24"
            src="https://authjs.dev/img/providers/google.svg"
            alt="Google Icon"
            className={styles.icon}
          />
          <span className={styles.text}>Увійти через Google</span>
        </div>
      </button>
    </form>
  );
};

export default AuthForm;
