import React, { useState, useEffect, useRef } from "react";
import styles from "@/components/DropdownMenu/DropdownMenu.module.css";

interface NavItemProps {
  icon: React.ReactNode; // Тип для иконки
  children: React.ReactNode; // Тип для детей (контента)
}

const NavItem = ({ icon, children }: NavItemProps) => {
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);
  const navItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navItemRef.current && !navItemRef.current.contains(event.target as Node)) {
        setOpenDropdown(false);
      }
    };

    window.addEventListener("click", handleClickOutside);

    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className={styles.navItem} ref={navItemRef}>
      <span
        className={styles.iconContainer}
        onClick={() => setOpenDropdown(!openDropdown)}
      >
        {icon}
      </span>
      {openDropdown && children}
    </div>
  );
};

export default NavItem;
