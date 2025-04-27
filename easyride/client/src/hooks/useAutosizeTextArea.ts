import { useEffect, RefObject } from "react";

export function useAutosizeTextArea(
  textAreaRef: RefObject<HTMLTextAreaElement>,
  value: string
) {
  useEffect(() => {
    const ta = textAreaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    }
  }, [value]);
}
