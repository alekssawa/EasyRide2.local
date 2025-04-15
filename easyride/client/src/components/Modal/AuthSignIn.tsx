// components/AuthSignIn.tsx

import styles from "./Form.module.css";


const AuthSignIn = () => {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
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
    </>
  );
};

export default AuthSignIn;
