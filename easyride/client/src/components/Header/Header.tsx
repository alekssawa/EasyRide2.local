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
  googleId?: string;
}

const Header = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [authType, setAuthType] = useState<"login" | "register">("login");
  const [user, setUser] = useState<UserData | null>(null);

  // Загрузка данных о пользователе
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/user", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setUser({ authenticated: false });
        }
      } catch (error) {
        setUser({ authenticated: false });
        console.error("Error fetching user data", error);
      }
    };

    fetchUserData();
  }, []);

  // Логика для выхода
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setUser({ authenticated: false });
      } else {
        console.error("Failed to logout");
      }
    } catch (error) {
      console.error("Error during logout", error);
    }
  };

  // Открытие модалки с типом авторизации
  const openModal = (type: "login" | "register") => {
    setAuthType(type);
    setModalOpen(true);
  };

  if (user === null) return <p>Загрузка...</p>;

  console.log(user);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <a href="/">
              <img src={logo} alt="Logo" width={150} height={50} />
            </a>
          </div>

          <div className={styles.authButtons}>
            {user.authenticated ? (
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
            ) : (
              <>
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
              </>
            )}
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
