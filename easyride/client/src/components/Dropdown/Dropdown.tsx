import { useEffect, useState, useRef, ReactNode } from "react";
import DropdownButton from "../DropdownButton/DropdownButton";
import DropdownContent from "../DropdownContent/DropdownContent";
import "./Dropdown.css";

interface DropdownProps {
  buttonText: ReactNode;
  content: ReactNode;
}

const Dropdown = ({ buttonText, content }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const [dropdownTop, setDropdownTop] = useState<number | null>(0);
  const [buttonWidth, setButtonWidth] = useState<number>(0);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    if (!open) {
      const spaceRemaining =
        window.innerHeight - (buttonRef.current?.getBoundingClientRect().bottom || 0);
      const contentHeight = contentRef.current?.clientHeight || 0;

      const topPosition =
        spaceRemaining > contentHeight
          ? null
          : -(contentHeight - spaceRemaining);

      setDropdownTop(topPosition);
    }

    setOpen((prev) => !prev);
  };

  useEffect(() => {
    if (buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth); // Устанавливаем ширину кнопки
      // console.log("Button width:", buttonRef.current.offsetWidth); // Лог для проверки
    }
  }, [open]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handler);
    return () => {
      document.removeEventListener("click", handler);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="dropdown">
      <DropdownButton ref={buttonRef} toggle={toggleDropdown} open={open}>
        {buttonText}
      </DropdownButton>
      <DropdownContent
        ref={contentRef}
        top={dropdownTop ?? undefined}
        open={open}
        buttonWidth={buttonWidth} // Передаем ширину кнопки
      >
        {content}
      </DropdownContent>
    </div>
  );
};

export default Dropdown;
