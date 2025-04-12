"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "@/components/Header/Header.module.css";

import Modal from "@/components/Modal/Modal/Modal";



import Navbar from "@/components/DropdownMenu/Navbar";

import { useSession } from "next-auth/react"; // Импортируем useSession из next-auth

const Header = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [authType, setAuthType] = useState<"login" | "register">("login");

  const { data: session } = useSession(); // Используем useSession для получения данных сессии

  const openModal = (type: "login" | "register") => {
    setAuthType(type);
    setModalOpen(true);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Link href="/">
            <Image
              src="/img/logoWhite.png"
              alt="Logo"
              width={150}
              height={50}
            />
          </Link>
        </div>

        {session?.user?.name ? (
          <Navbar username={session.user.name ?? "Гость"} />
        ) : (
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
        )}
      </header>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        authType={authType}
        setAuthType={setAuthType}
      />
    </>
  );
};

export default Header;
