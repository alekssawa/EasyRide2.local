import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import logo from "@/assets/img/logoWhite.png";

import Modal from "../../components/Modal/Modal/Modal";
import Dropdown from "../Dropdown/Dropdown";
import DropdownItem from "../Dropdown/DropdownItem/DropdownItem";
import { useAuth } from "../../context/authContext";

const Header = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [authType, setAuthType] = useState<"login" | "register" | null>(null);
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [registerData, setRegisterData] = useState<{
    name?: string;
    email?: string;
    googleId?: string;
  }>({});

  const { user, setUser, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Обрабатываем query-параметры от Google OAuth
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const googleId = query.get("googleId");
    const email = query.get("email");
    const name = query.get("name");
    const needsReg = query.get("needsRegistration");

    if (needsReg === "true") {
      setNeedsRegistration(true);
    }

    if (email || name) {
      setRegisterData({ name: name || "", email: email || "", googleId: googleId || "" });
    }

    if (needsReg || email) {
      navigate("/", { replace: true }); // Чистим URL
    }
  }, [location, navigate]);

  // Открываем модалку регистрации при необходимости
  useEffect(() => {
    if (user?.authenticated && needsRegistration) {
      openModal("register", registerData);
      setNeedsRegistration(false);
    }
  }, [user, needsRegistration, registerData]);

  const openModal = (
    type: "login" | "register" | null,
    data?: { name?: string; email?: string }
  ) => {
    if (type) setAuthType(type);
    if (data) setRegisterData(data);
    setModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setUser({
          authenticated: false,
          userId: null,
          email: null,
          name: null,
          picture: null,
          googleId: null,
          password: null,
          role: null,
        });
        navigate("/");
      } else {
        console.error("Failed to logout");
      }
    } catch (error) {
      console.error("Error during logout", error);
    }
  };

  if (loading || user === null){
    return;
  } 
  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <a onClick={() => navigate("/")}>
              <img src={logo} alt="Logo" width={150} height={50} />
            </a>
          </div>

          <div className={styles.authButtons}>
            {user.authenticated && !needsRegistration ? (
              <Dropdown
                buttonText={user.name}
                content={
                  <>
                    <DropdownItem onClick={() => navigate("/profile")}>Профіль</DropdownItem>
                    <DropdownItem onClick={() => navigate("/my-order")}>Моє замовлення</DropdownItem>
                    <DropdownItem onClick={() => navigate("/my-order-history")}>Історія</DropdownItem>
                    <DropdownItem onClick={() => navigate("/settings")}>Налаштування</DropdownItem>
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
        registerData={registerData}
        openModal={openModal}
      />
    </>
  );
};

export default Header;
