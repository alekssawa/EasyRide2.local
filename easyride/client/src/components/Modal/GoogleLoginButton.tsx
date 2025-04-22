"use client";

import { signIn, getSession } from "next-auth/react"; // Импорт getSession
import styles from "@/components/Modal/Form.module.css";

interface GoogleLoginButtonProps {
  openModal: (type: "login" | "register", data?: { name?: string; email?: string }) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ openModal }) => {
    const logToLocalStorage = (message: string) => {
        const logs = JSON.parse(localStorage.getItem('logs') || '[]');
        logs.push(message);
        localStorage.setItem('logs', JSON.stringify(logs));
      };
      
      const handleGoogleLogin = async () => {
        logToLocalStorage("Step 1: Starting Google sign-in");
      
        const result = await signIn("google", { callbackUrl: "/api/auth/callback" });
      
        if (result?.ok) {
          logToLocalStorage("Step 2: Google sign-in successful");
      
          const session = await getSession();
          logToLocalStorage("Session received: " + JSON.stringify(session));
      
          const email = session?.user?.email;
          if (!email) {
            logToLocalStorage("No email found in session");
            return;
          }
      
          const res = await fetch("/api/auth/user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
      
          logToLocalStorage(`check-user status: ${res.status}`);
      
          const text = await res.text();
          logToLocalStorage("check-user raw response: " + text);
      
          let data;
          try {
            data = JSON.parse(text);
            logToLocalStorage("Parsed check-user data: " + JSON.stringify(data));
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error during JSON.parse";
            logToLocalStorage("Failed to parse check-user response: " + errorMessage);
            return;
          }
      
          if (data.isNewUser) {
            logToLocalStorage("New user detected, opening modal");
            openModal("register", {
              name: session?.user?.name ?? "",
              email: session?.user?.email ?? "",
            });
          } else {
            logToLocalStorage("Existing user, modal not opened");
          }
        } else {
          logToLocalStorage("Google login failed");
        }
      };

  return (
    <button
      className={`${styles.button} ${styles.google}`}
      type="button"
      onClick={handleGoogleLogin}
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
  );
};

export default GoogleLoginButton;
