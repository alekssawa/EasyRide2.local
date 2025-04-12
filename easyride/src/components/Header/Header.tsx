import Link from "next/link";
import Image from "next/image";
import styles from "@/components/Header/Header.module.css";


const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link href="/">
          <Image src="/img/logoWhite.png" alt="Logo" width={150} height={50} />
        </Link>
      </div>
      <div className={styles.authButtons}>
        <Link href="/login">
          <button className={`${styles.authButton} ${styles.loginButton}`}>
            Login
          </button>
        </Link>
        <Link href="/register">
          <button className={`${styles.authButton} ${styles.registerButton}`}>
            Register
          </button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
