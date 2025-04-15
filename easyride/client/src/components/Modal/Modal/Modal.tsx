import styles from "./Modal.module.css";  // Убедитесь, что путь правильный
import AuthForm from "../AuthForm"; // Импортируем форму авторизации
import RegisterForm from "../RegisterForm"; // Импортируем форму регистрации

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  authType: "login" | "register";
  setAuthType: (authType: "login" | "register") => void;
  registerData?: { name?: string; email?: string };
  openModal: (type: "login" | "register", data?: { name?: string; email?: string }) => void; // Добавить
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, authType, setAuthType, registerData, openModal }) => {
  if (!isOpen) return null; // Если окно закрыто, ничего не показываем

  const handleLoginClick = () => {
    setAuthType("login");  // Устанавливаем тип авторизации
  };

  const handleRegisterClick = () => {
    setAuthType("register");  // Устанавливаем тип регистрации
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* <button className={styles.closeButton} onClick={onClose}>×</button> */}
        <div className={styles.toggleButtons}>
          <button
            className={`${styles.toggleButton} ${authType === "login" ? styles.active : ""}`}
            onClick={handleLoginClick} // Сменить на авторизацию
          >
            Увійти
          </button>
          <button
            className={`${styles.toggleButton} ${authType === "register" ? styles.active : ""}`}
            onClick={handleRegisterClick} // Сменить на регистрацию
          >
            Зареєструватися
          </button>
        </div>
        {authType === "login" ? (
          <AuthForm openModal={openModal} />  // Передаем openModal в AuthForm
        ) : (
          <RegisterForm defaultValues={registerData} />
        )}
      </div>
    </div>
  );
};

export default Modal;
