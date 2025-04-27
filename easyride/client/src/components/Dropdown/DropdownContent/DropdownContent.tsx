import { forwardRef, ReactNode } from "react";
import "./DropdownContent.css";

interface DropdownContentProps {
  children: ReactNode;
  open?: boolean;
  top?: number;
  buttonWidth: number; // Получаем width из родительского компонента
}

const DropdownContent = forwardRef<HTMLDivElement, DropdownContentProps>(
  ({ children, open, top, buttonWidth }, ref) => {
    return (
      <div
        ref={ref}
        className={`dropdown-content ${open ? "content-open" : ""}`}
        style={{
          top: top !== undefined ? `${top}px` : "100%",
          width: `${buttonWidth}px`, // Устанавливаем ширину контента равной ширине кнопки
        }}
      >
        {children}
      </div>
    );
  }
);

DropdownContent.displayName = "DropdownContent";

export default DropdownContent;
