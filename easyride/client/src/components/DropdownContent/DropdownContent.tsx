import { forwardRef, ReactNode } from "react";
import "./DropdownContent.css";

interface DropdownContentProps {
  children: ReactNode;
  open?: boolean;
  top?: number;
}

const DropdownContent = forwardRef<HTMLDivElement, DropdownContentProps>(
  ({ children, open, top }, ref) => {
    return (
      <div
        className={`dropdown-content ${open ? "content-open" : ""}`}
        style={{ top: top !== undefined ? `${top}px` : "100%" }}
        ref={ref}
      >
        {children}
      </div>
    );
  }
);

// Чтобы избежать предупреждений в dev-режиме
DropdownContent.displayName = "DropdownContent";

export default DropdownContent;
