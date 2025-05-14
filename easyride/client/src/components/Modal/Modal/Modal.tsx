import styles from "./Modal.module.css"; // Убедитесь, что путь правильный
import AuthForm from "../AuthForm"; // Импортируем форму авторизации
import RegisterForm from "../RegisterForm"; // Импортируем форму регистрации

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  authType: "login" | "register" | null; // Разрешаем null
  setAuthType: React.Dispatch<React.SetStateAction<"login" | "register" | null>>; // Разрешаем null
  registerData?: { name?: string; email?: string; googleId?: string };
  openModal: (type: "login" | "register" | null, data?: { name?: string; email?: string }) => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, authType, setAuthType, registerData, openModal }) => {
  if (!isOpen) return null; // Если окно закрыто, ничего не показываем

  // console.log("Received registerData in Modal:", registerData);

  const handleLoginClick = () => {
    setAuthType("login");  // Устанавливаем тип авторизации
  };

  const handleRegisterClick = () => {
    setAuthType("register");  // Устанавливаем тип регистрации
  };

  const handleBackdropClick = () => {
    onClose();  // Закрываем модалку при клике на фон
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.toggleButtons}>
          <button
            className={`${styles.toggleButton} ${authType === "login" ? styles.active : ""}`}
            onClick={handleLoginClick}
          >
            Увійти
          </button>
          <button
            className={`${styles.toggleButton} ${authType === "register" ? styles.active : ""}`}
            onClick={handleRegisterClick}
          >
            Зареєструватися
          </button>
        </div>
        {authType === "login" ? (
          <AuthForm openModal={openModal} onClose={onClose} />
        ) : (
          <RegisterForm defaultValues={registerData} setAuthType={setAuthType} />
        )}
      </div>
    </div>
  );
};

export default Modal;
