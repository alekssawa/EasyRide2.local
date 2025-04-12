import React from "react";

import styles from "@/components/DropdownMenu/DropdownMenu.module.css";

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  changeDropdown?: (to: string) => void;
  changeDropdownTo?: string;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  onClick,
  changeDropdown,
  changeDropdownTo,
}) => {
  const handleClick = () => {
    if (changeDropdown && changeDropdownTo) {
      changeDropdown(changeDropdownTo);
    }

    if (onClick) {
      onClick();
    }
  };

  return (
    <div className={styles.dropdownItem} onClick={handleClick}>
      {children}
    </div>
  );
};

export default DropdownItem;
