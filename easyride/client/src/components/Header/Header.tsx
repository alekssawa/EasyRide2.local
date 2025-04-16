import { useState, useEffect } from "react";

import styles from "./Header.module.css"; // Убедитесь, что путь правильный

import logo from "@/assets/img/logoWhite.png";

import Modal from "../../components/Modal/Modal/Modal";

import Dropdown from "../Dropdown/Dropdown";
import DropdownItem from "../DropdownItem/DropdownItem";

interface UserData {
  authenticated: boolean;
  email?: string;
  name?: string;
  picture?: string;
}

const Header = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [authType, setAuthType] = useState<"login" | "register">("login");
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/user", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(() => setUser({ authenticated: false }));
  }, []);

  const handleLogout = () => {
    fetch("http://localhost:5000/api/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => setUser({ authenticated: false }));
  };

  const openModal = (type: "login" | "register") => {
    setAuthType(type);
    setModalOpen(true);
  };

  if (user === null) return <p>Загрузка...</p>;

  return user.authenticated ? (
    <>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <a href="/">
              <img src={logo} alt="Logo" width={150} height={50} />
            </a>
          </div>
          <div className={styles.authButtons}>
            <Dropdown
            buttonText={user.name}
            content={
              <>
                <DropdownItem>{"Profile"}</DropdownItem>
                <DropdownItem>{"Settings"}</DropdownItem>
                <DropdownItem>{"Notifications"}</DropdownItem>
                <DropdownItem onClick={handleLogout}>Выйти</DropdownItem>
              </>
            }
          />
          </div>
        </div>
      </header>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        authType={authType}
        setAuthType={setAuthType}
        openModal={openModal}
      />
    </>
  ) : (
    <>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <a href="/">
              <img src={logo} alt="Logo" width={150} height={50} />
            </a>
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
        </div>
      </header>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        authType={authType}
        setAuthType={setAuthType}
        openModal={openModal}
      />
    </>
  );
};

export default Header;
