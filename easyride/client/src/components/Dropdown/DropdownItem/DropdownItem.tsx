import { ReactNode, MouseEventHandler, KeyboardEvent } from "react";
import "./DropdownItem.css";

interface DropdownItemProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
  disabled?: boolean;
}

const DropdownItem = ({ children, onClick, disabled = false }: DropdownItemProps) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.({
        ...e,
        currentTarget: e.currentTarget,
        target: e.target,
      } as unknown as React.MouseEvent<HTMLDivElement>);
    }
  };

  return (
    <div
      className={`dropdown-item flex justify-center ${
        disabled ? "text-gray-400 cursor-not-allowed" : "cursor-pointer hover:bg-gray-100"
      }`}
      onClick={disabled ? undefined : onClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
};

export default DropdownItem;
