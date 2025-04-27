import { forwardRef, ReactNode, MouseEventHandler } from "react";

import "./DropdownButton.css";
import styles from "../../Header/Header.module.css";

interface DropdownButtonProps {
  children: ReactNode;
  toggle?: MouseEventHandler<HTMLDivElement>;
  open?: boolean;
}

// ref будет ссылкой на div
const DropdownButton = forwardRef<HTMLDivElement, DropdownButtonProps>(
  ({ children, toggle }, ref) => {
    return (
      <div
        onClick={toggle}
        className={`${styles.buttonName} ${styles.authButtonlogin} ${styles.loginButton}`}
        ref={ref}
      >
        {children}
      </div>
    );
  }
);

// Добавим имя компонента (по желанию)
DropdownButton.displayName = "DropdownButton";

export default DropdownButton;
