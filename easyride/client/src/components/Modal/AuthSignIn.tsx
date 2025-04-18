import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Modal from "../../components/Modal/Modal/Modal";
import styles from "./Form.module.css";

const AuthSignIn = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [authType, setAuthType] = useState<"login" | "register">("login");
  const [registerData, setRegisterData] = useState<{ name?: string; email?: string; googleId?: string }>({});

  const openModal = (type: "login" | "register", data?: { name?: string; email?: string; googleId?: string }) => {
    setAuthType(type);
    setModalOpen(true);
    if (data) {
      setRegisterData(data); // Сохраняем данные для регистрации
      console.log("Received registerData in AuthSignIn:", registerData);
    }else{
      console.log("error registerData in AuthSignIn:");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const email = query.get("email");
    const name = query.get("name");
    const picture = query.get("picture");
    const googleId = query.get("googleId"); 
    const needsRegistration = query.get("needsRegistration");

    

    if (needsRegistration === "true") {
      console.log(needsRegistration);
      // alert(googleId);
      openModal("register", { name:name || undefined, email:email || undefined, googleId: googleId || undefined });
    }

    if (email || name || picture) {
      // Здесь можно сохранить пользователя в localStorage или глобальное хранилище
      // Например: setUser({ email, name, picture });
    }

    if (needsRegistration || email) {
      // Очистить URL после обработки
      navigate("/", { replace: true });
    }
  }, [location]);

  return (
    <>
      <button
        className={`${styles.button} ${styles.google}`}
        type="button"
        onClick={handleGoogleLogin}
      >
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

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        authType={authType}
        setAuthType={setAuthType}
        registerData={registerData} // Передаем registerData в Modal
        openModal={openModal}
      />
    </>
  );
};

export default AuthSignIn;
