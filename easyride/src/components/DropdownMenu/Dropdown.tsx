import React from "react";

import styles from "@/components/DropdownMenu/DropdownMenu.module.css";


interface DropdownProps {
  children: React.ReactNode;
  dropdownHeight?: string | number;
}

const Dropdown: React.FC<DropdownProps> = ({ children, dropdownHeight }) => {
  const height = dropdownHeight ? dropdownHeight : 'auto';

  return (
    <div className={styles.dropdown} style={{ height: height }}>
      {children}
    </div>
  );
};

export default Dropdown;
