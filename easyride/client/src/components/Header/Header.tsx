import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import logo from "@/assets/img/logoWhite.png";

import Modal from "../../components/Modal/Modal/Modal";
import Dropdown from "../Dropdown/Dropdown";
import DropdownItem from "../DropdownItem/DropdownItem";
import { useAuth } from "../../context/authContext"; // Исправленный путь

const Header = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [authType, setAuthType] = useState<"login" | "register" | null>(null);
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [registerData, setRegisterData] = useState<{
    name?: string;
    email?: string;
    googleId?: string;
  }>({});

  const { user, setUser } = useAuth(); // Используем useAuth для получения данных из контекста
  const location = useLocation();
  const navigate = useNavigate();

  // Получаем query параметры и обрабатываем
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const googleId = query.get("googleId");
    const email = query.get("email");
    const name = query.get("name");
    const picture = query.get("picture");
    const needsReg = query.get("needsRegistration");

    if (email || name) {
      console.log("User from URL:", { googleId, email, name, picture });
    }

    if (needsReg === "true") {
      setNeedsRegistration(true);
    }

    if (email || name) {
      setRegisterData({ name: name || "", email: email || "", googleId: googleId || "" });
    }

    if (needsReg || email) {
      navigate("/", { replace: true });
    }
  }, [location, navigate]);

  // Загружаем данные пользователя с бэка
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/user", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setUser(data); // Обновляем данные пользователя в контексте
        } else {
          setUser({ authenticated: false });
        }
      } catch (error) {
        setUser({ authenticated: false });
        console.error("Error fetching user data", error);
      }
    };

    fetchUserData();
  }, [setUser]);

  // ⛳ Открываем регистрацию, если нужно
  useEffect(() => {
    if (user?.authenticated && needsRegistration) {
      openModal("register", registerData); // <-- Передаём данные
      setNeedsRegistration(false);
    }
  }, [user, needsRegistration, registerData]);

  const openModal = (
    type: "login" | "register" | null,
    data?: { name?: string; email?: string }
  ) => {
    if (type) {
      setAuthType(type); // Убираем null для setAuthType
    }
    if (data) {
      setRegisterData(data);
    }
    setModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setUser({ authenticated: false }); // Обновляем состояние в контексте при выходе
      } else {
        console.error("Failed to logout");
      }
    } catch (error) {
      console.error("Error during logout", error);
    }
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
            {user.authenticated && !needsRegistration ? (
              <Dropdown
                buttonText={user.name}
                content={
                  <>
                    <DropdownItem>Profile</DropdownItem>
                    <DropdownItem>Settings</DropdownItem>
                    <DropdownItem>Notifications</DropdownItem>
                    <DropdownItem onClick={handleLogout}>Вийти</DropdownItem>
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
        onClose={() => setModalOpen(false)} // Закрываем модалку при вызове onClose
        authType={authType}
        setAuthType={setAuthType}
        registerData={registerData}
        openModal={openModal} // передаем openModal в Modal
      />
    </>
  );
};

export default Header;
