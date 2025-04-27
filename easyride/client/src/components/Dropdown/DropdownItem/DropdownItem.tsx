import { ReactNode, MouseEventHandler, KeyboardEvent } from "react";
import "./DropdownItem.css";

interface DropdownItemProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

const DropdownItem = ({ children, onClick }: DropdownItemProps) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault(); // Чтобы пробел не прокручивал страницу
      onClick?.(
        // создаём фиктивное событие мыши на основе клавиатурного
        {
          ...e,
          currentTarget: e.currentTarget,
          target: e.target,
        } as unknown as React.MouseEvent<HTMLDivElement>
      );
    }
  };

  return (
    <div
      className="dropdown-item flex justify-center"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
};

export default DropdownItem;
