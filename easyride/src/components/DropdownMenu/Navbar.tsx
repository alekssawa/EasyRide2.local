import React, { useState, useRef } from "react";

import NavItem from "@/components/DropdownMenu/NavItem";
import DropdownItem from "./DropdownItem";
import Dropdown from "./Dropdown";

import styles from "@/components/DropdownMenu/DropdownMenu.module.css";

import { signOut } from "next-auth/react";

interface NavbarProps {
  username?: string;
}

const Navbar: React.FC<NavbarProps> = ({ username }) => {
  const [dropdownHeight] = useState<number | "auto">("auto");

  const nodeRefMain = useRef<HTMLDivElement>(null);

  return (
    <NavItem icon={<span className="username">{username}</span>}>
      <Dropdown dropdownHeight={dropdownHeight}>
        {/* Primary Dropdown */}

        <div className={styles.primaryDropdownMenu} ref={nodeRefMain}>
          <DropdownItem onClick={() => (window.location.href = "/Profile")}>
            <span>
              <span className={styles.dropdownItemText}>Profile</span>
            </span>
          </DropdownItem>

          <DropdownItem onClick={() => (window.location.href = "/MyOrder")}>
            <span>
              <span className={styles.dropdownItemText}>MyOrder</span>
            </span>
          </DropdownItem>

          <DropdownItem onClick={() => (window.location.href = "/MyHistory")}>
            <span>
              <span className={styles.dropdownItemText}>MyHistory</span>
            </span>
          </DropdownItem>

          <DropdownItem onClick={() => signOut()}>
            <span>
              <span className={styles.dropdownItemText}>Log Out</span>
            </span>
          </DropdownItem>
        </div>
      </Dropdown>
    </NavItem>
  );
};

export default Navbar;
