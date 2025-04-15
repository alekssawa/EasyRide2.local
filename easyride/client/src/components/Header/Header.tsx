import { useState } from "react";
import { Link } from "react-router-dom"; // Используем react-router-dom для навигации
import styles from "./Header.module.css"; // Убедитесь, что путь правильный

import Modal from "../../components/Modal/Modal/Modal"; // Относительный путь

const Header = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [authType, setAuthType] = useState<"login" | "register">("login");

  // Здесь заменим на вашу собственную логику аутентификации
  // const session = null; // Для примера, замените на свою логику, если нужно

  const openModal = (type: "login" | "register") => {
    setAuthType(type);
    setModalOpen(true);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Link to="/">
          <img src="/img/logoWhite.png" alt="Logo" width={150} height={50} />
          </Link>
        </div>

        <div className={styles.authButtons}>
            <button
              onClick={() => openModal("login")}
              className={`${styles.authButtonlogin} ${styles.loginButton}`}
            >
              Увійти
            </button>
            <button
              onClick={() => openModal("register")}
              className={`${styles.authButtonRegister} ${styles.registerButton}`}
            >
              Зареєструватися
            </button>
          </div>
      </header>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        authType={authType}
        setAuthType={setAuthType}
        openModal={openModal} // добавь эту строку
      />
    </>
  );
};

export default Header;
