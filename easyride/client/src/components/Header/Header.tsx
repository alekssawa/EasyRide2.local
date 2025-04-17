import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
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
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [registerData, setRegisterData] = useState<{
    name?: string;
    email?: string;
  }>({});

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
      setRegisterData({ name: name || "", email: email || "" });
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

  // ⛳ Открываем регистрацию, если нужно
  useEffect(() => {
    if (user?.authenticated && needsRegistration) {
      openModal("register", registerData); // <-- Передаём данные
      setNeedsRegistration(false);
    }
  }, [user, needsRegistration, registerData]);

  const openModal = (
    type: "login" | "register",
    data?: { name?: string; email?: string }
  ) => {
    setAuthType(type);
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
        setUser({ authenticated: false });
      } else {
        console.error("Failed to logout");
      }
    } catch (error) {
      console.error("Error during logout", error);
    }
  };

  if (user === null) return <p>Загрузка...</p>;

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
            {user.authenticated && !setNeedsRegistration ? (
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
        onClose={() => setModalOpen(false)}
        authType={authType}
        setAuthType={setAuthType}
        registerData={registerData} // <-- тут
        openModal={openModal}
      />
    </>
  );
};

export default Header;
